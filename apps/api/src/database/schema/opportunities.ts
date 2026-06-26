// Sales pipeline — opportunities with line items, attachments, and an
// activity timeline.

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { accounts } from './accounts'

export const opportunityStageEnum = pgEnum('opportunity_stage', [
  'new',
  'qualified',
  'proposal',
  'sow-sent',
  'closed-won',
  'closed-lost',
])

export const opportunityTypeEnum = pgEnum('opportunity_type', [
  'new-business',
  'expansion',
  'renewal',
])

export const opportunities = pgTable(
  'opportunities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    prospectName: text('prospect_name').notNull(),
    industry: text('industry'),
    type: opportunityTypeEnum('type').notNull().default('new-business'),
    stage: opportunityStageEnum('stage').notNull().default('new'),
    value: integer('value').notNull().default(0),
    probability: integer('probability').notNull().default(0),
    expectedClose: date('expected_close', { mode: 'string' }),
    owner: text('owner').notNull().default('Unassigned'),
    source: text('source').notNull().default('contact_form'),
    servicesInScope: jsonb('services_in_scope').$type<string[]>().notNull().default([]),
    primaryContact: text('primary_contact'),
    primaryEmail: text('primary_email'),
    lostReason: text('lost_reason'),
    lostNote: text('lost_note'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('opportunities_stage_idx').on(table.stage),
    index('opportunities_account_id_idx').on(table.accountId),
    index('opportunities_owner_idx').on(table.owner),
  ],
)

export const opportunityLineItems = pgTable(
  'opportunity_line_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => opportunities.id, { onDelete: 'cascade' }),
    service: text('service').notNull(),
    qty: integer('qty').notNull().default(1),
    rate: integer('rate').notNull().default(0),
    recurring: boolean('recurring').notNull().default(false),
  },
  (table) => [index('opp_line_items_opp_id_idx').on(table.opportunityId)],
)

export const opportunityAttachments = pgTable(
  'opportunity_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => opportunities.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull().default('other'),
    name: text('name').notNull(),
    url: text('url'),
    addedBy: text('added_by').notNull().default('System'),
    addedAt: timestamp('added_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [index('opp_attachments_opp_id_idx').on(table.opportunityId)],
)

export const opportunityActivities = pgTable(
  'opportunity_activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => opportunities.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull().default('note'),
    actor: text('actor').notNull().default('System'),
    text: text('text').notNull(),
    ts: timestamp('ts', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [index('opp_activities_opp_id_idx').on(table.opportunityId)],
)

export type DbOpportunity = typeof opportunities.$inferSelect
export type NewDbOpportunity = typeof opportunities.$inferInsert
export type DbOpportunityLineItem = typeof opportunityLineItems.$inferSelect
export type DbOpportunityAttachment = typeof opportunityAttachments.$inferSelect
export type DbOpportunityActivity = typeof opportunityActivities.$inferSelect
