# gitsols-platform — Engineering Rulebook

> The GITSOLS LLC platform monorepo: public marketing site, internal admin/CRM, and client portal,
> powered by one NestJS API. Forked from `ht-nnjs-bp`. Read this file before touching the UI or
> the API — the rules exist because they got the design across the line in production and we
> don't want to re-litigate them per feature.

The product spec, architecture rationale, and phased roadmap live at
`../gitsols-platform-spec.md`. **Read it before opening a non-trivial PR.**

---

## 0. WHAT THIS IS

A monorepo with one Next.js web app (`apps/web`), one NestJS API (`apps/api`), and three shared
packages (`@gitsols/types`, `@gitsols/constants`, `@gitsols/utils`). The web app hosts three
subdomain-routed surfaces:

- **`gitsols.com`** — public marketing site (Phase 1)
- **`admin.gitsols.com`** — internal CRM, engagement management, ticketing (Phase 2)
- **`portal.gitsols.com`** — client-facing portal: milestone progress, approvals, feedback, docs (Phase 3)

The API serves web today and mobile in v2. One API, one auth, one audit log.

### Phase-aware development

| Phase | What's live | What stays placeholder |
|---|---|---|
| **0 (now)** | Monorepo + teal palette + admin shell + Phase 0 landing · Drizzle schema (`accounts`, `users`, `audit_log`) + DatabaseService with `withSessionContext()` · NestJS auth module (`JwtAuthGuard`, `RolesGuard`, `@Public`, `@CurrentUser`, `@Roles`, `/api/v1/auth/me`) · Auth.js v5 wired (M365 + Google + Postmark magic link) · middleware gating `/admin/*` | Real CRM domain · per-tenant RLS policies · client portal surface |
| 1 | Public marketing site (Home, Services, Industries, Process, Resources, Free IT Audit, Contact) | CRM still stub |
| 2 | Leads/Accounts/Pipeline, Service Catalog, Engagements, per-tenant tables with RLS policies live | Portal still stub |
| 3 | Client portal: engagements, milestones, approvals, feedback, docs | Tickets/invoices stub |
| 4 | Tickets, invoices, bespoke surfaces | Hardening |
| 5 | Audit log surfacing, pen test, `/trust` page, external launch | — |

Don't ship out-of-phase work without a note in the PR explaining why.

---

## 1. TECH STACK — DO NOT DEVIATE

```
Next.js 16        App Router + route groups, Turbopack default
React 19.2        with TypeScript 6 (strict mode)
Tailwind CSS v4   utility-first, no component libraries
lucide-react 1.x  ALL icons — no other icon sets
clsx              conditional class utility
tailwind-merge    (twMerge) merge conflicting Tailwind classes
NestJS 11.1       Fastify + Pino + Zod env + class-validator + @nestjs/throttler
Turborepo 2.9     monorepo orchestration
ESLint 10         flat config (eslint.config.js)
Vitest 3          test runner (Jest replaced)
Node.js 24 LTS    minimum runtime
```

**Planned additions (Phase 0 finishing, before Phase 1 build starts):**

```
Postgres 16       primary data store
Drizzle ORM       migrations, RLS-friendly raw SQL
Auth.js           web auth (M365 + Google SSO + magic link)
@nestjs/jwt       API auth (validates Auth.js session token)
Inngest / BullMQ  background jobs (TBD in Phase 0)
Postmark          transactional email
Cloudflare R2     object storage (signed URLs only)
```

**Hard prohibitions:**

- No shadcn/ui, no MUI, no Radix, no Chakra, no Headless UI
- No arbitrary hex values in JSX — use CSS variables or palette tokens only
- No inline `style={{}}` for colors that have a CSS variable equivalent
- No `any` type in TypeScript

---

## 2. COLOR SYSTEM (TEAL)

Defined in `apps/web/src/app/globals.css`:

```css
:root {
  --background:       #F8FAFA;   /* warm-white, slight teal tint */
  --foreground:       #042F2E;   /* deep teal-black */

  --primary:          #0F4C4C;   /* Deep Teal — primary brand */
  --primary-light:    #155E5E;
  --primary-dark:     #0A3A3A;
  --primary-50:       #ECFEFE;
  --primary-100:      #CFFAFA;

  --accent:           #14B8A6;   /* Signal Teal — CTAs, "live", "approved" */
  --accent-hover:     #0D9488;
  --accent-dark:      #0F766E;
  --accent-light:     #F0FDFA;

  --border:           #E2E8E8;
  --card:             #FFFFFF;
  --muted:            #5F7676;
  --muted-bg:         #F1F5F5;

  --success:          #14B8A6;
  --warning:          #F59E0B;
  --error:            #EF4444;
  --info:             #0EA5E9;
}
```

