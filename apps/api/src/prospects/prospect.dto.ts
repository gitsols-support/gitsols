// Zod schema for POST /prospects. Discriminated by `flow` so the audit and
// bespoke intakes can carry different answer shapes while sharing the same
// envelope (intakeVersion, sourceUrl, attribution).

import { z } from 'zod'
import type { CreateProspectRequest } from '@gitsols/types'
import {
  INTAKE_PROMPTS,
  INTAKE_PRIORITIES,
  INDUSTRY_SLUGS,
  PROJECT_KINDS,
  TARGET_USERS,
  USER_COUNT_BANDS,
  PLATFORMS,
  DATA_SENSITIVITY_LEVELS,
  PROJECT_STATES,
  LAUNCH_WINDOWS,
  BUDGET_BANDS,
  OWNERSHIP_OPTIONS,
} from '@gitsols/constants'

const isoDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Expected ISO-8601 datetime')

const oneOf = (list: readonly { value: string }[]) =>
  z.string().refine((v) => list.some((o) => o.value === v), { message: 'Unknown value' })

// ─── Audit intake (free_audit + service_inquiry) ──────────────────────────

const auditAnswersSchema = z
  .object({
    companyName: z.string().trim().min(1).max(200),
    industry: z
      .string()
      .trim()
      .refine((v) => (INDUSTRY_SLUGS as readonly string[]).includes(v), {
        message: 'Unknown industry slug',
      })
      .optional(),
    employeeCount: z.coerce.number().int().min(1).max(1_000_000).optional(),
    officeCount: z.coerce.number().int().min(1).max(10_000).optional(),

    identityPlatform: z.enum(['m365', 'google', 'both', 'neither', 'unsure']).optional(),
    endpointCount: z.coerce.number().int().min(0).max(1_000_000).optional(),
    lobApp: z.string().trim().max(200).optional(),
    backupVendor: z.string().trim().max(200).optional(),
    lastRestoreDrill: z
      .enum(['within_3m', 'within_12m', 'over_12m', 'never', 'unsure'])
      .optional(),
    mfaCoveragePercent: z.coerce.number().int().min(0).max(100).optional(),

    prompts: z.array(oneOf(INTAKE_PROMPTS)).max(9).optional(),
    topPriorities: z.array(oneOf(INTAKE_PRIORITIES)).max(3).optional(),

    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().min(7).max(40).optional(),
    role: z.string().trim().max(120).optional(),
    preferredWindows: z.array(isoDateTime).max(3).optional(),
    notesForCall: z.string().trim().max(5000).optional(),
  })
  .strict()

// ─── Bespoke scope ────────────────────────────────────────────────────────

const bespokeScopeAnswersSchema = z
  .object({
    companyName: z.string().trim().min(1).max(200),
    projectKind: oneOf(PROJECT_KINDS).optional(),
    projectVision: z.string().trim().min(1).max(500),
    problemStatement: z.string().trim().max(5000).optional(),

    targetUsers: oneOf(TARGET_USERS).optional(),
    userCountBand: oneOf(USER_COUNT_BANDS).optional(),
    platforms: z.array(oneOf(PLATFORMS)).max(5).optional(),
    mustHaveIntegrations: z.string().trim().max(2000).optional(),
    dataSensitivity: oneOf(DATA_SENSITIVITY_LEVELS).optional(),
    projectState: oneOf(PROJECT_STATES).optional(),

    launchWindow: oneOf(LAUNCH_WINDOWS).optional(),
    budgetBand: oneOf(BUDGET_BANDS).optional(),
    successMetric: z.string().trim().max(2000).optional(),
    hasDesignAssets: z.boolean().optional(),
    ownership: oneOf(OWNERSHIP_OPTIONS).optional(),

    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().min(7).max(40).optional(),
    role: z.string().trim().max(120).optional(),
    referredBy: z.string().trim().max(200).optional(),
    notesForCall: z.string().trim().max(5000).optional(),
  })
  .strict()

// ─── Marketing scope (permissive for v1) ──────────────────────────────────

const marketingScopeAnswersSchema = z.record(z.string(), z.unknown())

// ─── Envelope (discriminated) ─────────────────────────────────────────────

const baseEnvelope = {
  intakeVersion: z.string().trim().min(1).max(32),
  sourceUrl: z.string().trim().url().max(2000).optional(),
  attribution: z.record(z.string(), z.string()).optional(),
}

export const createProspectSchema = z.discriminatedUnion('flow', [
  z.object({
    flow: z.literal('free_audit'),
    ...baseEnvelope,
    answers: auditAnswersSchema,
  }),
  z.object({
    flow: z.literal('service_inquiry'),
    ...baseEnvelope,
    answers: auditAnswersSchema,
  }),
  z.object({
    flow: z.literal('bespoke_scope'),
    ...baseEnvelope,
    answers: bespokeScopeAnswersSchema,
  }),
  z.object({
    flow: z.literal('marketing_scope'),
    ...baseEnvelope,
    answers: marketingScopeAnswersSchema,
  }),
])

export type CreateProspectDto = z.infer<typeof createProspectSchema>

// Compile-time sanity: Zod output assignable to shared type.
const _check: CreateProspectRequest = {} as unknown as CreateProspectDto
void _check
