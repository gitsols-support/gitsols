// Service desk tickets with a comment thread.

import { pgTable, uuid, text, timestamp, index, pgEnum } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'

export const ticketPriorityEnum = pgEnum('ticket_priority', ['p1', 'p2', 'p3', 'p4'])
export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in-progress',
  'awaiting-client',
  'resolved',
])
export const ticketCategoryEnum = pgEnum('ticket_category', [
  'incident',
  'request',
  'change',
  'project',
])

export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    subject: text('subject').notNull(),
    description: text('description'),
    priority: ticketPriorityEnum('priority').notNull().default('p3'),
    status: ticketStatusEnum('status').notNull().default('open'),
    assignee: text('assignee'),
    category: ticketCategoryEnum('category').notNull().default('request'),
    openedAt: timestamp('opened_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    slaTarget: timestamp('sla_target', { withTimezone: true, mode: 'string' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('tickets_account_id_idx').on(table.accountId),
    index('tickets_status_idx').on(table.status),
    index('tickets_priority_idx').on(table.priority),
  ],
)

export const ticketComments = pgTable(
  'ticket_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    author: text('author').notNull().default('System'),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [index('ticket_comments_ticket_id_idx').on(table.ticketId)],
)

export type DbTicket = typeof tickets.$inferSelect
export type NewDbTicket = typeof tickets.$inferInsert
export type DbTicketComment = typeof ticketComments.$inferSelect
export type NewDbTicketComment = typeof ticketComments.$inferInsert
