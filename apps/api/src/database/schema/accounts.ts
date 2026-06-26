// Client organizations — the unit of tenancy.
//
// Every per-tenant table (engagements, milestones, tickets, documents, etc.)
// keys on `accountId` and Postgres RLS policies filter by the JWT's account_id
// for client roles. Internal staff bypass RLS via a database role flag set
// in `DatabaseService.withSessionContext()`.

import { pgTable, uuid, text, integer, timestamp, date, jsonb, index, pgEnum } from 'drizzle-orm/pg-core'

export const accountTierEnum = pgEnum('account_tier', ['enterprise', 'mid-market', 'smb'])
export const accountStatusEnum = pgEnum('account_status', [
  'active',
  'at-risk',
  'onboarding',
  'churned',
])
export const accountHealthEnum = pgEnum('account_health', [
  'excellent',
  'good',
  'watch',
  'critical',
])

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    /**
     * Optional industry vertical — useful for reporting and for surfacing
     * the right document templates (medical vs financial).
     */
    industry: text('industry'),

    // ── CRM fields (Phase 2) ──────────────────────────────────────────────
    tier: accountTierEnum('tier').notNull().default('smb'),
    status: accountStatusEnum('status').notNull().default('onboarding'),
    health: accountHealthEnum('health').notNull().default('good'),
    primaryContact: text('primary_contact'),
    primaryEmail: text('primary_email'),
    /** Monthly recurring revenue, whole dollars. */
    mrr: integer('mrr').notNull().default(0),
    seats: integer('seats').notNull().default(0),
    since: date('since', { mode: 'string' }),
    nextRenewal: date('next_renewal', { mode: 'string' }),
    /** Service slugs in use by this account. */
    servicesUsed: jsonb('services_used').$type<string[]>().notNull().default([]),

    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('accounts_slug_idx').on(table.slug),
    index('accounts_status_idx').on(table.status),
  ],
)

export type DbAccount = typeof accounts.$inferSelect
export type NewDbAccount = typeof accounts.$inferInsert