**Usage rules:**

- Tailwind arbitrary values: `text-[#0F4C4C]`, `bg-[#14B8A6]`, `border-[#E2E8E8]`
- Never use any color outside this palette
- Deep Teal `#0F4C4C` = primary brand, trust, navigation, headings
- Signal Teal `#14B8A6` = CTAs, section labels, "approved" / "live" / "healthy" states
- Use opacity modifiers freely: `text-[#0F4C4C]/80`, `bg-[#14B8A6]/10`

If a CTA must contrast harder against a dark-teal hero, see open question #5 in the spec — until that's decided, monochrome teal is the rule.

---

## 3. TYPOGRAPHY SCALE

| Role            | Classes                                                              |
| --------------- | -------------------------------------------------------------------- |
| Page heading    | `text-xl font-bold text-[#0F4C4C]`                                   |
| Section heading | `text-base font-semibold text-[#0F4C4C]`                             |
| Card title      | `text-sm font-semibold text-gray-800`                                |
| Nav item        | `text-sm font-medium`                                                |
| Section label   | `text-[10px] font-bold uppercase tracking-[0.12em] text-[#14B8A6]/70` |
| Body            | `text-sm text-gray-600`                                              |
| Meta / helper   | `text-xs text-gray-500`                                              |
| Timestamp       | `text-[10px] text-gray-400`                                          |

**Badges — see `components/ui/Badge.tsx`. Don't redefine inline.**

---

## 4. COMPONENT PATTERNS

### Buttons (`components/ui/Button.tsx`)

```
Primary:  bg-[#0F4C4C] text-white  hover:bg-[#155E5E]
Accent:   bg-[#14B8A6] text-white  hover:bg-[#0D9488]
Ghost:    border border-[#E2E8E8] text-[#0F4C4C]  hover:bg-gray-50
Danger:   border border-red-200 text-red-600  hover:bg-red-50
```

### Cards (`components/ui/Card.tsx`)

```
Standard: bg-white rounded-xl border border-[#E2E8E8]
Large:    bg-white rounded-2xl border border-[#E2E8E8]
Elevated: bg-white rounded-xl shadow-sm border border-[#E2E8E8]
Urgent:   bg-amber-50 rounded-xl border border-amber-200
```

### Inputs

Always use `<IconInput icon={Foo} />` when you need a leading icon. Never wrap an absolute-
positioned icon over a `pl-10` input — that pattern drifts vertically across browsers.

### Form sections

```
Wrapper:   bg-white rounded-xl border border-[#E2E8E8] p-6 space-y-5
Section:   text-sm font-semibold text-[#0F4C4C] mb-4 pb-3 border-b border-[#E2E8E8]
Label:     text-xs font-medium text-gray-700 mb-1.5 block
Helper:    text-[10px] text-gray-400 mt-1
```

---

## 5. LAYOUT SHELL

Four files in `apps/web/src/components/layout/`:

```
AdminLayoutClient.tsx   — manages sidebarOpen + rightPanelType state
AdminSidebar.tsx        — left nav, collapsible, NAV_GROUPS-driven
AdminTopBar.tsx         — h-14 top bar, page title, icon buttons, profile dropdown
AdminRightSidebar.tsx   — fixed overlay panel (notifications, activity, stats)
```

### Hard layout rules

1. **Active nav state = full Deep Teal background.** Never underlines, left borders, or accent backgrounds for active state.
2. **Section labels always Signal Teal `#14B8A6`/70.** Never gray, never primary.
3. **Right sidebar is a fixed overlay.** Never pushes or shifts main content.
4. **Icon sizes:** `w-4 h-4` in sidebar and topbar. Button hit areas: `w-9 h-9` minimum.
5. **Rounded corners:** nav items + cards = `rounded-xl`, badges = `rounded-full` or `rounded-lg`, inputs = `rounded-lg`.
6. **Sidebar collapsed = `w-16`, expanded = `w-60`.** No other widths.
7. **Don't restructure NAV_GROUPS** without reason — add new pages as new items in an existing group rather than reorganizing.

