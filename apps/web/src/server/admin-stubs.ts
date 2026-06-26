/**
 * Phase 1 admin stub data — representative records so the admin UI looks
 * real before the Nest API ships. When the API lands, replace each export
 * with the corresponding fetcher (see server/api-client.ts).
 */

export type LeadStatus = 'new' | 'qualifying' | 'qualified' | 'disqualified' | 'converted'
export type LeadSource =
  | 'contact_form'
  | 'free_it_audit'
  | 'service_inquiry'
  | 'bespoke_scope_request'
  | 'phone'
  | 'referral'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  industry: 'healthcare' | 'financial-services' | 'professional-services'
  serviceInterest?: string
  source: LeadSource
  message?: string
  status: LeadStatus
  receivedAt: string
  owner?: string
  /** Health score 0–100 derived from intake answers. */
  score: number
}

export const LEADS: Lead[] = [
  {
    id: 'LD-2026-0142',
    name: 'Dr. Aisha Patel',
    email: 'apatel@meadowridgepeds.com',
    phone: '+1 609 555 0142',
    company: 'Meadow Ridge Pediatrics',
    industry: 'healthcare',
    serviceInterest: 'compliance',
    source: 'free_it_audit',
    message:
      'Adding a second location in Q3. Need HIPAA-aware infra review and a single sign-on rollout for both sites.',
    status: 'qualifying',
    receivedAt: '2026-05-29T14:22:00Z',
    owner: 'Sohail Akram',
    score: 86,
  },
  {
    id: 'LD-2026-0141',
    name: 'Marcus Chen',
    email: 'mchen@chenwealth.com',
    company: 'Chen Wealth Advisors',
    industry: 'financial-services',
    serviceInterest: 'cybersecurity',
    source: 'service_inquiry',
    message: 'NYDFS audit in October. Want a posture review and remediation plan.',
    status: 'new',
    receivedAt: '2026-05-29T11:04:00Z',
    score: 78,
  },
  {
    id: 'LD-2026-0140',
    name: 'Diana Forester',
    email: 'diana@foresterlegal.com',
    phone: '+1 732 555 0119',
    company: 'Forester & Hayes LLP',
    industry: 'professional-services',
    serviceInterest: 'managed-it',
    source: 'contact_form',
    message: 'Current MSP is unresponsive. 38 attorneys, two offices.',
    status: 'qualified',
    receivedAt: '2026-05-28T09:18:00Z',
    owner: 'Sohail Akram',
    score: 92,
  },
  {
    id: 'LD-2026-0139',
    name: 'Jonas Berg',
    email: 'jb@northcoastdermo.com',
    company: 'North Coast Dermatology',
    industry: 'healthcare',
    serviceInterest: 'bespoke-software',
    source: 'bespoke_scope_request',
    message: 'Want a custom patient intake portal that signs into our EHR via SAML.',
    status: 'new',
    receivedAt: '2026-05-28T08:55:00Z',
    score: 71,
  },
  {
    id: 'LD-2026-0138',
    name: 'Priya Raghavan',
    email: 'praghavan@bridgecapital.com',
    company: 'Bridge Capital Partners',
    industry: 'financial-services',
    source: 'phone',
    message: 'Referral from Marcus at Lexington Asset. Looking for managed cybersecurity.',
    status: 'qualifying',
    receivedAt: '2026-05-27T16:40:00Z',
    owner: 'Sohail Akram',
    score: 81,
  },
  {
    id: 'LD-2026-0137',
    name: 'Robert Yi',
    email: 'rob.yi@brookhavendental.com',
    company: 'Brookhaven Dental',
    industry: 'healthcare',
    serviceInterest: 'business-phone',
    source: 'service_inquiry',
    status: 'disqualified',
    receivedAt: '2026-05-26T13:11:00Z',
    score: 34,
  },
]

export type AccountTier = 'enterprise' | 'mid-market' | 'smb'
export type AccountStatus = 'active' | 'at-risk' | 'onboarding' | 'churned'

export interface Account {
  id: string
  name: string
  industry: 'healthcare' | 'financial-services' | 'professional-services'
  tier: AccountTier
  primaryContact: string
  primaryEmail: string
  mrr: number
  seats: number
  status: AccountStatus
  health: 'excellent' | 'good' | 'watch' | 'critical'
  since: string
  nextRenewal: string
  activeEngagements: number
  openTickets: number
  servicesUsed: string[]
}

