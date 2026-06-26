// Drizzle Kit config — used by `pnpm db:generate` / `db:migrate` / `db:push`.
// Reads the same DATABASE_URL as the running API.

import type { Config } from 'drizzle-kit'
import { loadEnv } from './src/config/env.schema'

const env = loadEnv()

export default {
  schema: './src/database/schema/*.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
} satisfies Config
