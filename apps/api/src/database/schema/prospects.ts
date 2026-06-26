// Prospects — the next state after `leads`.
//
// A lead is a generic form submission (name / email / message). A prospect
// is the structured object created when someone completes the multistep
// audit intake (or the bespoke scope flow). The intake payload is captured
// as JSONB so the form schema can evolve over time; key fields are also
// denormalized as columns for indexing and admin filtering.
//
// Phase 2 converts a prospect into an Account + Opportunity on SoW signature.

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core'

export const prospectStatusEnum = pgEnum('prospect_status', [
  'new',           // just completed intake
  'audit_scheduled',
  'audit_done',
  'sow_sent',
  'won',           // converted to account
  'lost',
  'junk',
])

export const prospectIntakeFlowEnum = pgEnum('prospect_intake_flow', [
  'free_audit',
  'bespoke_scope',
  'marketing_scope',
  'service_inquiry',
])

export const prospects = pgTable(
  'prospects',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // ── Person ──────────────────────────────────────────────────────
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    role: text('role'),

    // ── Company ─────────────────────────────────────────────────────
    companyName: text('company_name').notNull(),
    industry: text('industry'), // slug from INDUSTRIES
    employeeCount: integer('employee_count'),
    officeCount: integer('office_count'),

    // ── Intake flow + payload ──────────────────────────────────────
    intakeFlow: prospectIntakeFlowEnum('intake_flow').notNull().default('free_audit'),
    intakeVersion: text('intake_version').notNull().default('1'),

    /**
     * Full structured payload from the multistep form. The shape matches
     * `IntakeAnswers` in @gitsols/types but is stored opaquely so the form
     * can evolve without a migration on every change.
     */
    intakePayload: jsonb('intake_payload').$type<Record<string, unknown>>().notNull(),

    /**
     * Denormalized "top concern" — the first selected priority. Cheap to
     * filter and to drive the preview portal copy.
     */
    topPriority: text('top_priority'),

    // ── CRM state ──────────────────────────────────────────────────
    status: prospectStatusEnum('status').notNull().default('new'),
    /** Set once converted to an Account. */
    convertedAccountId: uuid('converted_account_id'),

    // ── Attribution + spam triage ──────────────────────────────────
    sourceUrl: text('source_url'),
    attribution: jsonb('attribution').$type<Record<string, string>>(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('prospects_status_idx').on(table.status),
    index('prospects_intake_flow_idx').on(table.intakeFlow),
    index('prospects_industry_idx').on(table.industry),
    index('prospects_email_idx').on(table.email),
    index('prospects_created_at_idx').on(table.createdAt),
  ],
)

export type DbProspect = typeof prospects.$inferSelect
export type NewDbProspect = typeof prospects.$inferInsert
