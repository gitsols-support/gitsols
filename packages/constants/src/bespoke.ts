// ─── Bespoke scope-a-project option catalogs ──────────────────────────────
//
// Used by:
//   - The bespoke multistep form (apps/web/src/app/(marketing)/services/
//     bespoke-software/scope/)
//   - The API Zod validator (apps/api/src/prospects/dto)
//
// Slugs are stable so historical scope submissions stay readable after copy
// edits.

import type { IntakeOption } from './intake'

// ─── Project kind ─────────────────────────────────────────────────────────

export const PROJECT_KINDS: readonly IntakeOption[] = [
  { value: 'web_app', label: 'Custom web app', helper: 'Internal tool, customer portal, dashboard' },
  { value: 'mobile_app', label: 'Mobile app', helper: 'iOS + Android via React Native / Expo' },
  { value: 'custom_crm', label: 'Custom CRM / ops platform', helper: 'Vertical-specific where Salesforce is wrong-shaped' },
  { value: 'ai_tool', label: 'AI integration', helper: 'Claude agents, RAG, document extraction' },
  { value: 'integration', label: 'Integrations & automation', helper: 'Wire existing tools together' },
  { value: 'mvp', label: 'SaaS MVP', helper: 'New product, 8-12 week build' },
  { value: 'other', label: 'Something else', helper: 'Tell us in the next step' },
]

// ─── Target users ─────────────────────────────────────────────────────────

export const TARGET_USERS: readonly IntakeOption[] = [
  { value: 'internal_team', label: 'Internal team', helper: 'Staff, ops, back-office' },
  { value: 'customers', label: 'Customers / clients', helper: 'External-facing' },
  { value: 'both', label: 'Both', helper: 'Internal + external surfaces' },
  { value: 'unsure', label: 'Not sure yet' },
]

// ─── User count band ──────────────────────────────────────────────────────

export const USER_COUNT_BANDS: readonly IntakeOption[] = [
  { value: 'under_50', label: '< 50 users' },
  { value: '50_500', label: '50 – 500' },
  { value: '500_5000', label: '500 – 5,000' },
  { value: '5000_plus', label: '5,000+' },
  { value: 'unsure', label: 'Not sure' },
]

// ─── Platforms ────────────────────────────────────────────────────────────

export const PLATFORMS: readonly IntakeOption[] = [
  { value: 'web', label: 'Web' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'api', label: 'API only' },
  { value: 'desktop', label: 'Desktop' },
]

// ─── Data sensitivity ─────────────────────────────────────────────────────

export const DATA_SENSITIVITY_LEVELS: readonly IntakeOption[] = [
  { value: 'public', label: 'Public', helper: 'No regulated data' },
  { value: 'internal', label: 'Internal confidential', helper: 'Business confidential, no PHI / financial' },
  { value: 'phi', label: 'PHI (HIPAA)', helper: 'Patient health information' },
  { value: 'financial', label: 'Financial (GLBA / SEC)', helper: 'Customer financial data' },
  { value: 'mixed', label: 'Mixed / multiple' },
]

// ─── Project state ────────────────────────────────────────────────────────

export const PROJECT_STATES: readonly IntakeOption[] = [
  { value: 'greenfield', label: 'Greenfield', helper: 'Building new from scratch' },
  { value: 'replacing', label: 'Replacing existing', helper: 'Tired of current system' },
  { value: 'extending', label: 'Extending existing', helper: 'Add to what we have' },
  { value: 'unsure', label: 'Not sure yet' },
]

// ─── Launch window ────────────────────────────────────────────────────────

export const LAUNCH_WINDOWS: readonly IntakeOption[] = [
  { value: 'lt_3', label: 'Within 3 months', helper: 'Tight, but possible' },
  { value: '3_6', label: '3–6 months' },
  { value: '6_12', label: '6–12 months' },
  { value: 'gt_12', label: '12+ months' },
  { value: 'flexible', label: 'Flexible' },
]

// ─── Budget band ──────────────────────────────────────────────────────────

export const BUDGET_BANDS: readonly IntakeOption[] = [
  { value: 'under_50k', label: 'Under $50k' },
  { value: '50_150k', label: '$50k – $150k' },
  { value: '150_500k', label: '$150k – $500k' },
  { value: '500k_plus', label: '$500k+' },
  { value: 'guidance', label: 'Need guidance', helper: 'Tell us what is reasonable' },
]

// ─── Ownership preference ─────────────────────────────────────────────────

export const OWNERSHIP_OPTIONS: readonly IntakeOption[] = [
  { value: 'owned_codebase', label: 'Owned codebase', helper: 'We own the source, no lock-in' },
  { value: 'open_to_saas', label: 'Open to SaaS', helper: 'If a managed solution makes sense' },
  { value: 'unsure', label: 'Unsure / advise us' },
]
