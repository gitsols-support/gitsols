'use server'

// Server actions for admin mutations. Each posts to the Nest API with the
// signed-in user's JWT (via apiFetch) and revalidates the affected route so
// the server-rendered list/detail reflects the change immediately.

import { revalidatePath } from 'next/cache'
import { apiFetch } from './api-client'
import type {
  AdminLead,
  AdminLeadStatus,
  ConvertLeadResponse,
  CrmAccount,
  Contact,
  Opportunity,
  OpportunityStage,
  Engagement,
  BespokeProject,
  Ticket,
  TicketStatus,
  MarketingEngagement,
  MarketingStatus,
  CreateAccountRequest,
  UpdateAccountRequest,
  CreateContactRequest,
  CreateTicketRequest,
  CreateMarketingEngagementRequest,
  CreateOpportunityRequest,
  CreateEngagementRequest,
  CreateBespokeProjectRequest,
  CreateLeadRequest,
} from '@gitsols/types'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

async function run<T>(fn: () => Promise<T>, ...revalidate: string[]): Promise<Result<T>> {
  try {
    const data = await fn()
    for (const p of revalidate) revalidatePath(p)
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Request failed' }
  }
}

// ── Leads ──────────────────────────────────────────────────────────────────
export async function updateLead(id: string, patch: { status?: AdminLeadStatus; owner?: string; score?: number }) {
  return run<AdminLead>(
    () => apiFetch(`/leads/${id}`, { method: 'PATCH', body: patch }),
    '/admin/leads',
    `/admin/leads/${id}`,
  )
}

export async function convertLead(id: string) {
  return run<ConvertLeadResponse>(
    () => apiFetch(`/leads/${id}/convert`, { method: 'POST' }),
    '/admin/leads',
    '/admin/pipeline',
  )
}

// ── Leads ──────────────────────────────────────────────────────────────────
export async function createLead(body: CreateLeadRequest) {
  return run<{ id: string; status: string }>(
    () => apiFetch('/leads', { method: 'POST', body }),
    '/admin/leads',
  )
}

// ── Accounts ─────────────────────────────────────────────────────────────────
export async function createAccount(body: CreateAccountRequest) {
  return run<CrmAccount>(() => apiFetch('/accounts', { method: 'POST', body }), '/admin/accounts')
}

export async function updateAccount(id: string, body: UpdateAccountRequest) {
  return run<CrmAccount>(
    () => apiFetch(`/accounts/${id}`, { method: 'PATCH', body }),
    '/admin/accounts',
    `/admin/accounts/${id}`,
  )
}

// ── Opportunities (create) ───────────────────────────────────────────────────
export async function createOpportunity(body: CreateOpportunityRequest) {
  return run<Opportunity>(
    () => apiFetch('/opportunities', { method: 'POST', body }),
    '/admin/pipeline',
  )
}

export async function updateOpportunity(id: string, body: Partial<CreateOpportunityRequest>) {
  return run<Opportunity>(
    () => apiFetch(`/opportunities/${id}`, { method: 'PATCH', body }),
    '/admin/pipeline',
    `/admin/pipeline/${id}`,
  )
}

// ── Engagements ──────────────────────────────────────────────────────────────
export async function createEngagement(body: CreateEngagementRequest) {
  return run<Engagement>(
    () => apiFetch('/engagements', { method: 'POST', body }),
    '/admin/engagements',
  )
}

export async function updateEngagement(id: string, body: Partial<CreateEngagementRequest>) {
  return run<Engagement>(
    () => apiFetch(`/engagements/${id}`, { method: 'PATCH', body }),
    '/admin/engagements',
    `/admin/engagements/${id}`,
  )
}

// ── Bespoke projects ─────────────────────────────────────────────────────────
export async function createBespokeProject(body: CreateBespokeProjectRequest) {
  return run<BespokeProject>(() => apiFetch('/bespoke', { method: 'POST', body }), '/admin/bespoke')
}

export async function updateBespokeProject(id: string, body: Partial<CreateBespokeProjectRequest>) {
  return run<BespokeProject>(
    () => apiFetch(`/bespoke/${id}`, { method: 'PATCH', body }),
    '/admin/bespoke',
    `/admin/bespoke/${id}`,
  )
}

// ── Contacts ─────────────────────────────────────────────────────────────────
export async function createContact(body: CreateContactRequest) {
  return run<Contact>(() => apiFetch('/contacts', { method: 'POST', body }), '/admin/contacts')
}

