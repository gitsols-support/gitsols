// ─── GITSOLS platform shared types ─────────────────────────────────────────
//
// Add shared types as `export interface Foo { ... }` and they're available
// across apps/web and apps/api as `import { Foo } from '@gitsols/types'`.
//
// Conventions:
//   - One concept per file once this barrel grows past ~150 lines.
//   - Pure types and enums only — no runtime code.
//   - Avoid coupling types to a specific persistence layer.

export {}

// ─── CRM / Admin domain types (Phase 2) ────────────────────────────────────
// Accounts, contacts, opportunities, engagements, tickets, documents,
// service catalog, marketing/GHL, dashboard & reports. See `crm.ts`.
export * from './crm.js'
export * from './billing.js'
export * from './portal.js'

// ─── Roles ─────────────────────────────────────────────────────────────────
//
// Two role hierarchies that share the same JWT shape:
//
//   Internal (GITSOLS staff):  owner > admin > sales > pm > tech > readonly
//   External (client portal):  client_primary > client_user
//
// Internal roles see staff dashboards and may impersonate into a client
// portal. External roles only ever see their own Account's data.

export type InternalRole =
  | 'owner'      // Sohail — full access
  | 'admin'      // operations — RBAC + audit-log access
  | 'sales'      // CRM pipeline + opportunities
  | 'pm'         // engagement management, milestones, tickets
  | 'tech'       // execute milestones, ticket fulfillment
  | 'readonly'   // dashboards only

export type ClientRole =
  | 'client_primary'  // org admin — approves milestones, invites users
  | 'client_user'     // end user — files tickets, sees own data

export type Role = InternalRole | ClientRole

export const INTERNAL_ROLES: readonly InternalRole[] = [
  'owner',
  'admin',
  'sales',
  'pm',
  'tech',
  'readonly',
] as const

export const CLIENT_ROLES: readonly ClientRole[] = [
  'client_primary',
  'client_user',
] as const

export function isInternalRole(role: Role): role is InternalRole {
  return (INTERNAL_ROLES as readonly Role[]).includes(role)
}

export function isClientRole(role: Role): role is ClientRole {
  return (CLIENT_ROLES as readonly Role[]).includes(role)
}

// ─── Session & JWT ─────────────────────────────────────────────────────────
//
// `SessionUser` is what Auth.js stores in its session and what the web app
// passes to the API as a Bearer JWT. The Nest `JwtAuthGuard` validates the
// JWT signature and attaches a `SessionUser` to `req.user`.

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  /**
   * Set for client roles. Null for internal staff (who can scope by query
   * parameter when impersonating). Always non-null when role ∈ ClientRole.
   */
  accountId: string | null
}

export interface JwtPayload extends SessionUser {
  /** Issued-at, seconds since epoch. */
  iat: number
  /** Expires-at, seconds since epoch. */
  exp: number
  /** Issuer — should equal env.AUTH_ISSUER. */
  iss: string
}

// ─── User identity (DB row shape — kept loose for Phase 0) ─────────────────

export interface User {
  id: string
  email: string
  name: string
  /**
   * Phase 0 uses the legacy 'admin' | 'staff' | 'viewer' values from the
   * boilerplate stub. Phase 2 migrates these into the full Role union above.
   */
  role: UserRole
  createdAt: string
}

export type UserRole = 'admin' | 'staff' | 'viewer'

// ─── Leads (Phase 1 marketing site) ────────────────────────────────────────

export type LeadSource =
  | 'contact_form'
  | 'free_it_audit'
  | 'service_inquiry'
  | 'bespoke_scope_request'
  | 'phone'
  | 'referral'
  | 'other'

export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'converted' | 'junk'

/**
 * Shape POSTed to `/api/v1/leads` from the marketing site. Server-side it's
 * validated again with class-validator/Zod — this interface is the contract
 * the web app builds the form payload against.
 */
export interface CreateLeadRequest {
  name: string
  email: string
  phone?: string
  company?: string
  message?: string
  /** Slug of a service in @gitsols/constants SERVICES. */
  serviceInterest?: string
  /** Slug of an industry in @gitsols/constants INDUSTRIES. */
  industry?: string
  source?: LeadSource
  /** URL of the page the form was submitted from. */
  sourceUrl?: string
  /** UTM / referrer / GA-clid bag. */
  attribution?: Record<string, string>
}

// ─── Multistep intake (Phase 1.5) ──────────────────────────────────────────

export type IntakeFlow =
  | 'free_audit'
  | 'bespoke_scope'
  | 'marketing_scope'
  | 'service_inquiry'

/**
 * Structured payload of the multistep audit intake. Step 1 = company,
 * step 2 = current environment, step 3 = priorities, step 4 = contact +
 * preferred windows.
 *
 * Stored opaquely in the DB as JSONB so the form can evolve without a
 * migration. `intakeVersion` on the row tracks the schema version.
 */