export const ACCOUNTS: Account[] = [
  {
    id: 'AC-0091',
    name: 'Lakeside Medical Group',
    industry: 'healthcare',
    tier: 'mid-market',
    primaryContact: 'Dr. Helena Martinez',
    primaryEmail: 'hmartinez@lakesidemed.com',
    mrr: 18400,
    seats: 142,
    status: 'active',
    health: 'excellent',
    since: '2021-08-12',
    nextRenewal: '2027-02-01',
    activeEngagements: 2,
    openTickets: 1,
    servicesUsed: ['managed-it', 'compliance', 'cloud'],
  },
  {
    id: 'AC-0083',
    name: 'Riverbend Capital Advisors',
    industry: 'financial-services',
    tier: 'enterprise',
    primaryContact: 'Theodore Hahn',
    primaryEmail: 'thahn@riverbendca.com',
    mrr: 32100,
    seats: 218,
    status: 'active',
    health: 'good',
    since: '2020-03-04',
    nextRenewal: '2026-09-15',
    activeEngagements: 3,
    openTickets: 4,
    servicesUsed: ['managed-it', 'cybersecurity', 'compliance'],
  },
  {
    id: 'AC-0078',
    name: 'Sterling & Park Attorneys',
    industry: 'professional-services',
    tier: 'mid-market',
    primaryContact: 'Margaret Park',
    primaryEmail: 'mpark@sterlingpark.com',
    mrr: 11800,
    seats: 64,
    status: 'active',
    health: 'watch',
    since: '2022-11-29',
    nextRenewal: '2026-12-01',
    activeEngagements: 1,
    openTickets: 7,
    servicesUsed: ['managed-it', 'business-phone'],
  },
  {
    id: 'AC-0102',
    name: 'Eastfield Behavioral Health',
    industry: 'healthcare',
    tier: 'smb',
    primaryContact: 'Dr. Ramon Velasquez',
    primaryEmail: 'rvelasquez@eastfieldbh.com',
    mrr: 6900,
    seats: 38,
    status: 'onboarding',
    health: 'good',
    since: '2026-04-10',
    nextRenewal: '2027-04-10',
    activeEngagements: 1,
    openTickets: 2,
    servicesUsed: ['managed-it', 'compliance'],
  },
  {
    id: 'AC-0066',
    name: 'Harrowgate Insurance',
    industry: 'financial-services',
    tier: 'mid-market',
    primaryContact: 'Carol Whitten',
    primaryEmail: 'cwhitten@harrowgateins.com',
    mrr: 14200,
    seats: 96,
    status: 'at-risk',
    health: 'critical',
    since: '2019-06-18',
    nextRenewal: '2026-07-01',
    activeEngagements: 1,
    openTickets: 11,
    servicesUsed: ['managed-it', 'cybersecurity'],
  },
  {
    id: 'AC-0097',
    name: 'Verde Health Partners',
    industry: 'healthcare',
    tier: 'enterprise',
    primaryContact: 'Dr. Mei-Lin Wu',
    primaryEmail: 'mlw@verdehealth.org',
    mrr: 41200,
    seats: 312,
    status: 'active',
    health: 'excellent',
    since: '2018-01-22',
    nextRenewal: '2026-11-15',
    activeEngagements: 4,
    openTickets: 3,
    servicesUsed: ['managed-it', 'cybersecurity', 'compliance', 'cloud', 'bespoke-software'],
  },
]

export type ProjectStage =
  | 'discovery'
  | 'design'
  | 'build'
  | 'uat'
  | 'launch'
  | 'hypercare'
  | 'closed'

export type ProjectBilling = 'fixed' | 't-and-m' | 'hybrid'

export interface BespokeProject {
  id: string
  name: string
  accountId: string
  accountName: string
  type: 'web-app' | 'mobile-app' | 'crm' | 'ai-tool' | 'integration'
  stage: ProjectStage
  billing: ProjectBilling
  contractValue: number
  burned: number
  startedAt: string
  targetGoLive: string
  health: 'green' | 'amber' | 'red'
  lead: string
  team: number
  milestonesTotal: number
  milestonesDone: number
}

