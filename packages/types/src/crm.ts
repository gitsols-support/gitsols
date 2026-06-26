// ─── CRM / Admin domain types (Phase 2) ────────────────────────────────────
//
// Shared across apps/web (admin surfaces) and apps/api (NestJS modules).
// These describe the *API contract* — the JSON the API returns and accepts.
// The Drizzle row shapes (apps/api/.../schema) map onto these in each
// module's `serialize()` helper. Nullable DB columns are surfaced here as
// optional (`?`) fields so the admin UI can keep using `value && …` guards.
//
// Money is whole US dollars (integer). Dates are ISO-8601 strings.

import type { Role } from './index.js'

export type Industry = 'healthcare' | 'financial-services' | 'professional-services' | 'other'

// ─── Contacts ──────────────────────────────────────────────────────────────

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  title?: string
  accountId?: string
  accountName?: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateContactRequest {
  name: string
  email: string
  phone?: string
  title?: string
  accountId?: string
  isPrimary?: boolean
}
export type UpdateContactRequest = Partial<CreateContactRequest>

// ─── Leads (admin view — richer than the public capture shape) ─────────────

export type AdminLeadStatus =
  | 'new'
  | 'qualifying'
  | 'qualified'
  | 'contacted'
  | 'disqualified'
  | 'converted'
  | 'junk'

export type AdminLeadSource =
  | 'contact_form'
  | 'free_it_audit'
  | 'service_inquiry'
  | 'bespoke_scope_request'
  | 'phone'
  | 'referral'
  | 'other'

export interface AdminLead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  industry?: Industry
  serviceInterest?: string
  source: AdminLeadSource
  message?: string
  status: AdminLeadStatus
  owner?: string
  /** 0–100 qualification score. */
  score: number
  receivedAt: string
  updatedAt: string
}

export interface UpdateLeadRequest {
  status?: AdminLeadStatus
  owner?: string
  score?: number
  serviceInterest?: string
  industry?: Industry
}

export interface ConvertLeadResponse {
  opportunityId: string
  accountId?: string
}

// ─── Accounts ──────────────────────────────────────────────────────────────

export type AccountTier = 'enterprise' | 'mid-market' | 'smb'
export type AccountStatus = 'active' | 'at-risk' | 'onboarding' | 'churned'
export type AccountHealth = 'excellent' | 'good' | 'watch' | 'critical'

export interface CrmAccount {
  id: string
  name: string
  slug: string
  industry?: Industry
  tier: AccountTier
  primaryContact?: string
  primaryEmail?: string
  mrr: number
  seats: number
  status: AccountStatus
  health: AccountHealth
  since?: string
  nextRenewal?: string
  activeEngagements: number
  openTickets: number
  servicesUsed: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  name: string
  industry?: Industry
  tier?: AccountTier
  primaryContact?: string
  primaryEmail?: string
  mrr?: number
  seats?: number
  status?: AccountStatus
  health?: AccountHealth
  since?: string
  nextRenewal?: string
  servicesUsed?: string[]
}
export type UpdateAccountRequest = Partial<CreateAccountRequest>

// ─── Opportunities / pipeline ──────────────────────────────────────────────

export type OpportunityStage =
  | 'new'
  | 'qualified'
  | 'proposal'
  | 'sow-sent'
  | 'closed-won'
  | 'closed-lost'

export type OpportunityType = 'new-business' | 'expansion' | 'renewal'
export type LossReason = 'price' | 'incumbent' | 'no-decision' | 'wrong-fit' | 'other'

export interface OpportunityLineItem {
  id: string
  service: string
  qty: number
  rate: number
  recurring: boolean
}

export interface OpportunityAttachment {
  id: string
  kind: 'quote' | 'proposal' | 'sow' | 'msa' | 'other'
  name: string
  url?: string
  addedAt: string
  addedBy: string
}

export interface OpportunityActivity {
  id: string
  ts: string
  kind: 'note' | 'stage' | 'attachment' | 'call' | 'email' | 'meeting' | 'value'
  actor: string
  text: string
}

export interface Opportunity {
  id: string
  name: string
  accountId?: string
  prospectName: string
  industry?: Industry
  type: OpportunityType
  stage: OpportunityStage
  /** Annual contract value, whole dollars. */
  value: number
  /** 0–100, drives weighted pipeline. */
  probability: number
  expectedClose?: string
  owner: string
  source: 'contact_form' | 'free_it_audit' | 'service_inquiry' | 'phone' | 'referral' | 'rfp'
  servicesInScope: string[]
  primaryContact?: string
  primaryEmail?: string
  lostReason?: LossReason
  lostNote?: string
  lineItems: OpportunityLineItem[]
  attachments: OpportunityAttachment[]
  activity: OpportunityActivity[]
  createdAt: string
  updatedAt: string
}

