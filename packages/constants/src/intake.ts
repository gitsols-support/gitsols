// ─── Audit-intake option catalogs ──────────────────────────────────────────
//
// Used by:
//   - The web multistep form (apps/web/src/app/(marketing)/free-it-audit/intake/)
//   - The API Zod validator (apps/api/src/prospects/dto)
//   - The admin form-builder defaults (Phase 2)
//
// Adding a new option here updates both surfaces. Values are stable slugs
// so historical intake payloads stay readable after copy edits.

export interface IntakeOption<T extends string = string> {
  value: T
  label: string
  /** Short helper text shown under the option in the picker. */
  helper?: string
}

// ─── Identity platform (Step 2) ────────────────────────────────────────────

export type IdentityPlatform = 'm365' | 'google' | 'both' | 'neither' | 'unsure'

export const IDENTITY_PLATFORMS: readonly IntakeOption<IdentityPlatform>[] = [
  { value: 'm365', label: 'Microsoft 365', helper: 'Entra ID for sign-in' },
  { value: 'google', label: 'Google Workspace', helper: 'Google identity for sign-in' },
  { value: 'both', label: 'Both', helper: 'Hybrid identity' },
  { value: 'neither', label: 'Neither', helper: 'Standalone / on-prem AD' },
  { value: 'unsure', label: 'Not sure' },
]

// ─── Last restore drill (Step 2) ───────────────────────────────────────────

export type RestoreDrillRecency =
  | 'within_3m'
  | 'within_12m'
  | 'over_12m'
  | 'never'
  | 'unsure'

export const RESTORE_DRILL_OPTIONS: readonly IntakeOption<RestoreDrillRecency>[] = [
  { value: 'within_3m', label: 'In the last 90 days' },
  { value: 'within_12m', label: 'In the last 12 months' },
  { value: 'over_12m', label: 'More than 12 months ago' },
  { value: 'never', label: 'Never formally tested' },
  { value: 'unsure', label: 'Not sure' },
]

// ─── What's prompting this audit? (Step 3, multi-select) ───────────────────

export const INTAKE_PROMPTS: readonly IntakeOption[] = [
  { value: 'insurance_renewal', label: 'Cyber insurance renewal' },
  { value: 'compliance_audit_upcoming', label: 'Compliance audit coming up' },
  { value: 'recent_incident', label: 'Recent incident or close call' },
  { value: 'vendor_change', label: 'Looking to change IT vendor' },
  { value: 'growth', label: 'Growing fast, IT needs to scale' },
  { value: 'outage', label: 'Frequent outages or downtime' },
  { value: 'cost', label: 'IT spend feels out of control' },
  { value: 'second_opinion', label: 'Just want a second opinion' },
]

// ─── Top priorities (Step 3, rank up to 3) ─────────────────────────────────

export const INTAKE_PRIORITIES: readonly IntakeOption[] = [
  { value: 'cybersecurity', label: 'Cybersecurity posture' },
  { value: 'compliance', label: 'Compliance & audit readiness' },
  { value: 'uptime', label: 'Uptime & reliability' },
  { value: 'cost', label: 'Cost control & IT budgeting' },
  { value: 'vendor_mgmt', label: 'Vendor management & risk' },
  { value: 'remote_work', label: 'Remote work & mobility' },
  { value: 'ai_exposure', label: 'AI exposure & policy' },
  { value: 'modernization', label: 'Modernization & cloud' },
]

// ─── Endpoint count bucket helper ──────────────────────────────────────────

export function bucketEndpoints(count: number | undefined): string {
  if (count === undefined || count === null || count < 1) return 'unknown'
  if (count < 10) return '1-9'
  if (count < 25) return '10-24'
  if (count < 50) return '25-49'
  if (count < 100) return '50-99'
  if (count < 250) return '100-249'
  if (count < 500) return '250-499'
  return '500+'
}

// ─── Lookup helpers ────────────────────────────────────────────────────────

export function findIntakeOption<T extends string>(
  list: readonly IntakeOption<T>[],
  value: T | string | undefined,
): IntakeOption<T> | undefined {
  if (!value) return undefined
  return list.find((o) => o.value === value)
}
