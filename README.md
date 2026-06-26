# gitsols-platform

The GITSOLS LLC platform monorepo — public marketing site, internal admin/CRM, and client portal — all powered by one NestJS API.

Forked from the internal `ht-nnjs-bp` boilerplate. Build plan lives at `../gitsols-platform-spec.md`.

## What's in the box

- **`apps/web`** — Next.js 16 app (App Router, Turbopack default, React 19.2). Hosts three surfaces by subdomain:
  - `gitsols.com` — public marketing site (Phase 1)
  - `admin.gitsols.com` — internal CRM, engagement management, ticketing
  - `portal.gitsols.com` — client-facing portal (milestone progress, approvals, feedback, docs)
- **`apps/api`** — NestJS 11.1 on Fastify. Helmet, CORS, compression, `@nestjs/throttler` rate limiting, Pino logging with redaction, Zod-validated env, graceful shutdown, Swagger at `/api/v1/docs` (non-prod). One API serves web today and mobile later.
- **`packages/types`** — Shared TypeScript types (`@gitsols/types`).
- **`packages/constants`** — Shared constants, enums, and stub data (`@gitsols/constants`).
- **`packages/utils`** — Shared helpers — `cn()`, formatters, slugify, etc. (`@gitsols/utils`).

## Tech stack

| | |
|---|---|
| Frontend | Next.js 16 · React 19.2 · TypeScript 6 strict · Tailwind CSS v4 · lucide-react 1.x |
| Backend | NestJS 11.1 · Fastify · Pino · Zod · class-validator · @nestjs/throttler · Swagger |
| Data (planned, Phase 0) | Postgres 16 · Drizzle ORM · RLS for multi-tenancy |
| Tooling | Turborepo 2.9 · pnpm workspaces · ESLint 10 (flat config) · Vitest 3 · Prettier 3 · Husky · lint-staged · commitlint |
| Runtime | Node.js 24 LTS |

## Brand

| | |
|---|---|
| Primary | `#0F4C4C` Deep Teal |
| Primary light / dark | `#155E5E` / `#0A3A3A` |
| Accent | `#14B8A6` Signal Teal — CTAs, "live", "approved" |
| Accent hover / dark | `#0D9488` / `#0F766E` |
| Foreground | `#042F2E` Deep Teal-Black |
| Background | `#F8FAFA` warm-white |
| Wordmark | `gitsols` (lowercase) · monogram `G.` |
| Type | Geist Sans (UI) · Geist Mono (data/code) |

Palette is defined in `apps/web/src/app/globals.css`. Hard rule: change colors there only. Don't sprinkle hex values across components.

## Getting started

```bash
# 1. Install
pnpm install

# 2. Build packages once (types/utils/constants compile before apps consume them)
pnpm build:packages

# 3. Copy env file and fill in DATABASE_URL + AUTH_SECRET (minimum)
cp .env.example .env
# AUTH_SECRET=$(openssl rand -base64 32)   ← required, 32+ chars

# 4. Start Postgres (any way you like — docker run, Neon, Render)
docker run --rm -d --name gitsols-pg \
  -e POSTGRES_USER=gitsols -e POSTGRES_PASSWORD=gitsols -e POSTGRES_DB=gitsols \
  -p 5432:5432 postgres:16

# 5. Generate + apply the initial migration
pnpm db:generate -- --name=init_phase_0
pnpm db:migrate

# 6. Run web app
pnpm dev:web
# → http://localhost:3000              (public landing — Phase 0 placeholder)
# → http://localhost:3000/admin         (sign-in)
# → http://localhost:3000/admin/dashboard

# 7. Run api in another terminal
pnpm dev:api
# → http://localhost:4000/health/live    (liveness — always 200)
# → http://localhost:4000/health/ready   (readiness — checks DB)
# → http://localhost:4000/api/v1/docs    (Swagger, non-prod only)
# → http://localhost:4000/api/v1/auth/me (JWT-protected example)
```

### Auth providers

The sign-in page tries Microsoft Entra (M365), Google, and Postmark magic-link in that order — each provider is skipped if its env vars are empty. In dev with nothing configured, click "dev mode →" to skip auth and walk through the admin shell.

To wire real SSO:

- **Microsoft** — register an app at https://entra.microsoft.com, set `AUTH_MICROSOFT_ENTRA_ID` / `AUTH_MICROSOFT_ENTRA_SECRET` / `AUTH_MICROSOFT_ENTRA_TENANT_ID`.
- **Google** — credentials at https://console.cloud.google.com/apis/credentials, set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
- **Magic link** — set `POSTMARK_API_TOKEN` and `POSTMARK_FROM_ADDRESS`.

## Routes

- `/` — public landing. Phase 0 placeholder; replaced in Phase 1 with the full GITSOLS marketing site (Home, Services, Industries, Process, Resources, Free IT Audit, Contact).
- `/admin` — split-panel sign-in. Stub auth currently — wire to real Microsoft 365 + Google SSO + magic link in Phase 2.
- `/admin/dashboard`, `/admin/users`, `/admin/settings`, … — the admin shell.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run all apps in parallel via Turbo |
| `pnpm dev:web` / `pnpm dev:api` | Run a single app |
| `pnpm build` | Build everything (packages + apps) |
| `pnpm lint` | ESLint flat config across the workspace |
| `pnpm test` | Vitest 3 across the workspace |
| `pnpm type-check` | `tsc --noEmit` across the workspace |
| `pnpm format` | Prettier write |

## File structure

```
gitsols-platform/
├── apps/
│   ├── web/         Next.js 16 — marketing + admin + portal (port 3000)
│   └── api/         NestJS 11.1 — single API surface (port 4000)
└── packages/
    ├── types/       @gitsols/types
    ├── constants/   @gitsols/constants
    └── utils/       @gitsols/utils
```

## Hard rules

See [`CLAUDE.md`](./CLAUDE.md) for the full rulebook. Highlights:

1. No UI libraries (no shadcn / Radix / MUI / Headless UI) — pure Tailwind only.
2. No arbitrary hex outside the palette in `globals.css`.
3. No app-local `lib/types/`, `lib/constants/`, or `lib/utils.ts` — shared code lives in `packages/`.
4. Active nav state is full Deep Teal background — never underlines or left borders.
5. Section labels are Signal Teal `#14B8A6`/70, never gray, never primary.
6. Right sidebar is a fixed overlay — never pushes content.
7. Icon-prefixed inputs use the `IconInput` flex pattern, never `absolute pl-10`.
8. TypeScript strict — no `any`.

## Roadmap

Phased build plan and architecture rationale live in `../gitsols-platform-spec.md`. Summary:

| Phase | What | Duration |
|---|---|---|
| 0 | Fork & rebrand (this commit) | 1 wk |
| 1 | Public marketing site live | 4 wks |
| 2 | Admin CRM v1 (Leads, Accounts, Pipeline, Engagements) | 6 wks |
| 3 | Client portal v1 (milestones, approvals, feedback) | 6 wks |
| 4 | Tickets + invoices + bespoke surfaces | 5 wks |
| 5 | Hardening + pen test + trust page + external launch | 4 wks |

## License

Private. Proprietary to GITSOLS LLC.
