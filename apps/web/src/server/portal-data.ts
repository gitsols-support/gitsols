import 'server-only'
import { apiFetch, ApiError } from './api-client'
import type {
  PortalOverview,
  PortalNocSummary,
  Engagement,
  Invoice,
  Proposal,
  Ticket,
  CrmDocument,
} from '@gitsols/types'

async function safe<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiFetch<T>(path)
  } catch (err) {
    const detail = err instanceof ApiError ? `${err.status} ${err.statusText}` : String(err)
    console.error(`[portal-data] GET ${path} failed: ${detail}`)
    return fallback
  }
}

const ZERO_OVERVIEW: PortalOverview = {
  account: { id: '', name: '—' },
  engagementsActive: 0,
  openTickets: 0,
  invoicesOutstanding: 0,
  balanceDue: 0,
}

export const getPortalOverview = () => safe<PortalOverview>('/portal/overview', ZERO_OVERVIEW)
export const getPortalEngagements = () => safe<Engagement[]>('/portal/engagements', [])
export const getPortalInvoices = () => safe<Invoice[]>('/portal/invoices', [])
export const getPortalProposals = () => safe<Proposal[]>('/portal/proposals', [])
export const getPortalTickets = () => safe<Ticket[]>('/portal/tickets', [])
export const getPortalDocuments = () => safe<CrmDocument[]>('/portal/documents', [])
export const getPortalNoc = () =>
  safe<PortalNocSummary>('/portal/noc', {
    rollup: { total: 0, healthy: 0, warning: 0, critical: 0, offline: 0, openAlerts: 0 },
    endpoints: [],
    alerts: [],
  })
