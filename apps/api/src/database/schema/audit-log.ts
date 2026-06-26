// Append-only audit log.
//
// Every meaningful read/write on Account, Engagement, Document, Ticket,
// and Invoice rows writes one entry here. The table is never updated or
// deleted — Phase 5 will add Postgres `pg_partition` or move cold partitions
// to object storage if volume warrants it.
//
// HIPAA-aware shape:
//   - `actorId` is the JWT subject (internal staff OR client portal user)
//   - `accountId` is the tenant whose data was touched (for client-scoped queries)
//   - `payload` is a structured JSONB diff or query summary — NOT the raw PHI

import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core'
import { users } from './users'
import { accounts } from './accounts'

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorEmail: text('actor_email').notNull(),
    actorRole: text('actor_role').notNull(),

    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),

    /** "read" | "create" | "update" | "delete" | "export" | "login" | "approval" | ... */
    action: text('action').notNull(),
    /** "engagement" | "milestone" | "document" | "ticket" | "invoice" | ... */
    entity: text('entity').notNull(),
    /** UUID of the affected row, or NULL for collection-scope actions like "list". */
    entityId: uuid('entity_id'),

    /**
     * Optional structured payload. Diff for updates, query string for lists,
     * etc. MUST NOT contain raw PHI — store a redacted summary.
     */
    payload: jsonb('payload').$type<Record<string, unknown>>(),

    /** Useful for incident response: IP and user-agent at time of action. */
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_log_account_id_idx').on(table.accountId),
    index('audit_log_actor_id_idx').on(table.actorId),
    index('audit_log_entity_idx').on(table.entity, table.entityId),
    index('audit_log_occurred_at_idx').on(table.occurredAt),
  ],
)

export type DbAuditEntry = typeof auditLog.$inferSelect
export type NewDbAuditEntry = typeof auditLog.$inferInsert
