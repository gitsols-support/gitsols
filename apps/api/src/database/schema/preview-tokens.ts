// Unauthenticated, tokenized access to a prospect's "preview portal".
//
// The token is a URL-safe random string generated server-side. It carries
// no auth (no JWT, no session). Access is rate-limited at the HTTP layer
// and gated by the row's `expiresAt`. View count + fingerprint hash give us
// abuse signal without storing PII.
//
// No PHI ever lives behind a preview token — these pages are personalized
// brochure-ware seeded from intake answers, nothing more.

import { pgTable, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { prospects } from './prospects'

export const previewTokens = pgTable(
  'preview_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** URL-safe random token (32 chars base64url). Indexed and unique. */
    token: text('token').notNull().unique(),

    prospectId: uuid('prospect_id')
      .notNull()
      .references(() => prospects.id, { onDelete: 'cascade' }),

    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    viewCount: integer('view_count').notNull().default(0),
    lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),

    /**
     * SHA-256 of (IP + user-agent) on first view. Compared on subsequent
     * views — divergence is a signal the link was shared, not a hard block.
     */
    fingerprintHash: text('fingerprint_hash'),

    /** When the link was created (≠ first view). */
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    index('preview_tokens_prospect_id_idx').on(table.prospectId),
    index('preview_tokens_expires_at_idx').on(table.expiresAt),
  ],
)

export type DbPreviewToken = typeof previewTokens.$inferSelect
export type NewDbPreviewToken = typeof previewTokens.$inferInsert
