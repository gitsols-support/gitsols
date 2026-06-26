// Boot-time environment-variable contract. A typo'd or missing var fails the
// process at startup with a structured error rather than silently degrading.
//
// Zod is used here intentionally — Nest 12 is moving toward Standard Schema
// for validation, and Zod is the canonical Standard-Schema implementation,
// so this scales forward.

import { z } from 'zod'

const csvList = (defaultValue: string) =>
  z
    .string()
    .default(defaultValue)
    .transform((v) =>
      v
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    )

export const envSchema = z.object({
  // ── Runtime ──────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),

  // ── HTTP server ──────────────────────────────────────────────────
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  CORS_ORIGINS: csvList('http://localhost:3000'),
  THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),

  // ── Database ─────────────────────────────────────────────────────
  // postgres:// or postgresql:// — accept both. Optional sslmode handled by client.
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL must be a postgres connection string'),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

  // ── Auth ─────────────────────────────────────────────────────────
  // Required everywhere — used to verify JWTs signed by the web app's Auth.js.
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 chars — generate with `openssl rand -base64 32`'),
  AUTH_ISSUER: z.string().url().default('http://localhost:3000'),

  // ── Optional integrations — only validated as strings, not required at boot ──
  POSTMARK_API_TOKEN: z.string().optional(),
  POSTMARK_FROM_ADDRESS: z.string().email().optional(),
  LEAD_NOTIFICATION_TO: z.string().email().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_DOCUMENTS: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validate `process.env` once at boot. Throws on the first malformed value
 * with a clear message about which variable failed. Call this from main.ts
 * before NestFactory.create.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  return result.data
}
