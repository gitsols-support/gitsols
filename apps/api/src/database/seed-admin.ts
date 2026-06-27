// Idempotent admin seed — ensures the internal owner account exists with an
// initial password and a forced first-login reset. Runs on every deploy (see
// railway.json startCommand); safe to run repeatedly.
//
// - If the user doesn't exist: create as owner with the initial password and
//   mustResetPassword = true.
// - If the user exists but has no password yet: set the initial password and
//   force a reset.
// - If the user already has a password: leave it untouched (don't clobber a
//   password the admin has since chosen).
//
// Override via ADMIN_EMAIL / ADMIN_NAME / ADMIN_INITIAL_PASSWORD env vars.

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import { users } from './schema/users'
import { loadEnv } from '../config/env.schema'
import { hashPassword } from '../auth/password.util'

async function main() {
  const env = loadEnv()
  const email = (process.env.ADMIN_EMAIL ?? 'support@gitsols.com').toLowerCase()
  const name = process.env.ADMIN_NAME ?? 'GITSOLS Support'
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD ?? 'Admin@123456'

  const client = postgres(env.DATABASE_URL, { max: 1 })
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
    } else if (!existing.passwordHash) {
      await db
        .update(users)
        .set({ passwordHash: hashPassword(initialPassword), mustResetPassword: true })
        .where(eq(users.id, existing.id))
      // eslint-disable-next-line no-console
      console.log(`[seed-admin] set initial password for existing ${email} (reset required)`)
    } else {
      // eslint-disable-next-line no-console
      console.log(`[seed-admin] ${email} already has a password — leaving untouched`)
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed-admin] failed', err)
  process.exit(1)
})
