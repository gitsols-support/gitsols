// Engagements — ongoing managed retainers and delivery projects, each with
// a milestone timeline.

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  date,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { accounts } from './accounts'

export const engagementTypeEnum = pgEnum('engagement_type', ['managed', 'project', 'discovery'])
export const engagementStatusEnum = pgEnum('engagement_status', [
  'active',
  'onboarding',
  'paused',
  'renewing',
  'closed',
])
export const healthEnum = pgEnum('health', ['green', 'amber', 'red'])
export const milestoneStatusEnum = pgEnum('milestone_status', [
  'pending',
  'in-progress',
  'awaiting-approval',
  'approved',
  'blocked',
])

export const engagements = pgTable(
  'engagements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    type: engagementTypeEnum('type').notNull().default('managed'),
    status: engagementStatusEnum('status').notNull().default('active'),
    stage: text('stage').notNull().default('Kickoff'),
    health: healthEnum('health').notNull().default('green'),
    startedAt: date('started_at', { mode: 'string' }),
    nextMilestone: text('next_milestone'),
    nextMilestoneDue: date('next_milestone_due', { mode: 'string' }),
    mrrOrValue: integer('mrr_or_value').notNull().default(0),
    serviceSlug: text('service_slug'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('engagements_account_id_idx').on(table.accountId),
    index('engagements_status_idx').on(table.status),
  ],
)

export const milestones = pgTable(
  'milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    engagementId: uuid('engagement_id')
      .notNull()
      .references(() => engagements.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: milestoneStatusEnum('status').notNull().default('pending'),
    dueDate: date('due_date', { mode: 'string' }),
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [index('milestones_engagement_id_idx').on(table.engagementId)],
)

export type DbEngagement = typeof engagements.$inferSelect
export type NewDbEngagement = typeof engagements.$inferInsert
export type DbMilestone = typeof milestones.$inferSelect
export type NewDbMilestone = typeof milestones.$inferInsert
