// Wire-level DTOs for NOC endpoints. Validated with Zod via the same pipe
// the prospects/leads modules use.

import { z } from 'zod'

// ─── Enrollment ───────────────────────────────────────────────────────────

const osFamilyEnum = z.enum([
  'windows',
  'macos',
  'linux',
  'ios',
  'android',
  'network_os',
  'unknown',
])

export const nocEnrollmentSchema = z.object({
  enrollmentToken: z.string().min(20).max(128),
  publicKey: z.string().min(40).max(512),
  publicKeyFingerprint: z.string().regex(/^[a-f0-9]{32,128}$/i),
  hostname: z.string().min(1).max(255),
  fqdn: z.string().min(1).max(255).optional(),
  osFamily: osFamilyEnum,
  osVersion: z.string().max(128).optional(),
  agentVersion: z.string().min(1).max(32),
  agentBinaryHash: z.string().regex(/^[a-f0-9]{64}$/i),
})

export type NocEnrollmentDto = z.infer<typeof nocEnrollmentSchema>

// ─── Heartbeat ────────────────────────────────────────────────────────────

const checkResultSchema = z.object({
  checkSlug: z.string().min(1).max(96),
  status: z.enum(['pass', 'warn', 'fail', 'error', 'skipped']),
  value: z.record(z.string(), z.unknown()).optional(),
  message: z.string().max(2048).optional(),
  durationMs: z.number().int().nonnegative().max(60 * 60 * 1000).optional(),
})

const snapshotSchema = z.object({
  hostname: z.string().min(1).max(255),
  fqdn: z.string().min(1).max(255).optional(),
  osFamily: osFamilyEnum,
  osVersion: z.string().max(128).optional(),
  cpuPct: z.number().min(0).max(100).optional(),
  memTotalMb: z.number().int().nonnegative().optional(),
  memUsedMb: z.number().int().nonnegative().optional(),
  diskTotalGb: z.number().nonnegative().optional(),
  diskUsedGb: z.number().nonnegative().optional(),
  uptimeSec: z.number().int().nonnegative().optional(),
  loggedInUserHash: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
})

export const nocHeartbeatSchema = z.object({
  endpointId: z.string().uuid(),
  agentVersion: z.string().min(1).max(32),
  agentBinaryHash: z.string().regex(/^[a-f0-9]{64}$/i),
  sentAt: z.string().datetime({ offset: true }),
  nonce: z.string().regex(/^[a-f0-9]{32,64}$/i),
  results: z.array(checkResultSchema).max(200),
  snapshot: snapshotSchema.optional(),
})

export type NocHeartbeatDto = z.infer<typeof nocHeartbeatSchema>

// ─── Admin DTOs (configurator, runbook editor) ────────────────────────────

export const nocConfigUpsertSchema = z.object({
  clientId: z.string().uuid(),
  checkDefinitionId: z.string().uuid(),
  enabled: z.boolean(),
  overrideSeverity: z.enum(['info', 'warn', 'critical']).optional(),
  overrideScheduleMinutes: z.number().int().min(1).max(1440 * 7).optional(),
  thresholdOverrides: z.record(z.string(), z.unknown()).optional(),
  runbookSlug: z.string().max(128).optional(),
  scopeTags: z.array(z.string().max(48)).max(16).optional(),
})

export type NocConfigUpsertDto = z.infer<typeof nocConfigUpsertSchema>

export const nocRunbookUpsertSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(96)
    .regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  clientId: z.string().uuid().optional(),
  audience: z.enum(['internal', 'client_visible', 'both']),
  category: z
    .enum([
      'encryption',
      'patching',
      'identity',
      'edr_av',
      'backup',
      'network',
      'lob_app',
      'compliance',
      'inventory',
      'custom',
    ])
    .optional(),
  attachedTo: z.string().max(96).optional(),
  bodyMd: z.string().min(1).max(64 * 1024),
  changeNote: z.string().max(500).optional(),
})

export type NocRunbookUpsertDto = z.infer<typeof nocRunbookUpsertSchema>

export const nocAlertActionSchema = z.object({
  alertId: z.string().uuid(),
  action: z.enum(['acknowledge', 'resolve', 'suppress']),
  note: z.string().max(2000).optional(),
})

export type NocAlertActionDto = z.infer<typeof nocAlertActionSchema>
