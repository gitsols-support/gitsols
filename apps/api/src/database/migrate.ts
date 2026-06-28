// DB migration runner. Exposed as runMigrations() so the API can apply
// migrations in-process at boot (see main.ts), and also runnable standalone
// via `node dist/database/migrate.js`.

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { loadEnv } from '../config/env.schema'

export async function runMigrations(databaseUrl: string): Promise<void> {
  const client = postgres(databaseUrl, { max: 1 })
  try {
    await migrate(drizzle(client), { migrationsFolder: './drizzle/migrations' })
    // eslint-disable-next-line no-console
    console.log('[migrate] migrations applied')
  } finally {
    await client.end({ timeout: 5 })
  }
}

// CLI entrypoint
if (require.main === module) {
  runMigrations(loadEnv().DATABASE_URL)
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[migrate] failed', err)
      process.exit(1)
    })
}
