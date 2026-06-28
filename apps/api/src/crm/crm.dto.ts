// Zod request schemas for the CRM/admin modules. One file keeps the contract
// surface reviewable in a single place; each controller imports the schemas
// it needs and validates with the shared ZodValidationPipe.

import { z } from 'zod'

const industry = z.enum([
  'healthcare',
  'financial-services',
  'professional-services',
  'other',
])

const isoDate = z.string().trim().min(1).max(40)

// ─── Accounts ──────────────────────────────────────────────────────────────

export const createAccountSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    industry: industry.optional(),
    tier: z.enum(['enterprise', 'mid-market', 'smb']).optional(),
    primaryContact: z.string().trim().max(200).optional(),
    primaryEmail: z.string().trim().email().max(320).optional(),
    mrr: z.number().int().min(0).optional(),
    seats: z.number().int().min(0).optional(),
    status: z.enum(['active', 'at-risk', 'onboarding', 'churned']).optional(),
    health: z.enum(['excellent', 'good', 'watch', 'critical']).optional(),
    since: isoDate.optional(),
    nextRenewal: isoDate.optional(),
    servicesUsed: z.array(z.string()).optional(),
  })
  .strict()
export const updateAccountSchema = createAccountSchema.partial()
export type CreateAccountDto = z.infer<typeof createAccountSchema>
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>

// ─── Contacts ──────────────────────────────────────────────────────────────

export const createContactSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().max(40).optional(),
    title: z.string().trim().max(160).optional(),
    accountId: z.string().uuid().optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict()
export const updateContactSchema = createContactSchema.partial()
export type CreateContactDto = z.infer<typeof createContactSchema>
export type UpdateContactDto = z.infer<typeof updateContactSchema>

// ─── Opportunities ─────────────────────────────────────────────────────────

const lineItem = z.object({
  service: z.string().trim().min(1).max(120),
  qty: z.number().int().min(0),
  rate: z.number().int().min(0),
  recurring: z.boolean(),
})

export const createOpportunitySchema = z
  .object({
    name: z.string().trim().min(1).max(240),
    accountId: z.string().uuid().optional(),
    prospectName: z.string().trim().min(1).max(200),
    industry: industry.optional(),
    type: z.enum(['new-business', 'expansion', 'renewal']).optional(),
    stage: z
      .enum(['new', 'qualified', 'proposal', 'sow-sent', 'closed-won', 'closed-lost'])
      .optional(),
    value: z.number().int().min(0).optional(),
    probability: z.number().int().min(0).max(100).optional(),
    expectedClose: isoDate.optional(),
    owner: z.string().trim().max(160).optional(),
    source: z
      .enum(['contact_form', 'free_it_audit', 'service_inquiry', 'phone', 'referral', 'rfp'])
      .optional(),
    servicesInScope: z.array(z.string()).optional(),
    primaryContact: z.string().trim().max(200).optional(),
    primaryEmail: z.string().trim().email().max(320).optional(),
    lineItems: z.array(lineItem).optional(),
  })
  .strict()

export const updateOpportunitySchema = createOpportunitySchema
  .partial()
  .extend({
    lostReason: z.enum(['price', 'incumbent', 'no-decision', 'wrong-fit', 'other']).optional(),
    lostNote: z.string().trim().max(2000).optional(),
  })

export const addOpportunityActivitySchema = z
  .object({
    kind: z.enum(['note', 'stage', 'attachment', 'call', 'email', 'meeting', 'value']),
    text: z.string().trim().min(1).max(2000),
  })
  .strict()

export type CreateOpportunityDto = z.infer<typeof createOpportunitySchema>
export type UpdateOpportunityDto = z.infer<typeof updateOpportunitySchema>
export type AddOpportunityActivityDto = z.infer<typeof addOpportunityActivitySchema>

// ─── Engagements ───────────────────────────────────────────────────────────

export const createEngagementSchema = z
  .object({
    name: z.string().trim().min(1).max(240),
    accountId: z.string().uuid(),
    type: z.enum(['managed', 'project', 'discovery']).optional(),
    status: z.enum(['active', 'onboarding', 'paused', 'renewing', 'closed']).optional(),
    stage: z.string().trim().max(160).optional(),
    health: z.enum(['green', 'amber', 'red']).optional(),
    startedAt: isoDate.optional(),
    nextMilestone: z.string().trim().max(240).optional(),
    nextMilestoneDue: isoDate.optional(),
    mrrOrValue: z.number().int().min(0).optional(),
    serviceSlug: z.string().trim().max(80).optional(),
  })
  .strict()
export const updateEngagementSchema = createEngagementSchema.partial()
export type CreateEngagementDto = z.infer<typeof createEngagementSchema>
export type UpdateEngagementDto = z.infer<typeof updateEngagementSchema>

const milestoneSchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    description: z.string().trim().max(2000).optional(),
    status: z
      .enum(['pending', 'in-progress', 'awaiting-approval', 'approved', 'blocked'])
      .optional(),
    dueDate: isoDate.optional(),
    order: z.number().int().min(0).optional(),
  })
  .strict()
export const createMilestoneSchema = milestoneSchema
export const updateMilestoneSchema = milestoneSchema.partial()
export type CreateMilestoneDto = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneDto = z.infer<typeof updateMilestoneSchema>

// ─── Bespoke projects ──────────────────────────────────────────────────────

export const createBespokeSchema = z
  .object({
    name: z.string().trim().min(1).max(240),
    accountId: z.string().uuid().optional(),
    type: z.enum(['web-app', 'mobile-app', 'crm', 'ai-tool', 'integration']).optional(),
    stage: z
      .enum(['discovery', 'design', 'build', 'uat', 'launch', 'hypercare', 'closed'])
      .optional(),
    billing: z.enum(['fixed', 't-and-m', 'hybrid']).optional(),
    contractValue: z.number().int().min(0).optional(),
    burned: z.number().int().min(0).optional(),
    startedAt: isoDate.optional(),
    targetGoLive: isoDate.optional(),
    health: z.enum(['green', 'amber', 'red']).optional(),
    lead: z.string().trim().max(160).optional(),
    team: z.number().int().min(0).optional(),
  })
  .strict()
export const updateBespokeSchema = createBespokeSchema.partial()
export type CreateBespokeDto = z.infer<typeof createBespokeSchema>
export type UpdateBespokeDto = z.infer<typeof updateBespokeSchema>

// ─── Tickets ───────────────────────────────────────────────────────────────

export const createTicketSchema = z
  .object({
    accountId: z.string().uuid().optional(),
    subject: z.string().trim().min(1).max(280),
    description: z.string().trim().max(5000).optional(),
    priority: z.enum(['p1', 'p2', 'p3', 'p4']).optional(),
    status: z.enum(['open', 'in-progress', 'awaiting-client', 'resolved']).optional(),
    assignee: z.string().trim().max(160).optional(),
    category: z.enum(['incident', 'request', 'change', 'project']).optional(),
    slaTarget: isoDate.optional(),
  })
  .strict()
export const updateTicketSchema = createTicketSchema.partial()
export const addTicketCommentSchema = z
  .object({ body: z.string().trim().min(1).max(5000) })
  .strict()
export type CreateTicketDto = z.infer<typeof createTicketSchema>
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>
export type AddTicketCommentDto = z.infer<typeof addTicketCommentSchema>

// ─── Documents ─────────────────────────────────────────────────────────────

export const createDocumentSchema = z
  .object({
    name: z.string().trim().min(1).max(280),
    kind: z
      .enum(['sow', 'msa', 'proposal', 'report', 'policy', 'invoice', 'other'])
      .optional(),
    accountId: z.string().uuid().optional(),
    storageKey: z.string().trim().max(512).optional(),
    url: z.string().trim().url().max(2000).optional(),
    sizeBytes: z.number().int().min(0).optional(),
    mimeType: z.string().trim().max(160).optional(),
  })
  .strict()
export type CreateDocumentDto = z.infer<typeof createDocumentSchema>

// ─── Service catalog ───────────────────────────────────────────────────────

export const createServiceCatalogSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9-]+$/, 'lowercase, digits and dashes only'),
    name: z.string().trim().min(1).max(200),
    category: z.enum(['managed', 'security', 'cloud', 'communications', 'build', 'marketing']),
    summary: z.string().trim().max(2000).optional(),
    defaultRate: z.number().int().min(0).optional(),
    billingUnit: z
      .enum(['per-seat-month', 'per-month', 'fixed', 'hourly', 'retainer'])
      .optional(),
    active: z.boolean().optional(),
  })
  .strict()
export const updateServiceCatalogSchema = createServiceCatalogSchema.partial()
export type CreateServiceCatalogDto = z.infer<typeof createServiceCatalogSchema>
export type UpdateServiceCatalogDto = z.infer<typeof updateServiceCatalogSchema>

// ─── Marketing / GHL engagements ───────────────────────────────────────────

export const createMarketingSchema = z
  .object({
    name: z.string().trim().min(1).max(240),
    accountId: z.string().uuid().optional(),
    kind: z
      .enum([
        'ghl-implementation',
        'seo',
        'paid-ads',
        'social',
        'web-design',
        'email-automation',
        'reputation',
        'full-funnel',
      ])
      .optional(),
    status: z
      .enum(['scoping', 'onboarding', 'building', 'live', 'optimizing', 'paused', 'closed'])
      .optional(),
    health: z.enum(['green', 'amber', 'red']).optional(),
    monthlyRetainer: z.number().int().min(0).optional(),
    setupFee: z.number().int().min(0).optional(),
    owner: z.string().trim().max(160).optional(),
    ghlLocationId: z.string().trim().max(120).optional(),
    startedAt: isoDate.optional(),
    goLiveTarget: isoDate.optional(),
    notes: z.string().trim().max(4000).optional(),
  })
  .strict()
