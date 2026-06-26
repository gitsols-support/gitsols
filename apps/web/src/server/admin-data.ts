// Live admin data-access layer. Server-only: each fetcher calls the Nest API
// with the current user's JWT (see ./api-client). Replaces the Phase-1
// admin-stubs arrays — pages now render real, persisted records.
//
// Every fetcher is resilient: on a network/auth error it returns a safe empty
// value so an admin page degrades to an empty state instead of a 500. The
// underlying ApiError is logged server-side for diagnosis.

import 'server-only'
import { apiFetch, ApiError } from './api-client'
import type {
  AdminLead,
  CrmAccount,
  Contact,
  Opportunity,
  Engagement,
  BespokeProject,
  Ticket,
  CrmDocument,
  ServiceCatalogItem,
  MarketingEngagement,
  AdminUser,
  DashboardMetrics,
  ReportsSummary,
  ActivityEvent,
  Invoice,
  Proposal,
} from '@gitsols/types'

async function safe<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiFetch<T>(path)
  } catch (err) {
    const detail = err instanceof ApiError ? `${err.status} ${err.statusText}` : String(err)
    // TODO: pipe to Sentry. For now a server-side console keeps the page alive.
    console.error(`[admin-data] GET ${path} failed: ${detail}`)
    return fallback
  }
}

async function maybe<T>(path: string): Promise<T | null> {
  try {
    return await apiFetch<T>(path)
  } catch {
    return null
  }
}

// ── Leads ──────────────────────────────────────────────────────────────────
export const getLeads = () => safe<AdminLead[]>('/leads', [])
export const getLead = (id: string) => maybe<AdminLead>(`/leads/${id}`)

// ── Accounts ─────────────────────────────────────────────────────────────────
export const getAccounts = () => safe<CrmAccount[]>('/accounts', [])
export const getAccount = (id: string) => maybe<CrmAccount>(`/accounts/${id}`)
export const getAccountContacts = (id: string) =>
  safe<Contact[]>(`/accounts/${id}/contacts`, [])

// ── Contacts ─────────────────────────────────────────────────────────────────
export const getContacts = () => safe<Contact[]>('/contacts', [])
export const getContact = (id: string) => maybe<Contact>(`/contacts/${id}`)

// ── Opportunities / pipeline ─────────────────────────────────────────────────
export const getOpportunities = () => safe<Opportunity[]>('/opportunities', [])
export const getOpportunity = (id: string) => maybe<Opportunity>(`/opportunities/${id}`)

// ── Engagements ──────────────────────────────────────────────────────────────
export const getEngagements = () => safe<Engagement[]>('/engagements', [])
export const getEngagement = (id: string) => maybe<Engagement>(`/engagements/${id}`)

// ── Bespoke projects ─────────────────────────────────────────────────────────
export const getBespokeProjects = () => safe<BespokeProject[]>('/bespoke', [])
export const getBespokeProject = (id: string) => maybe<BespokeProject>(`/bespoke/${id}`)

// ── Tickets ──────────────────────────────────────────────────────────────────
export const getTickets = () => safe<Ticket[]>('/tickets', [])
export const getTicket = (id: string) => maybe<Ticket>(`/tickets/${id}`)

// ── Documents ────────────────────────────────────────────────────────────────
export const getDocuments = () => safe<CrmDocument[]>('/documents', [])

// ── Service catalog ──────────────────────────────────────────────────────────
export const getServicesCatalog = () => safe<ServiceCatalogItem[]>('/services-catalog', [])
export const getServiceCatalogItem = (id: string) =>
  maybe<ServiceCatalogItem>(`/services-catalog/${id}`)


// ── Billing — invoices & proposals ───────────────────────────────────────────
export const getInvoices = () => safe<Invoice[]>('/invoices', [])
export const getInvoice = (id: string) => maybe<Invoice>(`/invoices/${id}`)
export const getProposals = () => safe<Proposal[]>('/proposals', [])
export const getProposal = (id: string) => maybe<Proposal>(`/proposals/${id}`)

// ── Marketing / GHL ──────────────────────────────────────────────────────────
export const getMarketingEngagements = () =>
  safe<MarketingEngagement[]>('/marketing', [])
export const getMarketingEngagement = (id: string) =>
  maybe<MarketingEngagement>(`/marketing/${id}`)

// ── Users ────────────────────────────────────────────────────────────────────
export const getUsers = () => safe<AdminUser[]>('/users', [])

// ── Dashboard / reports / activity ───────────────────────────────────────────
const ZERO_METRICS: DashboardMetrics = {
  pipelineValue: 0,
  weightedPipelineValue: 0,
  mrr: 0,
  arr: 0,
  openTickets: 0,
  p1Open: 0,
  activeEngagements: 0,
  leadsThisWeek: 0,
  accountsTotal: 0,
  accountsAtRisk: 0,
  marketingMrr: 0,
}
export const getDashboardMetrics = () =>
  safe<DashboardMetrics>('/dashboard/metrics', ZERO_METRICS)
export const getReports = () =>
  safe<ReportsSummary>('/reports/summary', {
    metrics: ZERO_METRICS,
    pipelineByStage: [],
    revenueByService: [],
  })
export const getActivity = (limit = 50) =>
  safe<ActivityEvent[]>(`/activity?limit=${limit}`, [])

// ── Formatting helpers (shared by admin pages) ───────────────────────────────
export function formatCurrency(n: number, opts?: { compact?: boolean }) {
  if (opts?.compact && n >= 1000) {
    return `$${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatRelative(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const diff = Date.now() - then
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.round(days / 30)
  return `${months}mo ago`
}
