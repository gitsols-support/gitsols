// NOC service — owns the business logic behind ingest, enrollment, and the
// admin/portal reads.
//
// Phase 2 scope: we persist heartbeats, snap per-check results into the
// latest grid, and open/close alerts based on the result delta. The
// runtime queries here intentionally keep transaction boundaries narrow —
// the ingest path must stay sub-50ms p95 even when a single agent posts a
// 200-result batch.

import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomBytes, createHash } from 'node:crypto'
import { and, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import {
  nocAlerts,
  nocCheckDefinitions,
  nocClientConfigs,
  nocEndpointResults,
  nocEndpoints,
  nocEnrollmentTokens,
  nocHeartbeats,
  nocRunbooks,
  nocRunbookVersions,
  type DbNocCheckDefinition,
  type DbNocEndpoint,
  type DbNocRunbook,
  type NewDbNocAlert,
  type NewDbNocEndpoint,
  type NewDbNocEndpointResult,
  type NewDbNocHeartbeat,
} from '../database/schema/noc'
import type {
  NocAgentConfig,
  NocAlertSummary,
  NocCheckResult,
  NocEndpointSummary,
  NocFleetRollup,
  NocHeartbeatPayload,
  NocRunbookSummary,
} from '@gitsols/types'
import type { NocEnrollmentDto, NocRunbookUpsertDto } from './noc.dto'

const ENROLLMENT_TOKEN_TTL_MS = 60 * 60 * 1000 // 60 minutes

@Injectable()
export class NocService {
  private readonly logger = new Logger(NocService.name)

  constructor(private readonly db: DatabaseService) {}

  // ──── Enrollment ────────────────────────────────────────────────────────

  /**
   * Issue a one-time enrollment token for a client. Returns the cleartext
   * — the DB stores only the SHA-256.
   */
  async issueEnrollmentToken(
    clientId: string,
    opts: { intendedHostname?: string; createdBy?: string } = {},
  ): Promise<{ token: string; expiresAt: Date }> {
    const cleartext = randomBytes(16).toString('base64url')
    const tokenHash = sha256Hex(cleartext)
    const expiresAt = new Date(Date.now() + ENROLLMENT_TOKEN_TTL_MS)

    await this.db.db.insert(nocEnrollmentTokens).values({
      clientId,
      tokenHash,
      intendedHostname: opts.intendedHostname,
      expiresAt,
      createdBy: opts.createdBy,
    })

    return { token: cleartext, expiresAt }
  }

  async consumeEnrollment(
    dto: NocEnrollmentDto,
  ): Promise<{ endpoint: DbNocEndpoint; config: NocAgentConfig }> {
    const tokenHash = sha256Hex(dto.enrollmentToken)

    return this.db.db.transaction(async (tx) => {
      const [token] = await tx
        .select()
        .from(nocEnrollmentTokens)
        .where(eq(nocEnrollmentTokens.tokenHash, tokenHash))
        .limit(1)

      if (!token) throw new NotFoundException('Invalid enrollment token')
      if (token.consumedAt) throw new NotFoundException('Token already used')
      if (token.expiresAt.getTime() < Date.now())
        throw new NotFoundException('Token expired')

      const [endpoint] = await tx
        .insert(nocEndpoints)
        .values({
          clientId: token.clientId,
          hostname: dto.hostname,
          fqdn: dto.fqdn,
          osFamily: dto.osFamily,
          osVersion: dto.osVersion,
          publicKey: dto.publicKey,
          publicKeyFingerprint: dto.publicKeyFingerprint,
          agentVersion: dto.agentVersion,
          agentBinaryHash: dto.agentBinaryHash,
          status: 'healthy',
          enrolledAt: new Date(),
        } satisfies NewDbNocEndpoint)
        .returning()
      if (!endpoint) throw new Error('Endpoint insert returned no row')

      await tx
        .update(nocEnrollmentTokens)
        .set({ consumedAt: new Date(), consumedByEndpointId: endpoint.id })
        .where(eq(nocEnrollmentTokens.id, token.id))

      const config = await this.buildAgentConfigForClient(
        tx as unknown as typeof this.db.db,
        token.clientId,
        endpoint.osFamily,
      )

      this.logger.log(
        { endpointId: endpoint.id, clientId: token.clientId },
        'noc.endpoint.enrolled',
      )

      return { endpoint, config }
    })
  }

  // ──── Ingest ────────────────────────────────────────────────────────────

  async ingestHeartbeat(opts: {
    payload: NocHeartbeatPayload
    signatureValid: boolean
    sourceIp?: string
  }): Promise<{ accepted: boolean; openedAlerts: number }> {
    const { payload, signatureValid, sourceIp } = opts

    const [endpoint] = await this.db.db
      .select()
      .from(nocEndpoints)
      .where(eq(nocEndpoints.id, payload.endpointId))
      .limit(1)
    if (!endpoint) {
      this.logger.warn({ endpointId: payload.endpointId }, 'noc.hb.unknown_endpoint')
      return { accepted: false, openedAlerts: 0 }
    }

    const result = await this.db.db.transaction(async (tx) => {
      // 1. Append the heartbeat (unique index on (endpointId, nonce) rejects replays).
      await tx.insert(nocHeartbeats).values({
        endpointId: endpoint.id,
        clientId: endpoint.clientId,
        agentSentAt: new Date(payload.sentAt),
        agentVersion: payload.agentVersion,
        agentBinaryHash: payload.agentBinaryHash,
        nonce: payload.nonce,
        signatureValid,
        sourceIp,
        payload: payload as unknown as Record<string, unknown>,
      } satisfies NewDbNocHeartbeat)

      // 2. Map check slugs to definition IDs once.
      const slugs = payload.results.map((r) => r.checkSlug)
      const defs = slugs.length
        ? await tx
            .select()
            .from(nocCheckDefinitions)
            .where(inArray(nocCheckDefinitions.slug, slugs))
        : []
      const defBySlug = new Map(defs.map((d) => [d.slug, d]))

      // 3. Demote previous "latest" rows for these checks on this endpoint.
      if (defs.length) {
        await tx
          .update(nocEndpointResults)
          .set({ isLatest: false })
          .where(
            and(
              eq(nocEndpointResults.endpointId, endpoint.id),
              inArray(
                nocEndpointResults.checkDefinitionId,
                defs.map((d) => d.id),
              ),
              eq(nocEndpointResults.isLatest, true),
            ),
          )
      }

      // 4. Insert new latest results.
      let opened = 0
      for (const r of payload.results) {
        const def = defBySlug.get(r.checkSlug)
        if (!def) continue
        const severity = def.defaultSeverity
        const row: NewDbNocEndpointResult = {
          endpointId: endpoint.id,
          clientId: endpoint.clientId,
          checkDefinitionId: def.id,
          status: r.status,
          severity,
          observedAt: new Date(),
          value: r.value,
          message: r.message,
          isLatest: true,
        }
        await tx.insert(nocEndpointResults).values(row)

        // 5. Open an alert on fail/error (idempotent via dedupKey + unique index).
        if (r.status === 'fail' || r.status === 'error') {
          const dedupKey = `${endpoint.id}:${def.id}`
          try {
            await tx.insert(nocAlerts).values({
              clientId: endpoint.clientId,
              endpointId: endpoint.id,
              checkDefinitionId: def.id,
              severity,
              status: 'open',
              title: def.name,
              summary: r.message ?? null,
              runbookSlug: def.defaultRunbookSlug ?? null,
              dedupKey,
            } satisfies NewDbNocAlert)
            opened += 1
          } catch {
            // unique violation = already open; that's fine
          }
        } else if (r.status === 'pass') {
          // Auto-resolve any open alert for this (endpoint, check).
          await tx
            .update(nocAlerts)
            .set({ status: 'resolved', resolvedAt: new Date() })
            .where(
              and(
                eq(nocAlerts.dedupKey, `${endpoint.id}:${def.id}`),
                eq(nocAlerts.status, 'open'),
              ),
            )
        }
      }

      // 6. Update endpoint last-seen + rolled-up status.
      const rollupStatus = deriveEndpointStatus(payload.results)
      await tx
        .update(nocEndpoints)
        .set({
          lastHeartbeatAt: new Date(),
          status: rollupStatus,
          agentVersion: payload.agentVersion,
          agentBinaryHash: payload.agentBinaryHash,
          lastIngressIp: sourceIp,
          updatedAt: new Date(),
        })
        .where(eq(nocEndpoints.id, endpoint.id))

      return { opened }
    })

    return { accepted: true, openedAlerts: result.opened }
  }

  // ──── Admin reads ───────────────────────────────────────────────────────

  async listEndpoints(clientId?: string): Promise<NocEndpointSummary[]> {
    const rows = await this.db.db
      .select()
      .from(nocEndpoints)
      .where(clientId ? eq(nocEndpoints.clientId, clientId) : sql`true`)
      .orderBy(desc(nocEndpoints.lastHeartbeatAt))

    // Roll up pass/warn/fail counts per endpoint from latest results.
    const ids = rows.map((r) => r.id)
    const counts =
      ids.length === 0
        ? []
        : await this.db.db
            .select({
              endpointId: nocEndpointResults.endpointId,
              status: nocEndpointResults.status,
              total: sql<number>`count(*)::int`,
            })
            .from(nocEndpointResults)
            .where(
              and(
                inArray(nocEndpointResults.endpointId, ids),
                eq(nocEndpointResults.isLatest, true),
              ),
            )
            .groupBy(nocEndpointResults.endpointId, nocEndpointResults.status)

    const counted = new Map<
      string,
      { pass: number; warn: number; fail: number }
    >()
    for (const c of counts) {
      const v = counted.get(c.endpointId) ?? { pass: 0, warn: 0, fail: 0 }
      if (c.status === 'pass') v.pass = c.total
      else if (c.status === 'warn') v.warn = c.total
      else if (c.status === 'fail' || c.status === 'error') v.fail += c.total
      counted.set(c.endpointId, v)
    }

    return rows.map(
      (r): NocEndpointSummary => ({
        id: r.id,
        clientId: r.clientId,
        hostname: r.hostname,
        displayName: r.displayName ?? undefined,
        kind: r.kind,
        osFamily: r.osFamily,
        osVersion: r.osVersion ?? undefined,
        status: r.status,
        lastHeartbeatAt: r.lastHeartbeatAt?.toISOString(),
        passCount: counted.get(r.id)?.pass ?? 0,
        warnCount: counted.get(r.id)?.warn ?? 0,
        failCount: counted.get(r.id)?.fail ?? 0,
        agentVersion: r.agentVersion ?? undefined,
        tags: (r.tags as string[] | null) ?? [],
      }),
    )
  }

  async fleetRollup(clientId?: string): Promise<NocFleetRollup> {
    const rows = await this.listEndpoints(clientId)
    const openAlertsRows = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(nocAlerts)
      .where(
        and(
          eq(nocAlerts.status, 'open'),
          clientId ? eq(nocAlerts.clientId, clientId) : sql`true`,
        ),
      )
    return {
      total: rows.length,
      healthy: rows.filter((r) => r.status === 'healthy').length,
      warning: rows.filter((r) => r.status === 'warning').length,
      critical: rows.filter((r) => r.status === 'critical').length,
      offline: rows.filter((r) => r.status === 'offline').length,
      openAlerts: openAlertsRows[0]?.count ?? 0,
      lastHeartbeatAt: rows[0]?.lastHeartbeatAt,
    }
  }

  async listOpenAlerts(clientId?: string, limit = 50): Promise<NocAlertSummary[]> {
    const rows = await this.db.db
      .select({
        a: nocAlerts,
        host: nocEndpoints.hostname,
        slug: nocCheckDefinitions.slug,
      })
      .from(nocAlerts)
      .innerJoin(nocEndpoints, eq(nocEndpoints.id, nocAlerts.endpointId))
      .innerJoin(
        nocCheckDefinitions,
        eq(nocCheckDefinitions.id, nocAlerts.checkDefinitionId),
      )
      .where(
        and(
          eq(nocAlerts.status, 'open'),
          clientId ? eq(nocAlerts.clientId, clientId) : sql`true`,
        ),
      )
      .orderBy(desc(nocAlerts.openedAt))
      .limit(limit)

    return rows.map(
      ({ a, host, slug }): NocAlertSummary => ({
        id: a.id,
        clientId: a.clientId,
        endpointId: a.endpointId,
        endpointHostname: host,
        checkSlug: slug,
        severity: a.severity,
        status: a.status,
        title: a.title,
        summary: a.summary ?? undefined,
        runbookSlug: a.runbookSlug ?? undefined,
        openedAt: a.openedAt.toISOString(),
        acknowledgedAt: a.acknowledgedAt?.toISOString(),
        resolvedAt: a.resolvedAt?.toISOString(),
      }),
    )
  }

  // ──── Runbooks ──────────────────────────────────────────────────────────

  async listRunbooks(clientId?: string): Promise<NocRunbookSummary[]> {
    const rows = await this.db.db
      .select()
      .from(nocRunbooks)
      .where(
        clientId
          ? or(eq(nocRunbooks.clientId, clientId), isNull(nocRunbooks.clientId))
          : sql`true`,
      )
      .orderBy(desc(nocRunbooks.updatedAt))

    return rows.map(toRunbookSummary)
  }

  async upsertRunbook(
    dto: NocRunbookUpsertDto,
    actorId?: string,
  ): Promise<DbNocRunbook> {
    return this.db.db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(nocRunbooks)
        .where(
          and(
            eq(nocRunbooks.slug, dto.slug),
            dto.clientId
              ? eq(nocRunbooks.clientId, dto.clientId)
              : isNull(nocRunbooks.clientId),
          ),
        )
        .limit(1)

      if (existing) {
        const next = existing.currentVersion + 1
        const [updated] = await tx
          .update(nocRunbooks)
          .set({
            title: dto.title,
            summary: dto.summary,
            audience: dto.audience,
            category: dto.category,
            attachedTo: dto.attachedTo,
            bodyMd: dto.bodyMd,
            currentVersion: next,
            updatedAt: new Date(),
          })
          .where(eq(nocRunbooks.id, existing.id))
          .returning()

        await tx.insert(nocRunbookVersions).values({
          runbookId: existing.id,
          version: next,
          bodyMd: dto.bodyMd,
          changeNote: dto.changeNote,
          changedBy: actorId,
        })
        if (!updated) throw new Error('Runbook update returned no row')
        return updated
      }

      const [created] = await tx
        .insert(nocRunbooks)
        .values({
          slug: dto.slug,
          title: dto.title,
          summary: dto.summary,
          clientId: dto.clientId,
          audience: dto.audience,
          category: dto.category,
          attachedTo: dto.attachedTo,
          bodyMd: dto.bodyMd,
          currentVersion: 1,
          publishedAt: new Date(),
          createdBy: actorId,
        })
        .returning()
      if (!created) throw new Error('Runbook insert returned no row')

      await tx.insert(nocRunbookVersions).values({
        runbookId: created.id,
        version: 1,
        bodyMd: dto.bodyMd,
        changeNote: dto.changeNote ?? 'Initial revision',
        changedBy: actorId,
      })
      return created
    })
  }

  // ──── Agent config builder ──────────────────────────────────────────────

  private async buildAgentConfigForClient(
    tx: typeof this.db.db,
    clientId: string,
    osFamily: string,
  ): Promise<NocAgentConfig> {
    const defs = await tx.select().from(nocCheckDefinitions)
    const configs = await tx
      .select()
      .from(nocClientConfigs)
      .where(eq(nocClientConfigs.clientId, clientId))
    const cfgByDef = new Map(configs.map((c) => [c.checkDefinitionId, c]))

    const checks = defs
      .filter((d) => (d.appliesTo as string[]).includes(osFamily))
      .map((d) => {
        const c = cfgByDef.get(d.id)
        if (c?.enabled === false) return null
        return {
          slug: d.slug,
          severity: c?.overrideSeverity ?? d.defaultSeverity,
          scheduleMinutes:
            c?.overrideScheduleMinutes ?? d.defaultScheduleMinutes,
          thresholds: (c?.thresholdOverrides as Record<string, unknown>) ?? undefined,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)

    return { heartbeatIntervalMinutes: 60, checks }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

function deriveEndpointStatus(
  results: NocCheckResult[],
): 'healthy' | 'warning' | 'critical' {
  if (results.some((r) => r.status === 'fail' || r.status === 'error'))
    return 'critical'
  if (results.some((r) => r.status === 'warn')) return 'warning'
  return 'healthy'
}

function toRunbookSummary(r: DbNocRunbook): NocRunbookSummary {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary ?? undefined,
    audience: r.audience,
    category: r.category ?? undefined,
    attachedTo: r.attachedTo ?? undefined,
    clientId: r.clientId ?? undefined,
    currentVersion: r.currentVersion,
    updatedAt: r.updatedAt.toISOString(),
  }
}

// Reference (silences the unused-import linter for types we re-export).
export type { DbNocCheckDefinition }
