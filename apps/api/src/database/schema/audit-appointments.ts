// Scheduled (or pending) free IT audits.
//
// A prospect optionally picks 1-3 preferred windows in intake. The admin
// confirms one, which sets `scheduledFor`. Until confirmed the row sits in
// status='requested' with the requested windows in `requestedWindows`.

import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { prospects } from './prospects'

export const auditAppointmentStatusEnum = pgEnum('audit_appointment_status', [
  'requested',     // prospect submitted preferred windows; not yet booked
  'scheduled',     // confirmed time on the calendar
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
])

export const auditAppointments = pgTable(
  'audit_appointments',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    prospectId: uuid('prospect_id')
      .notNull()
      .references(() => prospects.id, { onDelete: 'cascade' }),

    status: auditAppointmentStatusEnum('status').notNull().default('requested'),

    /**
     * Up to 3 ISO datetimes the prospect offered as preferred windows.
     * Stored as JSONB to keep the column simple.
     */
    requestedWindows: jsonb('requested_windows').$type<string[]>(),

    scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
    durationMinutes: integer('duration_minutes').notNull().default(60),

    /** Conference link (Teams / Meet / Zoom). Populated when confirmed. */
    joinUrl: text('join_url'),

    /** Internal-only notes — visible to admin, never the prospect. */
    internalNotes: text('internal_notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_appointments_prospect_id_idx').on(table.prospectId),
    index('audit_appointments_status_idx').on(table.status),
    index('audit_appointments_scheduled_for_idx').on(table.scheduledFor),
  ],
)

export type DbAuditAppointment = typeof auditAppointments.$inferSelect
export type NewDbAuditAppointment = typeof auditAppointments.$inferInsert
