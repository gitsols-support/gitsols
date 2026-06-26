// Admin-managed service catalog — the priced offerings used on opportunities
// and engagements. Distinct from the marketing-site SERVICES copy.

import { pgTable, uuid, text, integer, boolean, timestamp, index, pgEnum } from 'drizzle-orm/pg-core'

export const serviceCategoryEnum = pgEnum('service_category', [
  'managed',
  'security',
  'cloud',
  'communications',
  'build',
  'marketing',
])

export const billingUnitEnum = pgEnum('billing_unit', [
  'per-seat-month',
  'per-month',
  'fixed',
  'hourly',
  'retainer',
])

export const servicesCatalog = pgTable(
  'services_catalog',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    category: serviceCategoryEnum('category').notNull().default('managed'),
    summary: text('summary'),
    defaultRate: integer('default_rate').notNull().default(0),
    billingUnit: billingUnitEnum('billing_unit').notNull().default('per-month'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [index('services_catalog_category_idx').on(table.category)],
)

export type DbServiceCatalogItem = typeof servicesCatalog.$inferSelect
export type NewDbServiceCatalogItem = typeof servicesCatalog.$inferInsert
