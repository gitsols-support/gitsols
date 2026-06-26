/**
 * Database seed — populates a fresh GITSOLS database with representative demo
 * data so the admin surfaces render real records on first deploy. Mirrors the
 * Phase-1 stub content (apps/web/src/server/admin-stubs.ts) plus the new
 * marketing / GoHighLevel engagements and service catalog.
 *
 * Run with:  pnpm --filter @gitsols/api db:seed
 * Idempotent: exits early if accounts already exist.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

// Dependency-free .env loader: in production (Railway) the vars are already in
// the environment; locally we hydrate from the repo-root .env if present.
if (!process.env.DATABASE_URL) {
  for (const p of ['../../.env', '../../../.env', '.env']) {
    try {
      for (const line of readFileSync(resolve(process.cwd(), p), 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
      break
    } catch {
      /* file not present — try next */
    }
  }
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is required to seed.')
  process.exit(1)
}

const client = postgres(url, { max: 1, prepare: false })
const db = drizzle(client, { schema })

async function main() {
  const existing = await db.select({ id: schema.accounts.id }).from(schema.accounts).limit(1)
  if (existing.length > 0) {
    console.log('• Accounts already present — skipping seed.')
    await client.end()
    return
  }
  console.log('Seeding GITSOLS demo data…')

  // ── Users ────────────────────────────────────────────────────────────────
  await db
    .insert(schema.users)
    .values([
      { email: 'sohail@gitsols.com', name: 'Sohail Akram', role: 'owner' },
      { email: 'pm@gitsols.com', name: 'Project Manager', role: 'pm' },
      { email: 'sales@gitsols.com', name: 'Sales Lead', role: 'sales' },
    ])
    .onConflictDoNothing()

  // ── Accounts ───────────────────────────────────────────────────────────────
  const accountsSeed = [
    {
      name: 'Lakeside Medical Group', slug: 'lakeside-medical', industry: 'healthcare',
      tier: 'mid-market' as const, status: 'active' as const, health: 'excellent' as const,
      primaryContact: 'Dr. Helena Martinez', primaryEmail: 'hmartinez@lakesidemed.com',
      mrr: 18400, seats: 142, since: '2021-08-12', nextRenewal: '2027-02-01',
      servicesUsed: ['managed-it', 'compliance', 'cloud'],
    },
    {
      name: 'Riverbend Capital Advisors', slug: 'riverbend-capital', industry: 'financial-services',
      tier: 'enterprise' as const, status: 'active' as const, health: 'good' as const,
      primaryContact: 'Theodore Hahn', primaryEmail: 'thahn@riverbendca.com',
      mrr: 32100, seats: 218, since: '2020-03-04', nextRenewal: '2026-09-15',
      servicesUsed: ['managed-it', 'cybersecurity', 'compliance'],
    },
    {
      name: 'Sterling & Park Attorneys', slug: 'sterling-park', industry: 'professional-services',
      tier: 'mid-market' as const, status: 'active' as const, health: 'watch' as const,
      primaryContact: 'Margaret Park', primaryEmail: 'mpark@sterlingpark.com',
      mrr: 11800, seats: 64, since: '2022-11-29', nextRenewal: '2026-12-01',
      servicesUsed: ['managed-it', 'business-phone'],
    },
    {
      name: 'Eastfield Behavioral Health', slug: 'eastfield-behavioral', industry: 'healthcare',
      tier: 'smb' as const, status: 'onboarding' as const, health: 'good' as const,
      primaryContact: 'Dr. Ramon Velasquez', primaryEmail: 'rvelasquez@eastfieldbh.com',
      mrr: 6900, seats: 38, since: '2026-04-10', nextRenewal: '2027-04-10',
      servicesUsed: ['managed-it', 'compliance'],
    },
    {
      name: 'Harrowgate Insurance', slug: 'harrowgate-insurance', industry: 'financial-services',
      tier: 'mid-market' as const, status: 'at-risk' as const, health: 'critical' as const,
      primaryContact: 'Carol Whitten', primaryEmail: 'cwhitten@harrowgateins.com',
      mrr: 14200, seats: 96, since: '2019-06-18', nextRenewal: '2026-07-01',
      servicesUsed: ['managed-it', 'cybersecurity'],
    },
    {
      name: 'Verde Health Partners', slug: 'verde-health', industry: 'healthcare',
      tier: 'enterprise' as const, status: 'active' as const, health: 'excellent' as const,
      primaryContact: 'Dr. Mei-Lin Wu', primaryEmail: 'mlw@verdehealth.org',
      mrr: 41200, seats: 312, since: '2018-01-22', nextRenewal: '2026-11-15',
      servicesUsed: ['managed-it', 'cybersecurity', 'compliance', 'cloud', 'bespoke-software'],
    },
  ]
  const accs = await db.insert(schema.accounts).values(accountsSeed).returning()
  const byName = new Map(accs.map((a) => [a.name, a.id]))
  const id = (n: string) => byName.get(n)!

  // ── Contacts ───────────────────────────────────────────────────────────────
  await db.insert(schema.contacts).values([
    { name: 'Dr. Helena Martinez', email: 'hmartinez@lakesidemed.com', title: 'Practice Director', accountId: id('Lakeside Medical Group'), isPrimary: true },
    { name: 'Theodore Hahn', email: 'thahn@riverbendca.com', title: 'COO', accountId: id('Riverbend Capital Advisors'), isPrimary: true },
    { name: 'Margaret Park', email: 'mpark@sterlingpark.com', title: 'Managing Partner', accountId: id('Sterling & Park Attorneys'), isPrimary: true },
    { name: 'Dr. Ramon Velasquez', email: 'rvelasquez@eastfieldbh.com', title: 'Clinical Director', accountId: id('Eastfield Behavioral Health'), isPrimary: true },
    { name: 'Carol Whitten', email: 'cwhitten@harrowgateins.com', title: 'VP Operations', accountId: id('Harrowgate Insurance'), isPrimary: true },
    { name: 'Dr. Mei-Lin Wu', email: 'mlw@verdehealth.org', title: 'CMO', accountId: id('Verde Health Partners'), isPrimary: true },
  ])

  // ── Leads ──────────────────────────────────────────────────────────────────
  await db.insert(schema.leads).values([
    { name: 'Dr. Aisha Patel', email: 'apatel@meadowridgepeds.com', phone: '+1 609 555 0142', company: 'Meadow Ridge Pediatrics', industry: 'healthcare', serviceInterest: 'compliance', source: 'free_it_audit', status: 'qualifying', owner: 'Sohail Akram', score: 86, message: 'Adding a second location in Q3. Need HIPAA-aware infra review.' },
    { name: 'Marcus Chen', email: 'mchen@chenwealth.com', company: 'Chen Wealth Advisors', industry: 'financial-services', serviceInterest: 'cybersecurity', source: 'service_inquiry', status: 'new', score: 78, message: 'NYDFS audit in October. Want a posture review.' },
    { name: 'Diana Forester', email: 'diana@foresterlegal.com', phone: '+1 732 555 0119', company: 'Forester & Hayes LLP', industry: 'professional-services', serviceInterest: 'managed-it', source: 'contact_form', status: 'qualified', owner: 'Sohail Akram', score: 92, message: 'Current MSP is unresponsive. 38 attorneys, two offices.' },
    { name: 'Jonas Berg', email: 'jb@northcoastdermo.com', company: 'North Coast Dermatology', industry: 'healthcare', serviceInterest: 'bespoke-software', source: 'bespoke_scope_request', status: 'new', score: 71 },
    { name: 'Priya Raghavan', email: 'praghavan@bridgecapital.com', company: 'Bridge Capital Partners', industry: 'financial-services', source: 'phone', status: 'qualifying', owner: 'Sohail Akram', score: 81 },
  ])

  // ── Opportunities (+ line items + opening activity) ─────────────────────────
  const oppSeed = [
    { name: 'Meadow Ridge · multi-site HIPAA rollout', prospectName: 'Meadow Ridge Pediatrics', industry: 'healthcare', type: 'new-business' as const, stage: 'new' as const, value: 168000, probability: 20, expectedClose: '2026-08-15', owner: 'Sohail Akram', source: 'free_it_audit', servicesInScope: ['managed-it', 'compliance'], primaryContact: 'Dr. Aisha Patel', primaryEmail: 'apatel@meadowridgepeds.com' },
    { name: 'Forester & Hayes · MSP switch', prospectName: 'Forester & Hayes LLP', industry: 'professional-services', type: 'new-business' as const, stage: 'qualified' as const, value: 92000, probability: 45, expectedClose: '2026-07-20', owner: 'Sohail Akram', source: 'contact_form', servicesInScope: ['managed-it', 'cybersecurity'], primaryContact: 'Diana Forester', primaryEmail: 'diana@foresterlegal.com' },
    { name: 'Bridge Capital · managed cyber retainer', prospectName: 'Bridge Capital Partners', industry: 'financial-services', type: 'new-business' as const, stage: 'proposal' as const, value: 124000, probability: 60, expectedClose: '2026-07-05', owner: 'Sohail Akram', source: 'referral', servicesInScope: ['cybersecurity', 'managed-it'], primaryContact: 'Priya Raghavan', primaryEmail: 'praghavan@bridgecapital.com' },
    { name: 'Sterling & Park · HIPAA rebuild SoW', accountId: id('Sterling & Park Attorneys'), prospectName: 'Sterling & Park Attorneys', industry: 'professional-services', type: 'expansion' as const, stage: 'sow-sent' as const, value: 86000, probability: 75, expectedClose: '2026-06-15', owner: 'Sohail Akram', source: 'service_inquiry', servicesInScope: ['compliance'], primaryContact: 'Margaret Park', primaryEmail: 'mpark@sterlingpark.com' },
    { name: 'Eastfield · managed retainer (won)', accountId: id('Eastfield Behavioral Health'), prospectName: 'Eastfield Behavioral Health', industry: 'healthcare', type: 'new-business' as const, stage: 'closed-won' as const, value: 82800, probability: 100, expectedClose: '2026-04-10', owner: 'Sohail Akram', source: 'free_it_audit', servicesInScope: ['managed-it', 'compliance'], primaryContact: 'Dr. Ramon Velasquez', primaryEmail: 'rvelasquez@eastfieldbh.com' },
  ]
  const opps = await db.insert(schema.opportunities).values(oppSeed).returning()
  for (const o of opps) {
    await db.insert(schema.opportunityLineItems).values([
      { opportunityId: o.id, service: 'managed-it', qty: 40, rate: 120, recurring: true },
    ])
    await db.insert(schema.opportunityActivities).values([
      { opportunityId: o.id, kind: 'stage', actor: 'System', text: 'Opportunity opened.' },
    ])
  }

  // ── Engagements (+ milestones) ──────────────────────────────────────────────
  const engSeed = [
    { name: 'Verde — Managed cyber retainer', accountId: id('Verde Health Partners'), type: 'managed' as const, status: 'active' as const, stage: 'Ongoing operations', health: 'green' as const, startedAt: '2018-01-22', nextMilestone: 'Q2 Quarterly Business Review', nextMilestoneDue: '2026-06-12', mrrOrValue: 18200, serviceSlug: 'cybersecurity' },
    { name: 'Riverbend — SOC 2 readiness', accountId: id('Riverbend Capital Advisors'), type: 'project' as const, status: 'active' as const, stage: 'Execution', health: 'amber' as const, startedAt: '2026-03-04', nextMilestone: 'Evidence collection sign-off', nextMilestoneDue: '2026-06-04', mrrOrValue: 92000, serviceSlug: 'compliance' },
    { name: 'Eastfield — Onboarding sprint', accountId: id('Eastfield Behavioral Health'), type: 'managed' as const, status: 'onboarding' as const, stage: 'Kickoff', health: 'green' as const, startedAt: '2026-04-10', nextMilestone: 'Asset inventory complete', nextMilestoneDue: '2026-06-02', mrrOrValue: 6900, serviceSlug: 'managed-it' },
    { name: 'Lakeside — HIPAA program rebuild', accountId: id('Lakeside Medical Group'), type: 'project' as const, status: 'active' as const, stage: 'Milestone approval', health: 'green' as const, startedAt: '2026-01-08', nextMilestone: 'Policy pack v2 review', nextMilestoneDue: '2026-06-01', mrrOrValue: 44000, serviceSlug: 'compliance' },
    { name: 'Harrowgate — Network rearchitecture', accountId: id('Harrowgate Insurance'), type: 'project' as const, status: 'paused' as const, stage: 'Execution', health: 'red' as const, startedAt: '2026-02-20', nextMilestone: 'Awaiting client sign-off', nextMilestoneDue: '2026-05-21', mrrOrValue: 64000, serviceSlug: 'network' },
  ]
  const engs = await db.insert(schema.engagements).values(engSeed).returning()
  for (const e of engs) {
    await db.insert(schema.milestones).values([
      { engagementId: e.id, title: 'Kickoff & discovery', status: 'approved', order: 1, dueDate: '2026-05-01' },
      { engagementId: e.id, title: 'Execution', status: 'in-progress', order: 2, dueDate: '2026-06-15' },
      { engagementId: e.id, title: 'Review & sign-off', status: 'pending', order: 3, dueDate: '2026-07-01' },
    ])
  }

  // ── Bespoke projects (+ milestones) ─────────────────────────────────────────
  const bpSeed = [
    { name: 'Lakeside Patient Intake Portal', accountId: id('Lakeside Medical Group'), type: 'web-app' as const, stage: 'build' as const, billing: 'fixed' as const, contractValue: 142000, burned: 86000, startedAt: '2026-02-04', targetGoLive: '2026-08-30', health: 'green' as const, lead: 'Sohail Akram', team: 4 },
    { name: 'Verde Field Care Mobile App', accountId: id('Verde Health Partners'), type: 'mobile-app' as const, stage: 'design' as const, billing: 't-and-m' as const, contractValue: 320000, burned: 58000, startedAt: '2026-04-22', targetGoLive: '2027-01-15', health: 'amber' as const, lead: 'Sohail Akram', team: 5 },
    { name: 'Riverbend Compliance Triage AI', accountId: id('Riverbend Capital Advisors'), type: 'ai-tool' as const, stage: 'uat' as const, billing: 'fixed' as const, contractValue: 88000, burned: 82000, startedAt: '2026-01-10', targetGoLive: '2026-06-12', health: 'green' as const, lead: 'Sohail Akram', team: 3 },
    { name: 'Harrowgate Underwriting CRM', accountId: id('Harrowgate Insurance'), type: 'crm' as const, stage: 'hypercare' as const, billing: 'fixed' as const, contractValue: 268000, burned: 262000, startedAt: '2025-09-01', targetGoLive: '2026-05-05', health: 'red' as const, lead: 'Sohail Akram', team: 6 },
  ]
  const bps = await db.insert(schema.bespokeProjects).values(bpSeed).returning()
  for (const p of bps) {
    await db.insert(schema.bespokeMilestones).values([
      { projectId: p.id, title: 'Discovery & architecture', status: 'approved', order: 1 },
      { projectId: p.id, title: 'Core build', status: 'in-progress', order: 2 },
      { projectId: p.id, title: 'UAT & launch', status: 'pending', order: 3 },
    ])
  }

  // ── Tickets (+ a comment each) ──────────────────────────────────────────────
  const tkSeed = [
    { accountId: id('Harrowgate Insurance'), subject: 'VPN tunnel down between HQ and DR site', priority: 'p1' as const, status: 'in-progress' as const, assignee: 'Sohail Akram', category: 'incident' as const },
    { accountId: id('Riverbend Capital Advisors'), subject: 'Conditional access blocking remote auditor', priority: 'p2' as const, status: 'awaiting-client' as const, assignee: 'Sohail Akram', category: 'request' as const },
    { accountId: id('Lakeside Medical Group'), subject: 'New employee onboarding — clinical team', priority: 'p3' as const, status: 'open' as const, category: 'request' as const },
    { accountId: id('Sterling & Park Attorneys'), subject: 'Outlook indexing failing on partner laptops', priority: 'p2' as const, status: 'in-progress' as const, assignee: 'Sohail Akram', category: 'incident' as const },
    { accountId: id('Verde Health Partners'), subject: 'EHR maintenance window approval', priority: 'p3' as const, status: 'awaiting-client' as const, assignee: 'Sohail Akram', category: 'change' as const },
  ]
  const tks = await db.insert(schema.tickets).values(tkSeed).returning()
  await db.insert(schema.ticketComments).values(
    tks.map((t) => ({ ticketId: t.id, author: 'Sohail Akram', body: 'Triaged and assigned. Investigating now.' })),
  )

  // ── Documents ───────────────────────────────────────────────────────────────
  await db.insert(schema.documents).values([
    { name: 'Eastfield · SoW (signed).pdf', kind: 'sow', accountId: id('Eastfield Behavioral Health'), uploadedBy: 'Sohail Akram' },
    { name: 'Sterling · Proposal v3.pdf', kind: 'proposal', accountId: id('Sterling & Park Attorneys'), uploadedBy: 'Sohail Akram' },
    { name: 'Lakeside · HIPAA Risk Assessment.pdf', kind: 'report', accountId: id('Lakeside Medical Group'), uploadedBy: 'Sohail Akram' },
    { name: 'Verde · MSA (signed).pdf', kind: 'msa', accountId: id('Verde Health Partners'), uploadedBy: 'Sohail Akram' },
  ])

  // ── Service catalog (incl. marketing + GHL) ─────────────────────────────────
  await db.insert(schema.servicesCatalog).values([
    { slug: 'managed-it', name: 'Managed IT', category: 'managed', defaultRate: 120, billingUnit: 'per-seat-month', summary: 'Day-to-day IT operations, monitoring, helpdesk.' },
    { slug: 'cybersecurity', name: 'Managed Cybersecurity', category: 'security', defaultRate: 45, billingUnit: 'per-seat-month', summary: 'EDR, email, identity, network, backup.' },
    { slug: 'compliance', name: 'IT Compliance', category: 'security', defaultRate: 24000, billingUnit: 'fixed', summary: 'HIPAA, SOC 2, NIST, NYDFS programs.' },
    { slug: 'cloud', name: 'Cloud & Infrastructure', category: 'cloud', defaultRate: 3500, billingUnit: 'per-month', summary: 'Cloud migration and managed infrastructure.' },
    { slug: 'business-phone', name: 'Business Phone (VoIP)', category: 'communications', defaultRate: 28, billingUnit: 'per-seat-month', summary: 'Cloud phone systems and contact center.' },
    { slug: 'bespoke-software', name: 'Bespoke Software', category: 'build', defaultRate: 185, billingUnit: 'hourly', summary: 'Custom web, mobile, and AI development.' },
    { slug: 'digital-marketing', name: 'Digital Marketing', category: 'marketing', defaultRate: 2500, billingUnit: 'retainer', summary: 'SEO, paid ads, social, and content marketing.' },
    { slug: 'ghl-implementation', name: 'GoHighLevel Implementation', category: 'marketing', defaultRate: 4500, billingUnit: 'fixed', summary: 'Full GHL sub-account build: funnels, pipelines, automations.' },
    { slug: 'ghl-management', name: 'GoHighLevel Management', category: 'marketing', defaultRate: 1500, billingUnit: 'retainer', summary: 'Ongoing GHL management, optimization, and support.' },
  ])

  // ── Marketing / GHL engagements (+ deliverables) ────────────────────────────
  const mkSeed = [
    { name: 'Lakeside — GHL patient reactivation', accountId: id('Lakeside Medical Group'), kind: 'ghl-implementation' as const, status: 'building' as const, health: 'green' as const, monthlyRetainer: 1500, setupFee: 4500, owner: 'Sales Lead', ghlLocationId: 'loc_lakeside_001', startedAt: '2026-05-01', goLiveTarget: '2026-06-20', notes: 'Reactivation campaign + missed-call text-back + review funnel.' },
    { name: 'Eastfield — Local SEO + Google Ads', accountId: id('Eastfield Behavioral Health'), kind: 'full-funnel' as const, status: 'optimizing' as const, health: 'green' as const, monthlyRetainer: 3200, setupFee: 2000, owner: 'Sales Lead', startedAt: '2026-03-15', goLiveTarget: '2026-04-15', notes: 'GHL pipeline + paid search + GBP optimization.' },
    { name: 'Sterling & Park — Reputation & intake', accountId: id('Sterling & Park Attorneys'), kind: 'ghl-implementation' as const, status: 'scoping' as const, health: 'amber' as const, monthlyRetainer: 1500, setupFee: 3500, owner: 'Sales Lead', ghlLocationId: 'loc_sterling_002', notes: 'Intake forms, review automation, client nurture sequences.' },
  ]
  const mks = await db.insert(schema.marketingEngagements).values(mkSeed).returning()
  for (const m of mks) {
    await db.insert(schema.marketingDeliverables).values([
      { engagementId: m.id, title: 'Sub-account + pipeline setup', status: 'done', order: 1 },
      { engagementId: m.id, title: 'Funnels & landing pages', status: 'in-progress', order: 2 },
      { engagementId: m.id, title: 'Automations & workflows', status: 'todo', order: 3 },
      { engagementId: m.id, title: 'Reporting dashboard', status: 'todo', order: 4 },
    ])
  }

  console.log(
    `✓ Seed complete: ${accs.length} accounts, ${opps.length} opportunities, ${engs.length} engagements, ${bps.length} projects, ${tks.length} tickets, ${mks.length} marketing engagements.`,
  )
  await client.end()
}

main().catch(async (err) => {
  console.error('Seed failed:', err)
  await client.end()
  process.exit(1)
})