export const BESPOKE_PROJECTS: BespokeProject[] = [
  {
    id: 'BP-2026-014',
    name: 'Lakeside Patient Intake Portal',
    accountId: 'AC-0091',
    accountName: 'Lakeside Medical Group',
    type: 'web-app',
    stage: 'build',
    billing: 'fixed',
    contractValue: 142000,
    burned: 86000,
    startedAt: '2026-02-04',
    targetGoLive: '2026-08-30',
    health: 'green',
    lead: 'Sohail Akram',
    team: 4,
    milestonesTotal: 9,
    milestonesDone: 5,
  },
  {
    id: 'BP-2026-013',
    name: 'Verde Field Care Mobile App',
    accountId: 'AC-0097',
    accountName: 'Verde Health Partners',
    type: 'mobile-app',
    stage: 'design',
    billing: 't-and-m',
    contractValue: 320000,
    burned: 58000,
    startedAt: '2026-04-22',
    targetGoLive: '2027-01-15',
    health: 'amber',
    lead: 'Sohail Akram',
    team: 5,
    milestonesTotal: 12,
    milestonesDone: 3,
  },
  {
    id: 'BP-2026-012',
    name: 'Riverbend Compliance Triage AI',
    accountId: 'AC-0083',
    accountName: 'Riverbend Capital Advisors',
    type: 'ai-tool',
    stage: 'uat',
    billing: 'fixed',
    contractValue: 88000,
    burned: 82000,
    startedAt: '2026-01-10',
    targetGoLive: '2026-06-12',
    health: 'green',
    lead: 'Sohail Akram',
    team: 3,
    milestonesTotal: 7,
    milestonesDone: 6,
  },
  {
    id: 'BP-2026-011',
    name: 'Sterling EHR ↔ Billing Integration',
    accountId: 'AC-0078',
    accountName: 'Sterling & Park Attorneys',
    type: 'integration',
    stage: 'discovery',
    billing: 'hybrid',
    contractValue: 46000,
    burned: 11000,
    startedAt: '2026-05-12',
    targetGoLive: '2026-09-30',
    health: 'green',
    lead: 'Sohail Akram',
    team: 2,
    milestonesTotal: 6,
    milestonesDone: 1,
  },
  {
    id: 'BP-2026-010',
    name: 'Harrowgate Underwriting CRM',
    accountId: 'AC-0066',
    accountName: 'Harrowgate Insurance',
    type: 'crm',
    stage: 'hypercare',
    billing: 'fixed',
    contractValue: 268000,
    burned: 262000,
    startedAt: '2025-09-01',
    targetGoLive: '2026-05-05',
    health: 'red',
    lead: 'Sohail Akram',
    team: 6,
    milestonesTotal: 11,
    milestonesDone: 11,
  },
]

export type EngagementType = 'managed' | 'project' | 'discovery'
export type EngagementStatus = 'active' | 'onboarding' | 'paused' | 'renewing' | 'closed'

export interface Engagement {
  id: string
  name: string
  accountId: string
  accountName: string
  type: EngagementType
  status: EngagementStatus
  stage: string
  health: 'green' | 'amber' | 'red'
  startedAt: string
  nextMilestone: string
  nextMilestoneDue: string
  mrrOrValue: number
  serviceSlug: string
}

export const ENGAGEMENTS: Engagement[] = [
  {
    id: 'EG-2026-0088',
    name: 'Verde — Managed cyber retainer',
    accountId: 'AC-0097',
    accountName: 'Verde Health Partners',
    type: 'managed',
    status: 'active',
    stage: 'Ongoing operations',
    health: 'green',
    startedAt: '2018-01-22',
    nextMilestone: 'Q2 Quarterly Business Review',
    nextMilestoneDue: '2026-06-12',
    mrrOrValue: 18200,
    serviceSlug: 'cybersecurity',
  },
  {
    id: 'EG-2026-0087',
    name: 'Riverbend — SOC 2 readiness',
    accountId: 'AC-0083',
    accountName: 'Riverbend Capital Advisors',
    type: 'project',
    status: 'active',
    stage: 'Execution',
    health: 'amber',
    startedAt: '2026-03-04',
    nextMilestone: 'Evidence collection sign-off',
    nextMilestoneDue: '2026-06-04',
    mrrOrValue: 92000,
    serviceSlug: 'compliance',
  },
  {
    id: 'EG-2026-0086',
    name: 'Eastfield — Onboarding sprint',
    accountId: 'AC-0102',
    accountName: 'Eastfield Behavioral Health',
    type: 'managed',
    status: 'onboarding',
    stage: 'Kickoff',
    health: 'green',
    startedAt: '2026-04-10',
    nextMilestone: 'Asset inventory complete',
    nextMilestoneDue: '2026-06-02',
    mrrOrValue: 6900,
    serviceSlug: 'managed-it',
  },
  {
    id: 'EG-2026-0085',
    name: 'Lakeside — HIPAA program rebuild',
    accountId: 'AC-0091',
    accountName: 'Lakeside Medical Group',
    type: 'project',
    status: 'active',
    stage: 'Milestone approval',
    health: 'green',
    startedAt: '2026-01-08',
    nextMilestone: 'Policy pack v2 review',
    nextMilestoneDue: '2026-06-01',
    mrrOrValue: 44000,
    serviceSlug: 'compliance',
  },
  {
    id: 'EG-2026-0084',
    name: 'Harrowgate — Network rearchitecture',
    accountId: 'AC-0066',
    accountName: 'Harrowgate Insurance',
    type: 'project',
    status: 'paused',
    stage: 'Execution',
    health: 'red',
    startedAt: '2026-02-20',
    nextMilestone: 'Awaiting client sign-off',
    nextMilestoneDue: '2026-05-21',
    mrrOrValue: 64000,
    serviceSlug: 'network',
  },
]

