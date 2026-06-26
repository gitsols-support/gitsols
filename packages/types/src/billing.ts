// ─── Billing — proposals & invoices ─────────────────────────────────────────
//
// Wire shapes shared between apps/api (Nest) and apps/web (admin UI). Money is
// whole US dollars (number), matching ServiceCatalogItem.defaultRate. Totals
// are persisted snapshots so a historical document never shifts when catalog
// prices change.

export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'converted'

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'void'

export interface BillingLineItem {
  id: string
  /** Optional link to a services_catalog slug this line was priced from. */
  serviceSlug?: string
  description: string
  qty: number
  /** Unit price in whole dollars. */
  unitPrice: number
  /** Billing unit label, e.g. 'per-seat-month' | 'fixed' | 'hourly'. */
  unit: string
  recurring: boolean
  sortOrder: number
  /** Derived: qty * unitPrice. Server-computed for convenience. */
  lineTotal: number
}

export interface Proposal {
  id: string
  number: string
  title: string
  accountId?: string
  accountName?: string
  engagementId?: string
  engagementName?: string
  clientName: string
  clientEmail?: string
  status: ProposalStatus
  issueDate?: string
  validUntil?: string
  currency: string
  notes?: string
  terms?: string
  taxRate: number
  discount: number
  subtotal: number
  taxAmount: number
  total: number
  owner: string
  lineItems: BillingLineItem[]
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  number: string
  title: string
  accountId?: string
  accountName?: string
  engagementId?: string
  engagementName?: string
  proposalId?: string
  proposalNumber?: string
  clientName: string
  clientEmail?: string
  status: InvoiceStatus
  issueDate?: string
  dueDate?: string
  currency: string
  notes?: string
  terms?: string
  taxRate: number
  discount: number
  subtotal: number
  taxAmount: number
  total: number
  amountPaid: number
  /** Derived: total - amountPaid. */
  balanceDue: number
  owner: string
  lineItems: BillingLineItem[]
  createdAt: string
  updatedAt: string
}

// ── Request payloads ─────────────────────────────────────────────────────────

export interface BillingLineItemInput {
  serviceSlug?: string
  description: string
  qty?: number
  unitPrice?: number
  unit?: string
  recurring?: boolean
}

export interface CreateProposalRequest {
  title: string
  accountId?: string
  engagementId?: string
  clientName?: string
  clientEmail?: string
  status?: ProposalStatus
  issueDate?: string
  validUntil?: string
  currency?: string
  notes?: string
  terms?: string
  taxRate?: number
  discount?: number
  owner?: string
  lineItems?: BillingLineItemInput[]
}
export type UpdateProposalRequest = Partial<CreateProposalRequest>

export interface CreateInvoiceRequest {
  title?: string
  accountId?: string
  engagementId?: string
  proposalId?: string
  clientName?: string
  clientEmail?: string
  status?: InvoiceStatus
  issueDate?: string
  dueDate?: string
  currency?: string
  notes?: string
  terms?: string
  taxRate?: number
  discount?: number
  amountPaid?: number
  owner?: string
  lineItems?: BillingLineItemInput[]
}
export type UpdateInvoiceRequest = Partial<CreateInvoiceRequest>
