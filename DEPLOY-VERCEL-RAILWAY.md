# Deploying gitsols-platform — Vercel (web) + Railway (API + Postgres)

This guide takes the monorepo from a fresh git repo to a live deployment:
the Next.js marketing/admin/portal app on **Vercel**, the NestJS API and
**Postgres** on **Railway**.

The repo is already wired for this:
- `apps/web/vercel.json` — Vercel build using pnpm from the monorepo root
- `railway.json` — Railway Dockerfile build + migrate-on-start + healthcheck
- `apps/api/Dockerfile` — multi-stage, non-root, healthcheck on `/health/live`
- `apps/api/src/database/migrate.ts` — runs migrations on every deploy

---

## 0. Get the code into git

> Note: the project folder is on a synced volume that blocks git's lock files,
> so the repository must be created on your Mac (native filesystem). A complete
> history bundle is included at the project root: `gitsols-platform.bundle`.

**Option A — initialize fresh (recommended):**

```bash
cd gitsols-platform
rm -rf .git                 # remove the partial repo created during setup
git init && git branch -M main
git add -A
git commit -m "Initial commit: gitsols-platform"
```

**Option B — restore from the bundle (keeps the prepared commit):**

```bash
git clone gitsols-platform.bundle gitsols-platform-restored
# then copy your working files over, or just use the restored folder
```

Create an empty repo on GitHub, then:

```bash
git remote add origin git@github.com:<you>/gitsols-platform.git
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `.next/`, `dist/`, `.env*`.
**Never commit `.env`** — secrets go in the Vercel/Railway dashboards.

---

## 1. Railway — Postgres + API

1. **New Project → Deploy from GitHub repo** → pick `gitsols-platform`.
2. **Add a database:** *New → Database → PostgreSQL*. Railway provisions it and
   exposes `DATABASE_URL` as a reference variable.
3. The service builds from `apps/api/Dockerfile` (declared in `railway.json`).
   On each deploy it runs `node dist/database/migrate.js && node dist/main.js`,
   so **migrations apply automatically** before the API starts.
4. **Service variables** (Settings → Variables):

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference) — append `?sslmode=require` |
   | `CORS_ORIGINS` | `https://gitsols.com,https://admin.gitsols.com,https://portal.gitsols.com` |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` (same value as web) |
   | `AUTH_ISSUER` | `https://admin.gitsols.com` |
   | `LOG_LEVEL` | `info` |
   | `LOG_PRETTY` | `false` |
   | `THROTTLE_TTL_MS` | `60000` |
   | `THROTTLE_LIMIT` | `100` |
   | `POSTMARK_API_TOKEN` | from Postmark |
   | `POSTMARK_FROM_ADDRESS` | `no-reply@gitsols.com` |
   | `LEAD_NOTIFICATION_TO` | `info@gitsols.com` |
   | `S3_*` | Cloudflare R2 credentials (documents) |
   | `SENTRY_DSN` | optional |

5. **Healthcheck** is already set to `/health/live` (120s timeout) in
   `railway.json`. Generate a domain under Settings → Networking — e.g.
   `https://gitsols-api.up.railway.app`. Map a custom domain
   `api.gitsols.com` when ready.

> First deploy: migrations create every table including the new
> `proposals`, `invoices`, and their line-item tables.

---

## 2. Vercel — web

1. **Add New → Project** → import `gitsols-platform`.
2. **Root Directory:** `apps/web`. Vercel reads `apps/web/vercel.json`, which
   installs and builds from the monorepo root via pnpm. Framework: Next.js.
3. **Environment Variables** (Production):

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `AUTH_SECRET` | same value as the API |
   | `AUTH_ISSUER` | `https://admin.gitsols.com` |
   | `AUTH_URL` | `https://admin.gitsols.com` |
   | `NEXT_PUBLIC_API_URL` | `https://api.gitsols.com/api/v1` |
   | `NEXT_PUBLIC_SITE_URL` | `https://gitsols.com` |
   | `AUTH_MICROSOFT_ENTRA_ID` / `_SECRET` / `_TENANT_ID` | M365 SSO app |
   | `AUTH_GOOGLE_ID` / `_SECRET` | Google SSO (optional) |
   | `POSTMARK_API_TOKEN` | for magic-link auth |
   | `ADMIN_DEV_BYPASS` | `false` (required — the app refuses to boot if `true` in prod) |
   | `NEXT_PUBLIC_ADMIN_DEV_BYPASS` | `false` |

4. **Domains:** add `gitsols.com` (apex), and the subdomains the app serves —
   `admin.gitsols.com` and `portal.gitsols.com` — all pointing at the same
   Vercel project. The app routes by host via `middleware.ts`.

---

## 3. After first deploy — checklist

- `GET https://api.gitsols.com/health/live` returns `200`.
- `https://gitsols.com` renders the marketing site.
- Sign in at `https://admin.gitsols.com` (M365 / Google / magic link).
- **Billing smoke test:** Admin → Billing → Pricing: add a service line.
  Then Proposals → New: pick a client + project, add lines from the catalog,
  save, open the record, **Download PDF**. Mark it accepted →
  **Convert to invoice**. Open the invoice and Download PDF.
- Set `AUTH_SECRET` identically on both platforms or session JWTs won't verify.

---

## 4. Updating

Push to `main`. Vercel and Railway redeploy automatically. New DB changes:
generate a migration locally (`pnpm db:generate`), commit it, and it applies on
the next Railway deploy.
