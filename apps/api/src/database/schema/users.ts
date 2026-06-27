// Internal GITSOLS staff and client portal users.
//
// Two role hierarchies live in this same table — distinguished by `role` and
// (for client roles) `accountId`. The convention is intentional: it keeps
// the auth path uniform and lets Postgres RLS policies key off `accountId`
// without joining a second table.
//
// Phase 2 will add: passwordHash, lastLoginAt, mfaSecret, etc. The Phase 0
// shape here is the minimum the JWT guard needs.

import { pgTable, uuid, text, timestamp, boolean, index, pgEnum } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'

export const roleEnum = pgEnum('role', [
  // internal
  'owner',
  'admin',
  'sales',
  'pm',
  'tech',
  'readonly',
  // client
  'client_primary',
  'client_user',
])

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    role: roleEnum('role').notNull(),

    /** scrypt password hash (scrypt$N$salt$hash). NULL until a password is set. */
    passwordHash: text('password_hash'),
    /** When true, the user must set a new password before using the app. */
    mustResetPassword: boolean('must_reset_password').notNull().default(false),

    /**
     * Required for client_primary / client_user. NULL for internal staff.
     * RLS policies on per-tenant tables use this to scope reads.
     */
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('users_account_id_idx').on(table.accountId),
    index('users_email_idx').on(table.email),
  ],
)

export type DbUser = typeof users.$inferSelect
export type NewDbUser = typeof users.$inferInsert
