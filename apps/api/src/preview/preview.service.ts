// Builds the PreviewPortalData payload for a single token.
//
// Pure projection: takes the prospect's intake answers + appointment status,
// returns the cards/timeline the unauth preview portal will render. No DB
// writes beyond view-count bumps.

import { Injectable, NotFoundException, GoneException } from '@nestjs/common'
import { createHash } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { PreviewPortalData, IntakeAnswers } from '@gitsols/types'
import { COMPANY, getIndustryBySlug } from '@gitsols/constants'
import { DatabaseService } from '../database/database.service'
import { previewTokens } from '../database/schema/preview-tokens'
import { prospects, type DbProspect } from '../database/schema/prospects'
import { auditAppointments, type DbAuditAppointment } from '../database/schema/audit-appointments'

@Injectable()
export class PreviewService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Looks up a token, validates expiry/revocation, bumps view count, and
   * returns the projected portal data.
   */
  async getByToken(
    token: string,
    visitor: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<PreviewPortalData> {
    const row = await this.db.db.query.previewTokens.findFirst({
      where: eq(previewTokens.token, token),
    })
    if (!row) throw new NotFoundException('Preview not found')
    if (row.revokedAt) throw new GoneException('Preview link has been revoked')
    if (row.expiresAt.getTime() < Date.now()) {
      throw new GoneException('Preview link has expired')
    }

    const prospect = await this.db.db.query.prospects.findFirst({
      where: eq(prospects.id, row.prospectId),
    })
    if (!prospect) throw new NotFoundException('Prospect not found')

    const appointment = await this.db.db.query.auditAppointments.findFirst({
      where: eq(auditAppointments.prospectId, prospect.id),
    })

    // Best-effort view tracking — never block the response on it.
    void this.recordView(row.id, visitor).catch(() => {
      // no-op; we already returned the payload
    })

    return this.project(prospect, appointment ?? null, row.expiresAt)
  }

  private async recordView(
    tokenRowId: string,
    visitor: { ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const fingerprint = visitor.ipAddress
      ? createHash('sha256')
          .update(`${visitor.ipAddress}|${visitor.userAgent ?? ''}`)
          .digest('hex')
      : null
    await this.db.db
      .update(previewTokens)
      .set({
        lastViewedAt: new Date(),
        // increment in SQL would be ideal; for Phase 1.5 a read-then-write
        // is fine — preview pages are low-frequency.
      })
      .where(eq(previewTokens.id, tokenRowId))
    if (fingerprint) {
      await this.db.db
        .update(previewTokens)
        .set({ fingerprintHash: fingerprint })
        .where(eq(previewTokens.id, tokenRowId))
    }
  }

  private project(
    prospect: DbProspect,
    appointment: DbAuditAppointment | null,
    expiresAt: Date,
  ): PreviewPortalData {
    const answers = (prospect.intakePayload ?? {}) as Partial<IntakeAnswers>

    const firstName = prospect.name.split(/\s+/)[0] ?? prospect.name

    return {
      prospect: {
        firstName,
        companyName: prospect.companyName,
        industry: prospect.industry ?? undefined,
        role: prospect.role ?? undefined,
      },
      audit: {
        status: appointment?.status === 'scheduled'
          ? 'scheduled'
          : appointment?.status === 'completed'
            ? 'completed'
            : 'requested',
        requestedWindows: appointment?.requestedWindows ?? undefined,
        scheduledFor: appointment?.scheduledFor?.toISOString(),
        durationMinutes: appointment?.durationMinutes ?? 60,
        joinUrl: appointment?.joinUrl ?? undefined,
      },
      auditFocus: buildAuditFocus(answers, prospect.industry ?? undefined),
      engagementPreview: buildEngagementPreview(appointment),
      matchedCaseStudySlug: matchCaseStudy(prospect.industry ?? undefined),
      directContact: {
        name: COMPANY.founder,
        email: COMPANY.email,
        phone: COMPANY.phone,
      },
      expiresAt: expiresAt.toISOString(),
    }
  }
}

// ─── Projection helpers ───────────────────────────────────────────────────

function buildAuditFocus(
  answers: Partial<IntakeAnswers>,
  industrySlug: string | undefined,
): PreviewPortalData['auditFocus'] {
  const items: PreviewPortalData['auditFocus'] = []

  // Industry-driven defaults
  const industry = industrySlug ? getIndustryBySlug(industrySlug) : undefined
  if (industry?.slug === 'healthcare') {
    items.push({
      icon: 'ScrollText',
      title: 'HIPAA Security Rule posture',
      body: 'Risk assessment, safeguards (administrative, physical, technical), BAA inventory, OCR-style audit prep.',
      framework: 'HIPAA §164.308',
    })
  } else if (industry?.slug === 'financial-services') {
    items.push({
      icon: 'Landmark',
      title: 'NYDFS 23 NYCRR 500 readiness',
      body: 'CISO function, MFA, encryption, third-party risk, incident response — mapped to the controls regulators expect to see.',
      framework: 'NYDFS Part 500',
    })
  }

  // Identity posture
  if (answers.identityPlatform || answers.mfaCoveragePercent != null) {
    items.push({
      icon: 'ShieldCheck',
      title: 'Identity & MFA coverage',
      body:
        answers.mfaCoveragePercent != null
          ? `You estimated ${answers.mfaCoveragePercent}% MFA coverage today — we'll validate the gap and recommend conditional-access policies that close it.`
          : `We'll inventory your identity platform, MFA enforcement, conditional access, and privileged-account isolation.`,
    })
  }

  // Endpoint / EDR
  if (answers.endpointCount != null) {
    items.push({
      icon: 'Server',
      title: 'Endpoint posture',
      body: `Across ~${answers.endpointCount} endpoints we'll check EDR coverage, patch latency, encryption, and mobile device management.`,
    })
  }

  // Backup
  if (answers.backupVendor || answers.lastRestoreDrill) {
    items.push({
      icon: 'Cloud',
      title: 'Backup & recovery',
      body:
        answers.lastRestoreDrill === 'never'
          ? 'You mentioned no formal restore test — we will recommend a quarterly drill cadence and make the next one auditable.'
          : 'We will validate RPO/RTO, immutability, and last documented restore drill.',
    })
  }

  // Prompts-driven adds
  if (answers.prompts?.includes('insurance_renewal')) {
    items.push({
      icon: 'Lock',
      title: 'Cyber-insurance attestations',
      body: 'We will map your current controls against the typical insurance questionnaire so renewal stops being a fire drill.',
    })
  }
  if (answers.prompts?.includes('recent_incident')) {
    items.push({
      icon: 'AlertTriangle',
      title: 'Incident post-mortem',
      body: 'We will reconstruct the timeline of the recent event, validate containment, and identify the next two highest-impact preventive steps.',
    })
  }

  // Always include this anchor
  items.push({
    icon: 'ClipboardList',
    title: 'Findings & remediation roadmap',
    body: 'You will leave the call with a written, risk-ranked punch list — high / medium / low — and estimated effort for the top three fixes.',
  })

  return items.slice(0, 6)
}

function buildEngagementPreview(
  appointment: DbAuditAppointment | null,
): PreviewPortalData['engagementPreview'] {
  const nextLabel =
    appointment?.status === 'scheduled' && appointment.scheduledFor
      ? `Confirmed for ${appointment.scheduledFor.toISOString().slice(0, 10)}`
      : 'Awaiting confirmation'

  return [
    {
      number: 1,
      title: 'Discovery',
      description:
        'Free 60-minute audit. We document your environment, identify gaps, and hand you a written report.',
      status: 'next',
      eta: nextLabel,
    },
    {
      number: 2,
      title: 'Findings & SoW',
      description:
        'You receive the audit report and a milestoned proposal generated from the findings.',
      status: 'upcoming',
    },
    {
      number: 3,
      title: 'Kickoff',
      description:
        'On signature, your client portal opens. PM walks the milestone plan, intros the team, sets the cadence.',
      status: 'upcoming',
    },
    {
      number: 4,
      title: 'Execution',
      description:
        'Milestones run in your portal — status, evidence, deliverables visible live. Each milestone closes with your sign-off.',
      status: 'upcoming',
    },
    {
      number: 5,
      title: 'Ongoing operations',
      description:
        'Monthly reports, ticket SLA tracking, quarterly business reviews. Your portal stays the single source of truth.',
      status: 'upcoming',
    },
  ]
}

function matchCaseStudy(industrySlug: string | undefined): string | undefined {
  if (industrySlug === 'healthcare') return 'regional-medical-group-modernization'
  return undefined
}