export interface IntakeAnswers {
  // Step 1 — Company
  companyName: string
  industry?: string         // slug from INDUSTRIES
  employeeCount?: number
  officeCount?: number

  // Step 2 — Current environment
  identityPlatform?: 'm365' | 'google' | 'both' | 'neither' | 'unsure'
  endpointCount?: number
  lobApp?: string           // EHR / PMS / LOB app name (free-text)
  backupVendor?: string
  lastRestoreDrill?: 'within_3m' | 'within_12m' | 'over_12m' | 'never' | 'unsure'
  mfaCoveragePercent?: number  // 0-100

  // Step 3 — Priorities
  prompts?: string[]        // multi-select: insurance_renewal, recent_incident, ...
  topPriorities?: string[]  // ordered list of priority slugs (top 3)

  // Step 4 — You
  name: string
  email: string
  phone?: string
  role?: string
  preferredWindows?: string[]  // up to 3 ISO datetimes
  notesForCall?: string
}

/**
 * Structured payload of the bespoke scope-a-project intake. Different
 * shape than the audit — focused on what we'd build, not on what we'd
 * audit. Distinct steps for project type, scope/integrations, timeline +
 * budget, and contact.
 */
export interface BespokeScopeAnswers {
  // Step 1 — The project
  companyName: string
  projectKind?: string             // web_app | mobile_app | custom_crm | ai_tool | integration | mvp | other
  projectVision: string            // one-line elevator-pitch
  problemStatement?: string        // optional richer paragraph

  // Step 2 — The shape
  targetUsers?: string             // internal_team | customers | both | unsure
  userCountBand?: string           // under_50 | 50_500 | 500_5000 | 5000_plus | unsure
  platforms?: string[]             // web | ios | android | api | desktop
  mustHaveIntegrations?: string    // free-text e.g. "Epic EHR, QuickBooks, Stripe"
  dataSensitivity?: string         // public | internal | phi | financial | mixed
  projectState?: string            // greenfield | replacing | extending | unsure

  // Step 3 — The constraints
  launchWindow?: string            // lt_3 | 3_6 | 6_12 | gt_12 | flexible
  budgetBand?: string              // under_50k | 50_150k | 150_500k | 500k_plus | guidance
  successMetric?: string           // "what would make this a win in 90 days?"
  hasDesignAssets?: boolean        // do they already have Figma / brand?
  ownership?: string               // owned_codebase | open_to_saas | unsure

  // Step 4 — You
  name: string
  email: string
  phone?: string
  role?: string
  referredBy?: string
  notesForCall?: string
}

/**
 * Discriminated by `flow`. Audit intake carries `IntakeAnswers`; bespoke
 * scope carries `BespokeScopeAnswers`.
 */
export type CreateProspectRequest =
  | {
      flow: 'free_audit' | 'service_inquiry'
      intakeVersion: string
      answers: IntakeAnswers
      sourceUrl?: string
      attribution?: Record<string, string>
    }
  | {
      flow: 'bespoke_scope'
      intakeVersion: string
      answers: BespokeScopeAnswers
      sourceUrl?: string
      attribution?: Record<string, string>
    }
  | {
      flow: 'marketing_scope'
      intakeVersion: string
      answers: Record<string, unknown>
      sourceUrl?: string
      attribution?: Record<string, string>
    }

export interface CreateProspectResponse {
  id: string
  previewToken: string
  previewExpiresAt: string
}

// ─── Preview portal payload ────────────────────────────────────────────────
//
// Shape returned by `GET /api/v1/preview/:token` — what the unauth preview
// page renders against. No PHI, no client data — just the prospect's own
// intake projected through service templates.

export interface PreviewPortalData {
  prospect: {
    firstName: string
    companyName: string
    industry?: string
    role?: string
  }
  audit: {
    status: 'requested' | 'scheduled' | 'completed'
    requestedWindows?: string[]
    scheduledFor?: string
    durationMinutes: number
    joinUrl?: string
  }
  /** Sections we'd cover, derived from intake answers. */
  auditFocus: {
    icon: string             // lucide icon name (resolved web-side)
    title: string
    body: string
    framework?: string       // e.g. "HIPAA §164.308(a)(1)"
  }[]
  /** Pre-populated milestone timeline preview. */
  engagementPreview: {
    number: number
    title: string
    description: string
    status: 'next' | 'upcoming'
    eta?: string
  }[]
  /** Optional matched case study slug from /resources/case-studies. */
  matchedCaseStudySlug?: string
  /** Direct line — for the "questions before the audit?" block. */
  directContact: {
    name: string
    email: string
    phone: string
  }
  /** ISO timestamp this preview link expires. */
  expiresAt: string
}

// ─── NOC — Network Operations Center (Phase 2) ─────────────────────────────
//
// See `noc-architecture.md` at repo root for the full design. These are the
// wire-level types shared between the Go agent → Nest API → Next.js admin.