// ── Opportunities ────────────────────────────────────────────────────────────
export async function updateOpportunityStage(id: string, stage: OpportunityStage) {
  return run<Opportunity>(
    () => apiFetch(`/opportunities/${id}`, { method: 'PATCH', body: { stage } }),
    '/admin/pipeline',
    `/admin/pipeline/${id}`,
  )
}

export async function addOpportunityNote(id: string, text: string) {
  return run<Opportunity>(
    () => apiFetch(`/opportunities/${id}/activity`, { method: 'POST', body: { kind: 'note', text } }),
    `/admin/pipeline/${id}`,
  )
}

// ── Tickets ──────────────────────────────────────────────────────────────────
export async function createTicket(body: CreateTicketRequest) {
  return run<Ticket>(() => apiFetch('/tickets', { method: 'POST', body }), '/admin/tickets')
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  return run<Ticket>(
    () => apiFetch(`/tickets/${id}`, { method: 'PATCH', body: { status } }),
    '/admin/tickets',
    `/admin/tickets/${id}`,
  )
}

export async function addTicketComment(id: string, bodyText: string) {
  return run<Ticket>(
    () => apiFetch(`/tickets/${id}/comments`, { method: 'POST', body: { body: bodyText } }),
    `/admin/tickets/${id}`,
  )
}

// ── Marketing / GHL ──────────────────────────────────────────────────────────
export async function createMarketingEngagement(body: CreateMarketingEngagementRequest) {
  return run<MarketingEngagement>(
    () => apiFetch('/marketing', { method: 'POST', body }),
    '/admin/marketing',
  )
}

export async function updateMarketingStatus(id: string, status: MarketingStatus) {
  return run<MarketingEngagement>(
    () => apiFetch(`/marketing/${id}`, { method: 'PATCH', body: { status } }),
    '/admin/marketing',
    `/admin/marketing/${id}`,
  )
}

// ── Billing — proposals & invoices ───────────────────────────────────────────
import type {
  Invoice,
  Proposal,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateProposalRequest,
  UpdateProposalRequest,
  ServiceCatalogItem,
  CreateServiceCatalogItemRequest,
  UpdateServiceCatalogItemRequest,
} from '@gitsols/types'

export async function createProposal(body: CreateProposalRequest) {
  return run<Proposal>(() => apiFetch('/proposals', { method: 'POST', body }), '/admin/proposals')
}
export async function updateProposal(id: string, body: UpdateProposalRequest) {
  return run<Proposal>(
    () => apiFetch(`/proposals/${id}`, { method: 'PATCH', body }),
    '/admin/proposals',
    `/admin/proposals/${id}`,
  )
}
export async function deleteProposal(id: string) {
  return run<void>(() => apiFetch(`/proposals/${id}`, { method: 'DELETE' }), '/admin/proposals')
}

export async function createInvoice(body: CreateInvoiceRequest) {
  return run<Invoice>(() => apiFetch('/invoices', { method: 'POST', body }), '/admin/invoices')
}
export async function updateInvoice(id: string, body: UpdateInvoiceRequest) {
  return run<Invoice>(
    () => apiFetch(`/invoices/${id}`, { method: 'PATCH', body }),
    '/admin/invoices',
    `/admin/invoices/${id}`,
  )
}
export async function deleteInvoice(id: string) {
  return run<void>(() => apiFetch(`/invoices/${id}`, { method: 'DELETE' }), '/admin/invoices')
}
export async function convertProposalToInvoice(proposalId: string) {
  return run<Invoice>(
    () => apiFetch(`/invoices/from-proposal/${proposalId}`, { method: 'POST' }),
    '/admin/invoices',
    '/admin/proposals',
    `/admin/proposals/${proposalId}`,
  )
}

// ── Service price configurator ───────────────────────────────────────────────
export async function createServiceLine(body: CreateServiceCatalogItemRequest) {
  return run<ServiceCatalogItem>(
    () => apiFetch('/services-catalog', { method: 'POST', body }),
    '/admin/pricing',
  )
}
export async function updateServiceLine(id: string, body: UpdateServiceCatalogItemRequest) {
  return run<ServiceCatalogItem>(
    () => apiFetch(`/services-catalog/${id}`, { method: 'PATCH', body }),
    '/admin/pricing',
  )
}
export async function deleteServiceLine(id: string) {
  return run<void>(() => apiFetch(`/services-catalog/${id}`, { method: 'DELETE' }), '/admin/pricing')
}