export interface Ticket {
  id: string
  accountId: string
  accountName: string
  subject: string
  priority: 'p1' | 'p2' | 'p3' | 'p4'
  status: 'open' | 'in-progress' | 'awaiting-client' | 'resolved'
  assignee: string
  openedAt: string
  slaTarget: string
  category: 'incident' | 'request' | 'change' | 'project'
}

export const TICKETS: Ticket[] = [
  {
    id: 'T-26-1042',
    accountId: 'AC-0066',
    accountName: 'Harrowgate Insurance',
    subject: 'VPN tunnel down between HQ and Princeton DR site',
    priority: 'p1',
    status: 'in-progress',
    assignee: 'Sohail Akram',
    openedAt: '2026-05-30T07:14:00Z',
    slaTarget: '2026-05-30T08:14:00Z',
    category: 'incident',
  },
  {
    id: 'T-26-1041',
    accountId: 'AC-0083',
    accountName: 'Riverbend Capital Advisors',
    subject: 'Conditional access blocking remote auditor',
    priority: 'p2',
    status: 'awaiting-client',
    assignee: 'Sohail Akram',
    openedAt: '2026-05-30T06:02:00Z',
    slaTarget: '2026-05-30T18:02:00Z',
    category: 'request',
  },
  {
    id: 'T-26-1040',
    accountId: 'AC-0091',
    accountName: 'Lakeside Medical Group',
    subject: 'New employee onboarding — clinical team',
    priority: 'p3',
    status: 'open',
    assignee: 'Unassigned',
    openedAt: '2026-05-29T22:48:00Z',
    slaTarget: '2026-06-02T22:48:00Z',
    category: 'request',
  },
  {
    id: 'T-26-1039',
    accountId: 'AC-0078',
    accountName: 'Sterling & Park Attorneys',
    subject: 'Outlook indexing failing on partner laptops',
    priority: 'p2',
    status: 'in-progress',
    assignee: 'Sohail Akram',
    openedAt: '2026-05-29T19:30:00Z',
    slaTarget: '2026-05-30T07:30:00Z',
    category: 'incident',
  },
  {
    id: 'T-26-1038',
    accountId: 'AC-0097',
    accountName: 'Verde Health Partners',
    subject: 'EHR maintenance window approval',
    priority: 'p3',
    status: 'awaiting-client',
    assignee: 'Sohail Akram',
    openedAt: '2026-05-29T14:10:00Z',
    slaTarget: '2026-06-01T14:10:00Z',
    category: 'change',
  },
  {
    id: 'T-26-1037',
    accountId: 'AC-0102',
    accountName: 'Eastfield Behavioral Health',
    subject: 'M365 license uplift for new clinicians',
    priority: 'p3',
    status: 'resolved',
    assignee: 'Sohail Akram',
    openedAt: '2026-05-28T09:00:00Z',
    slaTarget: '2026-05-30T09:00:00Z',
    category: 'request',
  },
]

// ─── Opportunities ──────────────────────────────────────────────────────────

export type OpportunityStage =
  | 'new'
  | 'qualified'
  | 'proposal'
  | 'sow-sent'
  | 'closed-won'
  | 'closed-lost'