### NAV_GROUPS

Lives at the top of `AdminSidebar.tsx`. Add new admin pages here. Imports come from
`lucide-react` only.

### Portal vs admin shell

The portal (`portal.gitsols.com`) reuses `AdminLayoutClient` with a different NAV_GROUPS and role-aware data fetching. Same shell, different content — see Phase 3 spec for the portal nav structure.

---

## 6. FILE STRUCTURE

```
gitsols-platform/
├── package.json                     ← workspaces: apps/* + packages/*
├── turbo.json
├── tsconfig.base.json
├── CLAUDE.md                        ← this file
├── README.md
│
├── apps/
│   ├── web/                         @gitsols/web
│   │   ├── package.json
│   │   ├── tsconfig.json            ← @gitsols/* path aliases
│   │   ├── next.config.ts           ← transpilePackages: @gitsols/*
│   │   ├── postcss.config.mjs
│   │   └── src/
│   │       ├── env.ts               ← Zod-validated web env
│   │       ├── auth.ts              ← Auth.js v5 config + exports (auth, handlers, signIn, signOut)
│   │       ├── middleware.ts        ← gates /admin/* via auth()
│   │       ├── server/
│   │       │   └── api-client.ts    ← server-only apiFetch<T>() → Nest API with Bearer JWT
│   │       ├── app/
│   │       │   ├── globals.css      ← CSS variables (palette source of truth)
│   │       │   ├── layout.tsx       ← root <html>/<body>
│   │       │   ├── page.tsx         ← / (Phase 0 placeholder → marketing site Phase 1)
│   │       │   ├── api/
│   │       │   │   └── auth/[...nextauth]/route.ts  ← Auth.js handlers
│   │       │   ├── admin/
│   │       │   │   ├── layout.tsx   ← server layout for sign-in metadata
│   │       │   │   └── page.tsx     ← /admin (sign-in, no shell — wired to signIn())
│   │       │   └── (admin)/
│   │       │       ├── layout.tsx   ← <SessionProvider> + <AdminLayoutClient>
│   │       │       └── admin/
│   │       │           ├── dashboard/page.tsx
│   │       │           ├── users/page.tsx
│   │       │           ├── activity/page.tsx
│   │       │           ├── settings/page.tsx
│   │       │           ├── theme/page.tsx
│   │       │           └── docs/page.tsx
│   │       └── components/
│   │           ├── auth/   ← AuthShell, MicrosoftButton, PasswordInput
│   │           ├── layout/ ← AdminLayoutClient, AdminSidebar, AdminTopBar, AdminRightSidebar
│   │           ├── ui/     ← Badge, Button, Card, IconInput, StatusDot, StatCard
│   │           └── admin/  ← page-specific helpers (PlaceholderPage etc.)
│   │
│   └── api/                         @gitsols/api (NestJS)
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       ├── drizzle.config.ts        ← drizzle-kit config
│       ├── drizzle/
│       │   ├── README.md            ← migration workflow
│       │   ├── migrations/          ← generated SQL (gitignored .ts companions)
│       │   └── rls/README.md        ← RLS pattern doc
│       └── src/
│           ├── main.ts              ← Fastify + Pino bootstrap
│           ├── app.module.ts        ← root module
│           ├── config/
│           │   ├── app.config.ts
│           │   └── env.schema.ts    ← Zod env contract
│           ├── auth/
│           │   ├── auth.module.ts
│           │   ├── auth.controller.ts        ← /api/v1/auth/me
│           │   ├── jwt-auth.guard.ts         ← APP_GUARD #2
│           │   ├── roles.guard.ts            ← APP_GUARD #3
│           │   ├── roles.decorator.ts        ← @Roles()
│           │   ├── public.decorator.ts       ← @Public()
│           │   └── current-user.decorator.ts ← @CurrentUser()
│           ├── database/
│           │   ├── database.module.ts        ← @Global()
│           │   ├── database.service.ts       ← withSessionContext(), ping()
│           │   └── schema/
│           │       ├── index.ts              ← re-exports
│           │       ├── accounts.ts
│           │       ├── users.ts              ← role enum lives here
│           │       └── audit-log.ts
│           └── observability/
│               └── health.controller.ts
│
└── packages/
    ├── types/        @gitsols/types       — domain types (Role, SessionUser, JwtPayload)
    ├── constants/    @gitsols/constants   — registries + stub data
    └── utils/        @gitsols/utils       — cn(), formatters
```