export interface CreateOpportunityRequest {
  name: string
  accountId?: string
  prospectName: string
  industry?: Industry
  type?: OpportunityType
  stage?: OpportunityStage
  value?: number
  probability?: number
  expectedClose?: string
  owner?: string
  source?: Opportunity['source']
  servicesInScope?: string[]
  primaryContact?: string
  primaryEmail?: string
  lineItems?: Omit<OpportunityLineItem, 'id'>[]
}

export interface UpdateOpportunityRequest extends Partial<CreateOpportunityRequest> {
  lostReason?: LossReason
  lostNote?: string
}

export interface AddOpportunityActivityRequest {
  kind: OpportunityActivity['kind']
  text: string
}

// ─── Engagements ───────────────────────────────────────────────────────────

export type EngagementType = 'managed' | 'project' | 'discovery'
export type EngagementStatus = 'active' | 'onboarding' | 'paused' | 'renewing' | 'closed'
export type Health = 'green' | 'amber' | 'red'

export type MilestoneStatus = 'pending' | 'in-progress' | 'awaiting-approval' | 'approved' | 'blocked'

export interface Milestone {
  id: string
  title: string
  description?: string
  status: MilestoneStatus
  dueDate?: string
  order: number
}

export interface Engagement {
  id: string
  name: string
  accountId: string
  accountName: string
  type: EngagementType
  status: EngagementStatus
  stage: string
  health: Health
  startedAt?: string
  nextMilestone?: string
  nextMilestoneDue?: string
  mrrOrValue: number
  serviceSlug?: string
  milestones?: Milestone[]
  createdAt: string
  updatedAt: string
}

export interface CreateEngagementRequest {
  name: string
  accountId: string
  type?: EngagementType
  status?: EngagementStatus
  stage?: string
  health?: Health
  startedAt?: string
  nextMilestone?: string
  nextMilestoneDue?: string
  mrrOrValue?: number
  serviceSlug?: string
}
export type UpdateEngagementRequest = Partial<CreateEngagementRequest>

// ─── Bespoke software projects ─────────────────────────────────────────────

export type ProjectStage =
  | 'discovery'
  | 'design'
  | 'build'
  | 'uat'
  | 'launch'
  | 'hypercare'
  | 'closed'

export type ProjectBilling = 'fixed' | 't-and-m' | 'hybrid'
export type ProjectKind = 'web-app' | 'mobile-app' | 'crm' | 'ai-tool' | 'integration'

export interface BespokeProject {
  id: string
  name: string
  accountId?: string
  accountName?: string
  type: ProjectKind
  stage: ProjectStage
  billing: ProjectBilling
  contractValue: number
  burned: number
  startedAt?: string
  targetGoLive?: string
  health: Health
  lead?: string
  team: number
  milestonesTotal: number
  milestonesDone: number
  milestones?: Milestone[]
  createdAt: string
  updatedAt: string
}

export interface CreateBespokeProjectRequest {
  name: string
  accountId?: string
  type?: ProjectKind
  stage?: ProjectStage
  billing?: ProjectBilling
  contractValue?: number
  burned?: number
  startedAt?: string
  targetGoLive?: string
  health?: Health
  lead?: string
  team?: number
}
export type UpdateBespokeProjectRequest = Partial<CreateBespokeProjectRequest>

// ─── Tickets ───────────────────────────────────────────────────────────────

export type TicketPriority = 'p1' | 'p2' | 'p3' | 'p4'
export type TicketStatus = 'open' | 'in-progress' | 'awaiting-client' | 'resolved'
export type TicketCategory = 'incident' | 'request' | 'change' | 'project'

export interface TicketComment {
  id: string
  author: string
  body: string
  createdAt: string
}

export interface Ticket {
  id: string
  accountId?: string
  accountName?: string
  subject: string
  description?: string
  priority: TicketPriority
  status: TicketStatus
  assignee?: string
  category: TicketCategory
  openedAt: string
  slaTarget?: string
  resolvedAt?: string
  comments?: TicketComment[]
  createdAt: string
  updatedAt: string
}

export interface CreateTicketRequest {
  accountId?: string
  subject: string
  description?: string
  priority?: TicketPriority
  status?: TicketStatus
  assignee?: string
  category?: TicketCategory
  slaTarget?: string
}
export type UpdateTicketRequest = Partial<CreateTicketRequest>

