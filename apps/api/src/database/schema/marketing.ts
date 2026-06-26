// Marketing / GoHighLevel (GHL) implementation engagements — the agency-side
// delivery surface (paid ads, SEO, social, web, email automation, and full
// GHL sub-account build-outs) with a deliverable checklist per engagement.

import { pgTable, uuid, text, integer, timestamp, date, index, pgEnum } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'
import { healthEnum } from './engagements'

export const marketingKindEnum = pgEnum('marketing_kind', [
  'ghl-implementation',
  'seo',
  'paid-ads',
  'social',
  'web-design',
  'email-automation',
  'reputation',
  'full-funnel',
])

export const marketingStatusEnum = pgEnum('marketing_status', [
  'scoping',
  'onboarding',
  'building',
  'live',
  'optimizing',
  'paused',
  'closed',
])

export const marketingDeliverableStatusEnum = pgEnum('marketing_deliverable_status', [
  'todo',
  'in-progress',
  'done',
])

export const marketingEngagements = pgTable(
  'marketing_engagements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    kind: marketingKindEnum('kind').notNull().default('ghl-implementation'),
    status: marketingStatusEnum('status').notNull().default('scoping'),
    health: healthEnum('health').notNull().default('green'),
    monthlyRetainer: integer('monthly_retainer').notNull().default(0),
    setupFee: integer('setup_fee').notNull().default(0),
    owner: text('owner'),
    ghlLocationId: text('ghl_location_id'),
    startedAt: date('started_at', { mode: 'string' }),
    goLiveTarget: date('go_live_target', { mode: 'string' }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('marketing_engagements_account_id_idx').on(table.accountId),
    index('marketing_engagements_status_idx').on(table.status),
    index('marketing_engagements_kind_idx').on(table.kind),
  ],
)

export const marketingDeliverables = pgTable(
  'marketing_deliverables',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    engagementId: uuid('engagement_id')
      .notNull()
      .references(() => marketingEngagements.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: marketingDeliverableStatusEnum('status').notNull().default('todo'),
    dueDate: date('due_date', { mode: 'string' }),
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [index('marketing_deliverables_engagement_id_idx').on(table.engagementId)],
)

export type DbMarketingEngagement = typeof marketingEngagements.$inferSelect
export type NewDbMarketingEngagement = typeof marketingEngagements.$inferInsert
export type DbMarketingDeliverable = typeof marketingDeliverables.$inferSelect
export type NewDbMarketingDeliverable = typeof marketingDeliverables.$inferInsert
