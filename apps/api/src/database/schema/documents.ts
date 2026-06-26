// Documents — SoWs, MSAs, proposals, reports, policies, invoices. The blob
// itself lives in object storage (R2); this row holds metadata + storage key.

import { pgTable, uuid, text, integer, timestamp, index, pgEnum } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'

export const documentKindEnum = pgEnum('document_kind', [
  'sow',
  'msa',
  'proposal',
  'report',
  'policy',
  'invoice',
  'other',
])

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    kind: documentKindEnum('kind').notNull().default('other'),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    storageKey: text('storage_key'),
    url: text('url'),
    sizeBytes: integer('size_bytes'),
    mimeType: text('mime_type'),
    uploadedBy: text('uploaded_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('documents_account_id_idx').on(table.accountId),
    index('documents_kind_idx').on(table.kind),
  ],
)

export type DbDocument = typeof documents.$inferSelect
export type NewDbDocument = typeof documents.$inferInsert
