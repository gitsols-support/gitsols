// Bespoke software projects — custom build delivery with milestone tracking.

import { pgTable, uuid, text, integer, timestamp, date, index, pgEnum } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'
import { healthEnum, milestoneStatusEnum } from './engagements'

export const projectStageEnum = pgEnum('project_stage', [
  'discovery',
  'design',
  'build',
  'uat',
  'launch',
  'hypercare',
  'closed',
])

export const projectBillingEnum = pgEnum('project_billing', ['fixed', 't-and-m', 'hybrid'])

export const projectKindEnum = pgEnum('project_kind', [
  'web-app',
  'mobile-app',
  'crm',
  'ai-tool',
  'integration',
])

export const bespokeProjects = pgTable(
  'bespoke_projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    type: projectKindEnum('type').notNull().default('web-app'),
    stage: projectStageEnum('stage').notNull().default('discovery'),
    billing: projectBillingEnum('billing').notNull().default('fixed'),
    contractValue: integer('contract_value').notNull().default(0),
    burned: integer('burned').notNull().default(0),
    startedAt: date('started_at', { mode: 'string' }),
    targetGoLive: date('target_go_live', { mode: 'string' }),
    health: healthEnum('health').notNull().default('green'),
    lead: text('lead'),
    team: integer('team').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('bespoke_projects_account_id_idx').on(table.accountId),
    index('bespoke_projects_stage_idx').on(table.stage),
  ],
)

export const bespokeMilestones = pgTable(
  'bespoke_milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => bespokeProjects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: milestoneStatusEnum('status').notNull().default('pending'),
    dueDate: date('due_date', { mode: 'string' }),
    order: integer('order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [index('bespoke_milestones_project_id_idx').on(table.projectId)],
)

export type DbBespokeProject = typeof bespokeProjects.$inferSelect
export type NewDbBespokeProject = typeof bespokeProjects.$inferInsert
export type DbBespokeMilestone = typeof bespokeMilestones.$inferSelect
export type NewDbBespokeMilestone = typeof bespokeMilestones.$inferInsert
