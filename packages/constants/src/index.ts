// ─── GITSOLS platform constants & stub data ────────────────────────────────
//
// Add registries, enums, and seed data as named exports. Apps consume via
// `import { FOO } from '@gitsols/constants'`.
//
// Stub data here is Phase 0 placeholder — replace as the real domain
// (accounts, engagements, tickets) lands in Phase 2.

import type { User } from '@gitsols/types'

// ─── Marketing-site catalog (services / industries / process) ─────────────

export * from './marketing'

// ─── Audit-intake option catalogs (Phase 1.5) ─────────────────────────────

export * from './intake'

// ─── Bespoke scope option catalogs ────────────────────────────────────────

export * from './bespoke'

// ─── NOC — check catalog + category metadata (Phase 2) ────────────────────

export * from './noc'

// ─── Stub users (replace with real auth context per project) ──────────────

export const STUB_USERS: User[] = [
  {
    id: 'u_001',
    email: 'sohail@gitsols.com',
    name: 'Sohail Akram',
    role: 'admin',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'u_002',
    email: 'pm@gitsols.com',
    name: 'Project Manager',
    role: 'staff',
    createdAt: '2026-02-01T10:00:00Z',
  },
]

// ─── Stub notifications (consumed by AdminRightSidebar) ───────────────────

export interface StubNotification {
  id: string
  title: string
  body: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  time: string
}

export const STUB_NOTIFICATIONS: StubNotification[] = [
  {
    id: 'n_001',
    title: 'New IT audit request',
    body: 'Riverside Medical Group submitted the audit form. Pipeline → New.',
    type: 'info',
    read: false,
    time: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: 'n_002',
    title: 'Milestone awaiting approval',
    body: 'Edgewater Capital — "Endpoint deployment" ready for client sign-off.',
    type: 'success',
    read: false,
    time: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: 'n_003',
    title: 'SoW signed',
    body: 'Bayshore Dental Partners countersigned the MSP retainer.',
    type: 'info',
    read: true,
    time: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
]

// ─── Stub activity feed ────────────────────────────────────────────────────

export interface StubActivityEvent {
  id: string
  actor: string
  action: string
  target: string
  time: string
}

export const STUB_ACTIVITY: StubActivityEvent[] = [
  {
    id: 'a_001',
    actor: 'sohail@gitsols.com',
    action: 'closed-won',
    target: 'Riverside Medical Group — Managed Cybersecurity',
    time: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    id: 'a_002',
    actor: 'pm@gitsols.com',
    action: 'completed milestone',
    target: 'Edgewater Capital — Endpoint deployment',
    time: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    id: 'a_003',
    actor: 'sohail@gitsols.com',
    action: 'sent SoW',
    target: 'Bayshore Dental Partners',
    time: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
]

// ─── Stub platform stats ────────────────────────────────────────────────────

export const STUB_STATS = {
  totalUsers: 142,   // total contacts in CRM (Phase 0 placeholder)
  activeToday: 38,   // open engagements (Phase 0 placeholder)
  weeklyGrowth: 4.2, // pipeline change week-over-week (Phase 0 placeholder)
  uptime: 99.97,     // platform uptime — Phase 5 will source from BetterStack
}