### 6.1 Hard rule: where shared code lives

`apps/web/src/lib/types/`, `apps/web/src/lib/constants/`, and `apps/web/src/lib/utils.ts`
**MUST NOT exist.** Same for `apps/api/`.

| You want to add…                                | Put it in…                  | Import from…       |
| ----------------------------------------------- | --------------------------- | ------------------ |
| A domain type (`User`, `Account`, `Engagement`) | `packages/types/src/`       | `@gitsols/types`      |
| A constants list (registries, stub data)        | `packages/constants/src/`   | `@gitsols/constants`  |
| A pure helper (`cn`, `formatCurrency`, …)       | `packages/utils/src/`       | `@gitsols/utils`      |
| App-only React hook or page-specific helper     | next to its consumer        | local relative     |

---

## 7. WORKING ON THIS REPO

```bash
pnpm install
pnpm build:packages    # types/constants/utils compile once
pnpm dev:web           # http://localhost:3000  (Phase 0 landing)
                          # http://localhost:3000/admin            (sign-in)
                          # http://localhost:3000/admin/dashboard  (admin shell)
pnpm dev:api           # http://localhost:4000/health/live
                          # http://localhost:4000/api/v1/docs       (Swagger)
```

### When picking up work

1. Check the spec (`../gitsols-platform-spec.md`) — confirm the phase the task belongs to.
2. Search `git log` for recent work in the same area.
3. If domain types are involved, add them to `@gitsols/types` first and rebuild packages.
4. Open a feature branch named `phaseN/<short-description>`.

### When adding a new admin or portal page

1. Add the route file under `apps/web/src/app/(admin)/admin/<your-page>/page.tsx`.
2. Add the NAV_GROUPS entry in `AdminSidebar.tsx`.
3. Use existing UI primitives (`Button`, `Card`, `IconInput`, `StatCard`, `Badge`, `StatusDot`).
4. If you need data, fetch from the API (`/api/v1/...`), not from a stubs file in the app.

---

## 8. HARD RULES — READ BEFORE EVERY RESPONSE

1. **No UI libraries.** No shadcn, Radix, MUI, Headless UI — pure Tailwind only.
2. **No arbitrary colors.** Only colors from the palette. Never hardcode hex values not in `globals.css`.
3. **Active nav = full Deep Teal background.** Never underlines / left borders / accent backgrounds.
4. **Section labels always in Signal Teal `#14B8A6`/70.** Never primary. Never gray.
5. **Right sidebar = fixed overlay.** Never pushes or shifts main content.
6. **TypeScript strict.** No `any`. All props fully typed.
7. **Never `useEffect` for derivable data.** Compute from props/state.
8. **All form labels:** `text-xs font-medium text-gray-700` above each input with `mb-1.5 block`.
9. **No `console.log`** in committed code. Use the Pino logger in API code; use `// TODO:` in web code.
10. **Animations:** `animate-fade-in` on page mounts. No heavy entrance animations on individual fields.
11. **Shared code in `packages/`, not in `apps/*/src/lib/`.** Domain types → `@gitsols/types`. Constants → `@gitsols/constants`. Pure helpers → `@gitsols/utils`.
12. **Icon-prefixed inputs use `IconInput` flex pattern.** Never `<div class="relative"><Icon absolute/><input pl-10/></div>`.
13. **Don't mix the auth shell into admin or portal pages.** `AuthShell` is for `/admin`, MFA verify, etc. Admin pages live inside `(admin)/admin/*` and use `AdminLayoutClient`. The public landing at `/` and the Phase 1 marketing pages use neither shell — they're public.
14. **No PHI in stub data, logs, or fixtures.** Phase 0 stub names like "Riverside Medical Group" are fictional examples only.
15. **API auth = JWT verified by Nest guard.** Web sets the cookie via Auth.js; API never trusts a header without verifying the signature.

---

*End of CLAUDE.md — gitsols-platform v0.2 · May 2026 stack · teal palette*