export type OpportunityType = 'new-business' | 'expansion' | 'renewal'
export type LossReason = 'price' | 'incumbent' | 'no-decision' | 'wrong-fit' | 'other'

export interface OpportunityAttachment {
  id: string
  kind: 'quote' | 'proposal' | 'sow' | 'msa' | 'other'
  name: string
  addedAt: string
  addedBy: string
}

export interface OpportunityLineItem {
  id: string
  service: string
  qty: number
  rate: number
  recurring: boolean
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
  /** Linked account if known, otherwise free-text prospect. */
  accountId?: string
  prospectName: string
  industry: 'healthcare' | 'financial-services' | 'professional-services'
  type: OpportunityType
  stage: OpportunityStage
  /** Annual contract value */
  value: number
  /** 0–100 — used for weighted pipeline value */
  probability: number
  expectedClose: string
  owner: string
  source: 'contact_form' | 'free_it_audit' | 'service_inquiry' | 'phone' | 'referral' | 'rfp'
  /** Service slugs in scope. */
  servicesInScope: string[]
  attachments: OpportunityAttachment[]
  lineItems: OpportunityLineItem[]
  activity: OpportunityActivity[]
  createdAt: string
  lostReason?: LossReason
  lostNote?: string
  primaryContact: string
  primaryEmail: string
}

