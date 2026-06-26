// Contacts — people associated with an Account (or unattached prospects).

import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'

export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    title: text('title'),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('contacts_account_id_idx').on(table.accountId),
    index('contacts_email_idx').on(table.email),
  ],
)

export type DbContact = typeof contacts.$inferSelect
export type NewDbContact = typeof contacts.$inferInsert
