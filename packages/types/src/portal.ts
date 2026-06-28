// ─── Client portal (Phase 3) ─────────────────────────────────────────────────
// Read shapes for the client-facing portal. Every payload is scoped to the
// signed-in user's account (accountId on the JWT) by the API.

import type { NocEndpointSummary, NocAlertSummary, NocFleetRollup } from './index.js'

export interface PortalAccount {
  id: string
  name: string
  industry?: string
  since?: string
}

export interface PortalOverview {
  account: PortalAccount
  engagementsActive: number
  openTickets: number
  invoicesOutstanding: number
  balanceDue: number
  nextMilestone?: { title: string; due?: string; engagement: string }
}

export interface PortalNocSummary {
  rollup: NocFleetRollup
  endpoints: NocEndpointSummary[]
  alerts: NocAlertSummary[]
}

export interface CreatePortalTicketRequest {
  subject: string
  description?: string
  priority?: 'p1' | 'p2' | 'p3' | 'p4'
  category?: string
}