export const updateMarketingSchema = createMarketingSchema.partial()
export const createDeliverableSchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    dueDate: isoDate.optional(),
    order: z.number().int().min(0).optional(),
  })
  .strict()
export const updateDeliverableSchema = createDeliverableSchema.partial()
export type CreateMarketingDto = z.infer<typeof createMarketingSchema>
export type UpdateMarketingDto = z.infer<typeof updateMarketingSchema>
export type CreateDeliverableDto = z.infer<typeof createDeliverableSchema>
export type UpdateDeliverableDto = z.infer<typeof updateDeliverableSchema>

// ─── Leads (admin update) ──────────────────────────────────────────────────

export const updateLeadSchema = z
  .object({
    status: z
      .enum([
        'new',
        'qualifying',
        'qualified',
        'contacted',
        'disqualified',
        'converted',
        'junk',
      ])
      .optional(),
    owner: z.string().trim().max(160).optional(),
    score: z.number().int().min(0).max(100).optional(),
    serviceInterest: z.string().trim().max(80).optional(),
    industry: industry.optional(),
  })
  .strict()
export type UpdateLeadDto = z.infer<typeof updateLeadSchema>

// ─── Users (admin management) ──────────────────────────────────────────────

const role = z.enum([
  'owner',
  'admin',
  'sales',
  'pm',
  'tech',
  'readonly',
  'client_primary',
  'client_user',
])

export const createUserSchema = z
  .object({
    email: z.string().trim().email().max(320),
    name: z.string().trim().min(1).max(200),
    role,
    accountId: z.string().uuid().optional(),
    // Optional initial password — required for client portal users so they can
    // sign in. Forces a reset on first login.
    initialPassword: z
      .string()
      .min(10, 'At least 10 characters')
      .max(200)
      .regex(/[A-Za-z]/, 'Must contain a letter')
      .regex(/[0-9]/, 'Must contain a number')
      .optional(),
  })
  .strict()
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    role: role.optional(),
    accountId: z.string().uuid().optional(),
  })
  .strict()
export type CreateUserDto = z.infer<typeof createUserSchema>
export type UpdateUserDto = z.infer<typeof updateUserSchema>

// ─── Billing — proposals & invoices ─────────────────────────────────────────

const billingLineItem = z
  .object({
    serviceSlug: z.string().trim().max(80).optional(),
    description: z.string().trim().min(1).max(500),
    qty: z.number().int().min(0).max(100000).optional(),
    unitPrice: z.number().int().min(0).optional(),
    unit: z.string().trim().max(40).optional(),
    recurring: z.boolean().optional(),
  })
  .strict()

export const createProposalSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    accountId: z.string().uuid().optional(),
    engagementId: z.string().uuid().optional(),
    clientName: z.string().trim().max(200).optional(),
    clientEmail: z.string().trim().email().max(320).optional(),
    status: z.enum(['draft', 'sent', 'accepted', 'declined', 'expired', 'converted']).optional(),
    issueDate: isoDate.optional(),
    validUntil: isoDate.optional(),
    currency: z.string().trim().length(3).optional(),
    notes: z.string().trim().max(4000).optional(),
    terms: z.string().trim().max(4000).optional(),
    taxRate: z.number().int().min(0).max(100).optional(),
    discount: z.number().int().min(0).optional(),
    owner: z.string().trim().max(120).optional(),
    lineItems: z.array(billingLineItem).max(200).optional(),
  })
  .strict()
export const updateProposalSchema = createProposalSchema.partial()
export type CreateProposalDto = z.infer<typeof createProposalSchema>
export type UpdateProposalDto = z.infer<typeof updateProposalSchema>

export const createInvoiceSchema = z
  .object({
    title: z.string().trim().max(200).optional(),
    accountId: z.string().uuid().optional(),
    engagementId: z.string().uuid().optional(),
    proposalId: z.string().uuid().optional(),
    clientName: z.string().trim().max(200).optional(),
    clientEmail: z.string().trim().email().max(320).optional(),
    status: z.enum(['draft', 'sent', 'partial', 'paid', 'overdue', 'void']).optional(),
    issueDate: isoDate.optional(),
    dueDate: isoDate.optional(),
    currency: z.string().trim().length(3).optional(),
    notes: z.string().trim().max(4000).optional(),
    terms: z.string().trim().max(4000).optional(),
    taxRate: z.number().int().min(0).max(100).optional(),
    discount: z.number().int().min(0).optional(),
    amountPaid: z.number().int().min(0).optional(),
    owner: z.string().trim().max(120).optional(),
    lineItems: z.array(billingLineItem).max(200).optional(),
  })
  .strict()
export const updateInvoiceSchema = createInvoiceSchema.partial()
export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceSchema>