export interface AddTicketCommentRequest {
  body: string
}

// ─── Documents ─────────────────────────────────────────────────────────────

export type DocumentKind = 'sow' | 'msa' | 'proposal' | 'report' | 'policy' | 'invoice' | 'other'

export interface CrmDocument {
  id: string
  name: string
  kind: DocumentKind
  accountId?: string
  accountName?: string
  /** Storage key / signed-URL source (R2). */
  storageKey?: string
  url?: string
  sizeBytes?: number
  mimeType?: string
  uploadedBy?: string
  createdAt: string
}

export interface CreateDocumentRequest {
  name: string
  kind?: DocumentKind
  accountId?: string
  storageKey?: string
  url?: string
  sizeBytes?: number
  mimeType?: string
}

// ─── Service catalog (admin-managed) ───────────────────────────────────────

export type ServiceCatalogCategory =
  | 'managed'
  | 'security'
  | 'cloud'
  | 'communications'
  | 'build'
  | 'marketing'

export type BillingUnit = 'per-seat-month' | 'per-month' | 'fixed' | 'hourly' | 'retainer'

export interface ServiceCatalogItem {
  id: string
  slug: string
  name: string
  category: ServiceCatalogCategory
  summary?: string
  /** Default unit price in whole dollars. */
  defaultRate: number
  billingUnit: BillingUnit
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServiceCatalogItemRequest {
  slug: string
  name: string
  category: ServiceCatalogCategory
  summary?: string
  defaultRate?: number
  billingUnit?: BillingUnit
  active?: boolean
}
export type UpdateServiceCatalogItemRequest = Partial<CreateServiceCatalogItemRequest>

// ─── Marketing / GoHighLevel (GHL) implementation engagements ──────────────

export type MarketingServiceKind =
  | 'ghl-implementation'
  | 'seo'
  | 'paid-ads'
  | 'social'
  | 'web-design'
  | 'email-automation'
  | 'reputation'
  | 'full-funnel'

export type MarketingStatus =
  | 'scoping'
  | 'onboarding'
  | 'building'
  | 'live'
  | 'optimizing'
  | 'paused'
  | 'closed'

export interface MarketingDeliverable {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  dueDate?: string
  order: number
}

export interface MarketingEngagement {
  id: string
  name: string
  accountId?: string
  accountName?: string
  kind: MarketingServiceKind
  status: MarketingStatus
  health: Health
  /** Monthly retainer in whole dollars. */
  monthlyRetainer: number
  /** One-time setup/build fee in whole dollars. */
  setupFee: number
  owner?: string
  /** GoHighLevel sub-account / location id when kind = ghl-implementation. */
  ghlLocationId?: string
  startedAt?: string
  goLiveTarget?: string
  notes?: string
  deliverables?: MarketingDeliverable[]
  createdAt: string
  updatedAt: string
}

export interface CreateMarketingEngagementRequest {
  name: string
  accountId?: string
  kind?: MarketingServiceKind
  status?: MarketingStatus
  health?: Health
  monthlyRetainer?: number
  setupFee?: number
  owner?: string
  ghlLocationId?: string
  startedAt?: string
  goLiveTarget?: string
  notes?: string
}
export type UpdateMarketingEngagementRequest = Partial<CreateMarketingEngagementRequest>

// ─── Dashboard / reports ───────────────────────────────────────────────────

export interface DashboardMetrics {
  pipelineValue: number
  weightedPipelineValue: number
  mrr: number
  arr: number
  openTickets: number
  p1Open: number
  activeEngagements: number
  leadsThisWeek: number
  accountsTotal: number
  accountsAtRisk: number
  marketingMrr: number
}

export interface PipelineStageRollup {
  stage: OpportunityStage
  count: number
  value: number
}

export interface ReportsSummary {
  metrics: DashboardMetrics
  pipelineByStage: PipelineStageRollup[]
  revenueByService: { service: string; mrr: number }[]
}

// ─── Activity feed (from audit_log) ────────────────────────────────────────

export interface ActivityEvent {
  id: string
  actor: string
  action: string
  entity: string
  entityId?: string
  summary?: string
  occurredAt: string
}

// ─── Users (admin management) ──────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string
  name: string
  role: Role
  accountId?: string
  accountName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  name: string
  role: Role
  accountId?: string
}
export type UpdateUserRequest = Partial<Omit<CreateUserRequest, 'email'>>
