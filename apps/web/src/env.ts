// Web-app boot-time env contract. Mirrors apps/api/src/config/env.schema.ts
// in style — Zod, fail-fast — but only validates the subset the web app
// actually needs at runtime.
//
// Server-side env vars are validated here. Public env (NEXT_PUBLIC_*) are
// inlined by Next.js at build time and aren't validated — but we still
// list them in .env.example for visibility.
//
// Dev ergonomics: AUTH_SECRET has a dev-only fallback so marketing pages
// preview without a .env file. The fallback is rejected in production
// builds — a missing AUTH_SECRET there is a fatal startup error.

import { z } from 'zod'

const isProduction = process.env.NODE_ENV === 'production'

// This module is imported by a few client components (they read NEXT_PUBLIC_*
// values from it). On the client, server-only secrets like AUTH_SECRET are not
// injected into the bundle, so we must NOT require them there — otherwise the
// schema throws in the browser and the page fails to load. AUTH_SECRET is only
// ever USED server-side (api-client, server actions), where it stays required.
const isServer = typeof window === 'undefined'

// 32-char placeholder used only when NODE_ENV !== 'production' OR on the client
// (where the real secret is never used). Never let it touch a real server.
const DEV_AUTH_SECRET_FALLBACK =
  'gitsols-dev-fallback-do-not-deploy-with-this-secret'

const authSecretSchema =
  isProduction && isServer
    ? z
        .string({ required_error: 'AUTH_SECRET is required in production' })
        .min(32, 'AUTH_SECRET must be at least 32 chars (openssl rand -base64 32)')
    : z
        .string()
        .min(32, 'AUTH_SECRET must be at least 32 chars (openssl rand -base64 32)')
        .default(DEV_AUTH_SECRET_FALLBACK)

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),

  // Where the Nest API lives. Server components call this directly.
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000/api/v1'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

  // Shared secret signs the JWT the web app issues; Nest verifies it.
  AUTH_SECRET: authSecretSchema,
  AUTH_ISSUER: z.string().url().default('http://localhost:3000'),
  AUTH_URL: z.string().url().optional(),

  // Providers — empty string means "skip this provider". Useful in dev.
  AUTH_MICROSOFT_ENTRA_ID: z.string().default(''),
  AUTH_MICROSOFT_ENTRA_SECRET: z.string().default(''),
  AUTH_MICROSOFT_ENTRA_TENANT_ID: z.string().default('common'),
  AUTH_GOOGLE_ID: z.string().default(''),
  AUTH_GOOGLE_SECRET: z.string().default(''),

  // Magic-link delivery
  POSTMARK_API_TOKEN: z.string().default(''),
  POSTMARK_FROM_ADDRESS: z.string().default('no-reply@gitsols.com'),

  // Dev-mode bypass — when "true", the middleware lets /admin/* through
  // without an Auth.js session. NEVER set this in production; the parser
  // throws if it's enabled while NODE_ENV=production.
  ADMIN_DEV_BYPASS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_ADMIN_DEV_BYPASS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
}).refine(
  (cfg) => !(cfg.NODE_ENV === 'production' && cfg.ADMIN_DEV_BYPASS),
  { message: 'ADMIN_DEV_BYPASS=true is not allowed when NODE_ENV=production' },
)

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '<root>'}: ${i.message}`)
    .join('\n')
  throw new Error(
    [
      'Invalid web env:',
      issues,
      '',
      'Quick fix:',
      '  cp .env.example .env',
      '  echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env',
      '',
      'See README.md → "Getting started" for the full list of env vars.',
    ].join('\n'),
  )
}

// Warn loudly when the dev fallback is in use. Logging once per process is
// enough — Next.js may re-evaluate this module on hot reload, which would
// double-log; treat that as fine.
if (!isProduction && parsed.data.AUTH_SECRET === DEV_AUTH_SECRET_FALLBACK) {
  // eslint-disable-next-line no-console
  console.warn(
    [
      '',
      '⚠️  AUTH_SECRET not set — using the dev fallback.',
      '   Sign-in is non-functional until you set a real secret:',
      '     echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env',
      '   This fallback is REJECTED in production builds.',
      '',
    ].join('\n'),
  )
}

export const env = parsed.data
export type WebEnv = typeof env
