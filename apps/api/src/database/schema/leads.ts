// Inbound leads — form submissions from the marketing site (contact page,
// free IT audit landing, and the per-service "scope a project" forms).
//
// Phase 1 captures the raw submission. Phase 2 introduces an `opportunities`
// table and a CRM pipeline; leads are then either converted (link via
// `convertedToOpportunityId`) or marked junk/spam.

import { pgTable, uuid, text, integer, timestamp, jsonb, index, pgEnum } from 'drizzle-orm/pg-core'

export const leadSourceEnum = pgEnum('lead_source', [
  'contact_form',
  'free_it_audit',
  'service_inquiry',
  'bespoke_scope_request',
  'phone',
  'referral',
  'other',
])

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'qualifying',
  'qualified',
  'contacted',
  'disqualified',
  'converted',
  'junk',
])

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Captured fields
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    company: text('company'),
    /** Free-text message from the form. */
    message: text('message'),
    /** Which service the lead expressed interest in (slug from SERVICES). */
    serviceInterest: text('service_interest'),
    /** Which industry vertical, if surfaced by the form. */
    industry: text('industry'),

    source: leadSourceEnum('source').notNull().default('contact_form'),
    status: leadStatusEnum('status').notNull().default('new'),

    /** Admin triage fields (Phase 2). */
    score: integer('score').notNull().default(0),
    owner: text('owner'),

    /**
     * Page the form lived on (`/contact`, `/free-it-audit`, `/services/bespoke-software`).
     * Useful for attribution and for tuning page copy later.
     */
    sourceUrl: text('source_url'),

    /**
     * Marketing attribution — UTM params, referrer, GA client ID, etc.
     * Stored opaquely so the schema doesn't need to know every channel.
     */
    attribution: jsonb('attribution').$type<Record<string, string>>(),

    /** Set by the controller from the request. Useful for spam triage. */
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('leads_status_idx').on(table.status),
    index('leads_source_idx').on(table.source),
    index('leads_created_at_idx').on(table.createdAt),
    index('leads_email_idx').on(table.email),
  ],
)

export type DbLead = typeof leads.$inferSelect
export type NewDbLead = typeof leads.$inferInsert
