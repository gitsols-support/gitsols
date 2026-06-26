// Production migration runner — invoked on deploy before the API boots
// (see railway.json startCommand). Uses drizzle's postgres-js migrator against
// the SQL files generated into ./drizzle/migrations. Idempotent: drizzle tracks
// applied migrations in its __drizzle_migrations table.

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { loadEnv } from '../config/env.schema'

async function main() {
  const env = loadEnv()
  // A dedicated single connection — migrations must run serially.
  const client = postgres(env.DATABASE_URL, { max: 1 })
  try {
    // Resolve relative to cwd (the deployed package root /app), where the
    // drizzle/ folder is shipped alongside dist/.
    await migrate(drizzle(client), { migrationsFolder: './drizzle/migrations' })
    // eslint-disable-next-line no-console
    console.log('[migrate] migrations applied')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[migrate] failed', err)
  process.exit(1)
})
