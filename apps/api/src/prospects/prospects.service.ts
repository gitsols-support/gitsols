// Prospects service — owns:
//   1. Inserting the prospect row (denormalizing key intake fields).
//   2. Creating a paired audit_appointment in 'requested' status.
//   3. Minting a preview_token with 30-day TTL.
//   4. Firing the new-prospect notification email (fire-and-forget).
//
// One transaction wraps the three inserts so a failure leaves no orphans.

import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { randomBytes } from 'node:crypto'
import { DatabaseService } from '../database/database.service'
import {
  prospects,
  type DbProspect,
  type NewDbProspect,
} from '../database/schema/prospects'
import {
  previewTokens,
  type DbPreviewToken,
} from '../database/schema/preview-tokens'
import { auditAppointments } from '../database/schema/audit-appointments'
import { MailerService } from '../mailer/mailer.service'
import { mailerConfig } from '../mailer/mailer.config'
import { buildProspectNotification } from '../mailer/templates/prospect-notification'

const PREVIEW_TOKEN_TTL_DAYS = 30

export interface CreateProspectResult {
  prospect: DbProspect
  previewToken: DbPreviewToken
}

@Injectable()
export class ProspectsService {
  private readonly logger = new Logger(ProspectsService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly mailer: MailerService,
    @Inject(mailerConfig.KEY)
    private readonly mailCfg: ConfigType<typeof mailerConfig>,
  ) {}

  async create(input: NewDbProspect): Promise<CreateProspectResult> {
    const expiresAt = new Date(
      Date.now() + PREVIEW_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    )
    const tokenValue = generateToken()

    const result = await this.db.db.transaction(async (tx) => {
      const [prospect] = await tx.insert(prospects).values(input).returning()
      if (!prospect) throw new Error('Prospect insert returned no row')

      // Pair the prospect with a pending appointment so admin sees the
      // requested windows immediately.
      const requestedWindows = extractRequestedWindows(input.intakePayload)
      await tx.insert(auditAppointments).values({
        prospectId: prospect.id,
        status: 'requested',
        requestedWindows,
      })

      const [token] = await tx
        .insert(previewTokens)
        .values({
          token: tokenValue,
          prospectId: prospect.id,
          expiresAt,
        })
        .returning()
      if (!token) throw new Error('Preview token insert returned no row')

      return { prospect, previewToken: token }
    })

    this.logger.log(
      {
        prospectId: result.prospect.id,
        flow: result.prospect.intakeFlow,
        industry: result.prospect.industry,
        topPriority: result.prospect.topPriority,
      },
      'prospect.created',
    )

    // Notify ops — fire-and-forget, never block the request.
    void this.notify(result.prospect).catch((err) => {
      this.logger.error(
        { err, prospectId: result.prospect.id },
        'prospect.notify_failed',
      )
    })

    return result
  }

  private async notify(prospect: DbProspect): Promise<void> {
    if (!this.mailCfg.leadNotificationTo) return
    const { subject, text, html } = buildProspectNotification(prospect)
    await this.mailer.send({
      to: this.mailCfg.leadNotificationTo,
      replyTo: prospect.email,
      subject,
      text,
      html,
      tag: `prospect:${prospect.intakeFlow}`,
    })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function generateToken(): string {
  // 24 bytes → 32 url-safe base64 chars. Plenty of entropy, fits in a URL.
  return randomBytes(24)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function extractRequestedWindows(payload: unknown): string[] | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const pw = (payload as Record<string, unknown>).preferredWindows
  if (!Array.isArray(pw)) return undefined
  return pw.filter((v): v is string => typeof v === 'string')
}