const OPP_BASE_DATE = '2026-05-30T12:00:00Z'

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'OPP-2026-0041',
    name: 'Meadow Ridge · multi-site HIPAA rollout',
    prospectName: 'Meadow Ridge Pediatrics',
    industry: 'healthcare',
    type: 'new-business',
    stage: 'new',
    value: 168000,
    probability: 20,
    expectedClose: '2026-08-15',
    owner: 'Sohail Akram',
    source: 'free_it_audit',
    servicesInScope: ['managed-it', 'compliance'],
    attachments: [],
    lineItems: [
      { id: 'li-1', service: 'managed-it', qty: 64, rate: 120, recurring: true },
      { id: 'li-2', service: 'compliance', qty: 1, rate: 18000, recurring: false },
    ],
    activity: [
      {
        id: 'oa-1',
        ts: '2026-05-29T14:22:00Z',
        kind: 'stage',
        actor: 'System',
        text: 'Opportunity opened from lead LD-2026-0142.',
      },
    ],
    createdAt: '2026-05-29T14:22:00Z',
    primaryContact: 'Dr. Aisha Patel',
    primaryEmail: 'apatel@meadowridgepeds.com',
  },
  {
    id: 'OPP-2026-0040',
    name: 'Forester & Hayes · MSP switch',
    accountId: undefined,
    prospectName: 'Forester & Hayes LLP',
    industry: 'professional-services',
    type: 'new-business',
    stage: 'qualified',
    value: 92000,
    probability: 45,
    expectedClose: '2026-07-20',
    owner: 'Sohail Akram',
    source: 'contact_form',
    servicesInScope: ['managed-it', 'cybersecurity'],
    attachments: [],
    lineItems: [
      { id: 'li-1', service: 'managed-it', qty: 38, rate: 120, recurring: true },
      { id: 'li-2', service: 'cybersecurity', qty: 38, rate: 45, recurring: true },
    ],
    activity: [
      {
        id: 'oa-1',
        ts: '2026-05-28T09:18:00Z',
        kind: 'stage',
        actor: 'System',
        text: 'Opportunity opened.',
      },
      {
        id: 'oa-2',
        ts: '2026-05-28T15:00:00Z',
        kind: 'meeting',
        actor: 'Sohail Akram',
        text: '30-minute scoping call with Diana Forester. Two-office network, 38 attorneys.',
      },
      {
        id: 'oa-3',
        ts: '2026-05-29T11:30:00Z',
        kind: 'stage',
        actor: 'Sohail Akram',
        text: 'Stage advanced: New → Qualified. Budget confirmed.',
      },
    ],
    createdAt: '2026-05-28T09:18:00Z',
    primaryContact: 'Diana Forester',
    primaryEmail: 'diana@foresterlegal.com',
  },
  {
    id: 'OPP-2026-0039',
    name: 'Chen Wealth · NYDFS readiness',
    prospectName: 'Chen Wealth Advisors',
    industry: 'financial-services',
    type: 'new-business',
    stage: 'qualified',
    value: 64000,
    probability: 50,
    expectedClose: '2026-09-30',
    owner: 'Sohail Akram',
    source: 'service_inquiry',
    servicesInScope: ['cybersecurity', 'compliance'],
    attachments: [],
    lineItems: [
      { id: 'li-1', service: 'compliance', qty: 1, rate: 24000, recurring: false },
      { id: 'li-2', service: 'cybersecurity', qty: 18, rate: 45, recurring: true },
    ],
    activity: [
      { id: 'oa-1', ts: '2026-05-29T11:04:00Z', kind: 'stage', actor: 'System', text: 'Opportunity opened.' },
    ],
    createdAt: '2026-05-29T11:04:00Z',
    primaryContact: 'Marcus Chen',
    primaryEmail: 'mchen@chenwealth.com',
  },
  {
    id: 'OPP-2026-0038',
    name: 'Bridge Capital · managed cyber retainer',
    prospectName: 'Bridge Capital Partners',
    industry: 'financial-services',
    type: 'new-business',
    stage: 'proposal',
    value: 124000,
    probability: 60,
    expectedClose: '2026-07-05',
    owner: 'Sohail Akram',
    source: 'referral',
    servicesInScope: ['cybersecurity', 'managed-it'],
    attachments: [
      {
        id: 'att-1',
        kind: 'quote',
        name: 'Bridge Capital · Quote v2.pdf',
        addedAt: '2026-05-27T16:40:00Z',
        addedBy: 'Sohail Akram',
      },
    ],
    lineItems: [
      { id: 'li-1', service: 'managed-it', qty: 48, rate: 120, recurring: true },
      { id: 'li-2', service: 'cybersecurity', qty: 48, rate: 45, recurring: true },
    ],
    activity: [
      { id: 'oa-1', ts: '2026-05-27T16:40:00Z', kind: 'stage', actor: 'System', text: 'Opportunity opened.' },
      {
        id: 'oa-2',
        ts: '2026-05-29T10:12:00Z',
        kind: 'attachment',
        actor: 'Sohail Akram',
        text: 'Quote v2 attached.',
      },
      {
        id: 'oa-3',
        ts: '2026-05-29T10:13:00Z',
        kind: 'stage',
        actor: 'Sohail Akram',
        text: 'Stage advanced: Qualified → Proposal.',
      },
    ],
    createdAt: '2026-05-27T16:40:00Z',
    primaryContact: 'Priya Raghavan',
    primaryEmail: 'praghavan@bridgecapital.com',
  },
  {
    id: 'OPP-2026-0037',
    name: 'Sterling & Park · SoW for HIPAA rebuild',
    accountId: 'AC-0078',
    prospectName: 'Sterling & Park Attorneys',
    industry: 'professional-services',
    type: 'expansion',
    stage: 'sow-sent',
    value: 86000,
    probability: 75,
    expectedClose: '2026-06-15',
    owner: 'Sohail Akram',
    source: 'service_inquiry',
    servicesInScope: ['compliance'],
    attachments: [
      {
        id: 'att-1',
        kind: 'proposal',
        name: 'Sterling · Proposal v3.pdf',
        addedAt: '2026-05-26T09:00:00Z',
        addedBy: 'Sohail Akram',
      },
      {
        id: 'att-2',
        kind: 'sow',
        name: 'Sterling · SoW.pdf',
        addedAt: '2026-05-28T17:30:00Z',
        addedBy: 'Sohail Akram',
      },
    ],
    lineItems: [
      { id: 'li-1', service: 'compliance', qty: 1, rate: 86000, recurring: false },
    ],
    activity: [
      { id: 'oa-1', ts: '2026-05-20T09:00:00Z', kind: 'stage', actor: 'System', text: 'Opportunity opened.' },
      {
        id: 'oa-2',
        ts: '2026-05-28T17:30:00Z',
        kind: 'attachment',
        actor: 'Sohail Akram',
        text: 'SoW attached and sent via DocuSeal.',
      },
      {
        id: 'oa-3',
        ts: '2026-05-28T17:32:00Z',
        kind: 'stage',
        actor: 'Sohail Akram',
        text: 'Stage advanced: Proposal → SoW sent.',
      },
    ],
    createdAt: '2026-05-20T09:00:00Z',
    primaryContact: 'Margaret Park',
    primaryEmail: 'mpark@sterlingpark.com',
  },
  {
    id: 'OPP-2026-0036',
    name: 'Eastfield Behavioral · managed retainer (closed)',
    accountId: 'AC-0102',
    prospectName: 'Eastfield Behavioral Health',
    industry: 'healthcare',
    type: 'new-business',
    stage: 'closed-won',
    value: 82800,
    probability: 100,
    expectedClose: '2026-04-10',
    owner: 'Sohail Akram',
    source: 'free_it_audit',
    servicesInScope: ['managed-it', 'compliance'],
    attachments: [
      {
        id: 'att-1',
        kind: 'sow',
        name: 'Eastfield · SoW (signed).pdf',
        addedAt: '2026-04-08T13:00:00Z',
        addedBy: 'Sohail Akram',
      },
      {
        id: 'att-2',
        kind: 'msa',
        name: 'Eastfield · MSA (signed).pdf',
        addedAt: '2026-04-08T13:00:00Z',
        addedBy: 'Sohail Akram',
      },
    ],
    lineItems: [
      { id: 'li-1', service: 'managed-it', qty: 38, rate: 120, recurring: true },
      { id: 'li-2', service: 'compliance', qty: 1, rate: 18000, recurring: false },
    ],
    activity: [
      { id: 'oa-1', ts: '2026-03-12T10:00:00Z', kind: 'stage', actor: 'System', text: 'Opportunity opened.' },
      { id: 'oa-2', ts: '2026-04-08T13:00:00Z', kind: 'attachment', actor: 'Sohail Akram', text: 'SoW signed.' },
      {
        id: 'oa-3',
        ts: '2026-04-08T13:05:00Z',
        kind: 'stage',
        actor: 'Sohail Akram',
        text: 'Stage advanced: SoW sent → Closed Won. Account AC-0102 created.',
      },
    ],
    createdAt: '2026-03-12T10:00:00Z',
    primaryContact: 'Dr. Ramon Velasquez',
    primaryEmail: 'rvelasquez@eastfieldbh.com',
  },
  {
    id: 'OPP-2026-0035',
    name: 'Brookhaven Dental · phone replacement (lost)',
    prospectName: 'Brookhaven Dental',
    industry: 'healthcare',
    type: 'new-business',
    stage: 'closed-lost',
    value: 16800,
    probability: 0,
    expectedClose: '2026-05-15',
    owner: 'Sohail Akram',
    source: 'service_inquiry',
    servicesInScope: ['business-phone'],
    attachments: [],
    lineItems: [{ id: 'li-1', service: 'business-phone', qty: 12, rate: 28, recurring: true }],
    activity: [
      { id: 'oa-1', ts: '2026-04-15T09:00:00Z', kind: 'stage', actor: 'System', text: 'Opportunity opened.' },
      {
        id: 'oa-2',
        ts: '2026-05-12T14:30:00Z',
        kind: 'stage',
        actor: 'Sohail Akram',
        text: 'Closed lost — went with incumbent.',
      },
    ],
    createdAt: '2026-04-15T09:00:00Z',
    primaryContact: 'Robert Yi',
    primaryEmail: 'rob.yi@brookhavendental.com',
    lostReason: 'incumbent',
    lostNote: 'Already on Ring Central via legacy bundle.',
  },
]

// Stage gating — what's required before the stage transition is allowed.
export const STAGE_GATES: Partial<
  Record<OpportunityStage, { kind: OpportunityAttachment['kind']; label: string }[]>
> = {
  proposal: [{ kind: 'quote', label: 'Quote attached' }],
  'sow-sent': [
    { kind: 'proposal', label: 'Proposal attached' },
    { kind: 'sow', label: 'SoW drafted' },
  ],
  'closed-won': [{ kind: 'sow', label: 'Signed SoW' }],
}

void OPP_BASE_DATE

export const DASHBOARD_METRICS = {
  pipelineValue: 1_240_000,
  mrr: 184_700,
  arr: 184_700 * 12,
  openTickets: 28,
  p1Open: 1,
  activeEngagements: ENGAGEMENTS.filter((e) => e.status === 'active').length,
  npsRolling90: 64,
  csat: 4.7,
  uptime90: 99.984,
  milestoneOnTimeRate: 0.86,
  ticketSlaCompliance: 0.94,
  leadsThisWeek: LEADS.length,
}

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
  const now = new Date('2026-05-30T12:00:00Z').getTime()
  const diff = now - then
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
