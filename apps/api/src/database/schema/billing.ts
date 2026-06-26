// Billing — proposals (quotes) and invoices. Both link optionally to an
// account (client) and an engagement (project), carry line items, and are
// rendered to PDF. Invoices may be created standalone or converted from an
// accepted proposal (invoices.proposalId).
//
// Monetary amounts are whole US dollars (integer), matching the rest of the
// platform (services_catalog.defaultRate, opportunity line rates, accounts.mrr).
// taxRate is an integer percentage (e.g. 7 = 7%); taxAmount/subtotal/total are
// persisted so a historical document never shifts if catalog prices change.

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { accounts } from './accounts'
import { engagements } from './engagements'

// ── Enums ────────────────────────────────────────────────────────────────────
export const proposalStatusEnum = pgEnum('proposal_status', [
  'draft',
  'sent',
  'accepted',
  'declined',
  'expired',
  'converted',
])

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'partial',
  'paid',
  'overdue',
  'void',
])

// ── Proposals ────────────────────────────────────────────────────────────────
export const proposals = pgTable(
  'proposals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    number: text('number').notNull().unique(),
    title: text('title').notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    engagementId: uuid('engagement_id').references(() => engagements.id, { onDelete: 'set null' }),
    // Denormalized client label so a proposal reads correctly even before an
    // account record exists (early-stage prospect).
    clientName: text('client_name').notNull().default(''),
    clientEmail: text('client_email'),
    status: proposalStatusEnum('status').notNull().default('draft'),
    issueDate: date('issue_date', { mode: 'string' }),
    validUntil: date('valid_until', { mode: 'string' }),
    currency: text('currency').notNull().default('USD'),
    notes: text('notes'),
    terms: text('terms'),
    taxRate: integer('tax_rate').notNull().default(0),
    discount: integer('discount').notNull().default(0),
    // Persisted money snapshot (whole dollars).
    subtotal: integer('subtotal').notNull().default(0),
    taxAmount: integer('tax_amount').notNull().default(0),
    total: integer('total').notNull().default(0),
    owner: text('owner').notNull().default('Unassigned'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('proposals_status_idx').on(table.status),
    index('proposals_account_id_idx').on(table.accountId),
  ],
)

export const proposalLineItems = pgTable(
  'proposal_line_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    proposalId: uuid('proposal_id')
      .notNull()
      .references(() => proposals.id, { onDelete: 'cascade' }),
    serviceSlug: text('service_slug'),
    description: text('description').notNull(),
    qty: integer('qty').notNull().default(1),
    unitPrice: integer('unit_price').notNull().default(0),
    unit: text('unit').notNull().default('fixed'),
    recurring: boolean('recurring').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('proposal_line_items_proposal_id_idx').on(table.proposalId)],
)

// ── Invoices ─────────────────────────────────────────────────────────────────
export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    number: text('number').notNull().unique(),
    title: text('title').notNull().default(''),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    engagementId: uuid('engagement_id').references(() => engagements.id, { onDelete: 'set null' }),
    // Optional provenance — set when an invoice is converted from a proposal.
    proposalId: uuid('proposal_id').references(() => proposals.id, { onDelete: 'set null' }),
    clientName: text('client_name').notNull().default(''),
    clientEmail: text('client_email'),
    status: invoiceStatusEnum('status').notNull().default('draft'),
    issueDate: date('issue_date', { mode: 'string' }),
    dueDate: date('due_date', { mode: 'string' }),
    currency: text('currency').notNull().default('USD'),
    notes: text('notes'),
    terms: text('terms'),
    taxRate: integer('tax_rate').notNull().default(0),
    discount: integer('discount').notNull().default(0),
    subtotal: integer('subtotal').notNull().default(0),
    taxAmount: integer('tax_amount').notNull().default(0),
    total: integer('total').notNull().default(0),
    amountPaid: integer('amount_paid').notNull().default(0),
    owner: text('owner').notNull().default('Unassigned'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('invoices_status_idx').on(table.status),
    index('invoices_account_id_idx').on(table.accountId),
    index('invoices_proposal_id_idx').on(table.proposalId),
  ],
)

export const invoiceLineItems = pgTable(
  'invoice_line_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    serviceSlug: text('service_slug'),
    description: text('description').notNull(),
    qty: integer('qty').notNull().default(1),
    unitPrice: integer('unit_price').notNull().default(0),
    unit: text('unit').notNull().default('fixed'),
    recurring: boolean('recurring').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('invoice_line_items_invoice_id_idx').on(table.invoiceId)],
)

export type DbProposal = typeof proposals.$inferSelect
export type NewDbProposal = typeof proposals.$inferInsert
export type DbProposalLineItem = typeof proposalLineItems.$inferSelect
export type DbInvoice = typeof invoices.$inferSelect
export type NewDbInvoice = typeof invoices.$inferInsert
export type DbInvoiceLineItem = typeof invoiceLineItems.$inferSelect
