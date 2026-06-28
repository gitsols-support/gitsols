// Idempotent admin seed. Exposed as seedAdmin() for in-process use at boot
// (see main.ts) and runnable standalone via `node dist/database/seed-admin.js`.
//
// Ensures support@gitsols.com exists as owner with an initial password and a
// forced first-login reset. ADMIN_FORCE_PASSWORD=true re-sets the password
// even if one already exists (lockout recovery).

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import { users } from './schema/users'
import { loadEnv } from '../config/env.schema'
import { hashPassword } from '../auth/password.util'

export async function seedAdmin(databaseUrl: string): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? 'support@gitsols.com').toLowerCase()
  const name = process.env.ADMIN_NAME ?? 'GITSOLS Support'
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD ?? 'Admin@123456'
  const force = process.env.ADMIN_FORCE_PASSWORD === 'true'

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client)
  try {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!existing) {
      await db.insert(users).values({
        email,
        name,
        role: 'owner',
        passwordHash: hashPassword(initialPassword),
        mustResetPassword: true,
      })
      // eslint-disable-next-line no-console
      console.log(`[seed-admin] created owner ${email} (initial password, reset required)`)
    } else if (!existing.passwordHash || force) {
      await db
        .update(users)
        .set({ passwordHash: hashPassword(initialPassword), mustResetPassword: true, role: 'owner' })
        .where(eq(users.id, existing.id))
      // eslint-disable-next-line no-console
      console.log(`[seed-admin] ${force ? 'force-reset' : 'set initial'} password for ${email} (reset required)`)
    } else {
      // eslint-disable-next-line no-console
      console.log(`[seed-admin] ${email} already has a password — leaving untouched`)
    }
  } finally {
    await client.end({ timeout: 5 })
  }
}

// CLI entrypoint
if (require.main === module) {
  seedAdmin(loadEnv().DATABASE_URL)
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[seed-admin] failed', err)
      process.exit(1)
    })
}
