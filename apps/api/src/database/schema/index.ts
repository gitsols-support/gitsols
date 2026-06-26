// Barrel — drizzle-kit reads every table from `schema/*.ts` (per drizzle.config.ts),
// but the runtime db client wants a single `schema` object. Re-export everything here.

export * from './accounts'
export * from './users'
export * from './audit-log'
export * from './leads'
export * from './prospects'
export * from './preview-tokens'
export * from './audit-appointments'
export * from './noc'

// ─── CRM / Admin domains (Phase 2) ─────────────────────────────────────────
export * from './contacts'
export * from './opportunities'
export * from './engagements'
export * from './bespoke'
export * from './tickets'
export * from './documents'
export * from './services-catalog'
export * from './marketing'
export * from './billing'