export type NocEndpointStatus =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'unenrolled'

export type NocEndpointKind =
  | 'workstation'
  | 'server'
  | 'mobile'
  | 'network_device'
  | 'virtual'
  | 'other'

export type NocOsFamily =
  | 'windows'
  | 'macos'
  | 'linux'
  | 'ios'
  | 'android'
  | 'network_os'
  | 'unknown'

export type NocCheckCategory =
  | 'encryption'
  | 'patching'
  | 'identity'
  | 'edr_av'
  | 'backup'
  | 'network'
  | 'lob_app'
  | 'compliance'
  | 'inventory'
  | 'custom'

export type NocCheckSeverity = 'info' | 'warn' | 'critical'

export type NocResultStatus = 'pass' | 'warn' | 'fail' | 'error' | 'skipped'

export type NocAlertStatus = 'open' | 'acknowledged' | 'resolved' | 'suppressed'

export type NocRunbookAudience = 'internal' | 'client_visible' | 'both'

/**
 * The agent's hourly POST body. Signed with an Ed25519 detached signature
 * passed in the `x-gitsols-signature` header.
 */
export interface NocHeartbeatPayload {
  endpointId: string
  agentVersion: string
  agentBinaryHash: string
  /** RFC 3339 timestamp of when the agent built the payload. */
  sentAt: string
  /** Random 128-bit nonce for replay protection. */
  nonce: string
  /** Per-check results from this tick. */
  results: NocCheckResult[]
  /** Lightweight system snapshot — no PII/PHI. */
  snapshot?: NocSystemSnapshot
}

export interface NocCheckResult {
  checkSlug: string
  status: NocResultStatus
  /** Observed value(s). Bounded, opaque JSON. */
  value?: Record<string, unknown>
  /** Operator-readable summary string. */
  message?: string
  /** Milliseconds the check took to run. */
  durationMs?: number
}

export interface NocSystemSnapshot {
  hostname: string
  fqdn?: string
  osFamily: NocOsFamily
  osVersion?: string
  cpuPct?: number
  memTotalMb?: number
  memUsedMb?: number
  diskTotalGb?: number
  diskUsedGb?: number
  uptimeSec?: number
  loggedInUserHash?: string // SHA-256 of username — never the raw string
}

export interface NocEnrollmentRequest {
  enrollmentToken: string
  publicKey: string
  publicKeyFingerprint: string
  hostname: string
  fqdn?: string
  osFamily: NocOsFamily
  osVersion?: string
  agentVersion: string
  agentBinaryHash: string
}

export interface NocEnrollmentResponse {
  endpointId: string
  clientId: string
  /** Server's signing public key for response verification. */
  serverPublicKey: string
  /** Initial config (which checks are enabled and at what schedule). */
  config: NocAgentConfig
}

export interface NocAgentConfig {
  heartbeatIntervalMinutes: number
  checks: Array<{
    slug: string
    severity: NocCheckSeverity
    scheduleMinutes: number
    /** Optional per-check tunables. */
    thresholds?: Record<string, unknown>
  }>
}

// ─── NOC admin/portal read shapes ──────────────────────────────────────────

export interface NocCheckDefinition {
  slug: string
  name: string
  description: string
  category: NocCheckCategory
  defaultSeverity: NocCheckSeverity
  defaultScheduleMinutes: number
  appliesTo: NocOsFamily[]
  hipaaControl?: string
  pciControl?: string
  socControl?: string
  defaultRunbookSlug?: string
}

export interface NocEndpointSummary {
  id: string
  clientId: string
  hostname: string
  displayName?: string
  kind: NocEndpointKind
  osFamily: NocOsFamily
  osVersion?: string
  status: NocEndpointStatus
  lastHeartbeatAt?: string
  passCount: number
  warnCount: number
  failCount: number
  agentVersion?: string
  tags: string[]
}

export interface NocAlertSummary {
  id: string
  clientId: string
  endpointId: string
  endpointHostname: string
  checkSlug: string
  severity: NocCheckSeverity
  status: NocAlertStatus
  title: string
  summary?: string
  runbookSlug?: string
  openedAt: string
  acknowledgedAt?: string
  resolvedAt?: string
}

export interface NocRunbookSummary {
  id: string
  slug: string
  title: string
  summary?: string
  audience: NocRunbookAudience
  category?: NocCheckCategory
  attachedTo?: string
  clientId?: string
  currentVersion: number
  updatedAt: string
}

export interface NocFleetRollup {
  total: number
  healthy: number
  warning: number
  critical: number
  offline: number
  openAlerts: number
  /** Last heartbeat received across the fleet. */
  lastHeartbeatAt?: string
}

// ─── API envelope ──────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number
  message: string
  code?: string
  details?: Record<string, unknown>
}
