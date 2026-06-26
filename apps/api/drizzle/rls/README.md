# Row-Level Security (RLS) pattern

This directory documents the Postgres RLS pattern every per-tenant table in the GITSOLS platform follows. **Phase 0 scaffolds the pattern; Phase 2 applies it per table** as the real domain (`engagements`, `milestones`, `tickets`, `documents`, `invoices`, ...) lands.

The pattern exists because the customer base is healthcare and financial — RLS is the safety net that ensures a bug in app code can't leak data between tenants.

## How it works end-to-end

```
1. Browser → Auth.js verifies user, signs a JWT
2. Web → calls Nest API with Authorization: Bearer <jwt>
3. JwtAuthGuard verifies the JWT, attaches SessionUser to req.user
4. Feature service calls DatabaseService.withSessionContext({ userId, accountId, role }, ...)
5. withSessionContext opens a transaction and SET LOCAL session vars:
       gitsols.user_id    = <jwt.id>
       gitsols.account_id = <jwt.accountId or ''>
       gitsols.role       = <jwt.role>
6. RLS policy on every per-tenant table reads current_setting('gitsols.account_id', true)
   and filters rows accordingly.
```

The `, true` argument to `current_setting` returns NULL instead of erroring when the variable isn't set, so the same policy can be evaluated by superuser tools (drizzle-kit migrations, db:studio) without choking.

## Per-table policy template

For any table with an `account_id` column (i.e. every per-tenant table — `engagements`, `milestones`, `tickets`, `documents`, `invoices`, `activities`, `feedback`, ...):

```sql
-- Turn on RLS for the table
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- Policy 1: internal staff see everything
CREATE POLICY engagements_internal_select ON engagements
  FOR SELECT
  USING (
    current_setting('gitsols.role', true) IN
      ('owner','admin','sales','pm','tech','readonly')
  );

-- Policy 2: client users see only their own account's rows
CREATE POLICY engagements_client_select ON engagements
  FOR SELECT
  USING (
    current_setting('gitsols.role', true) IN ('client_primary','client_user')
    AND account_id::text = current_setting('gitsols.account_id', true)
  );

-- Policies 3-4: writes — only internal roles can mutate by default;
-- client_primary gets specific UPDATE on approval rows (added per-table).
CREATE POLICY engagements_internal_write ON engagements
  FOR ALL
  USING (
    current_setting('gitsols.role', true) IN ('owner','admin','sales','pm','tech')
  )
  WITH CHECK (
    current_setting('gitsols.role', true) IN ('owner','admin','sales','pm','tech')
  );
```

### Helper functions (Phase 0 migration installs these once)

```sql
CREATE OR REPLACE FUNCTION current_role_text() RETURNS text AS $$
  SELECT current_setting('gitsols.role', true);
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_account_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('gitsols.account_id', true), '')::uuid;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_internal() RETURNS boolean AS $$
  SELECT current_role_text() IN ('owner','admin','sales','pm','tech','readonly');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_client() RETURNS boolean AS $$
  SELECT current_role_text() IN ('client_primary','client_user');
$$ LANGUAGE SQL STABLE;
```

With those helpers, the policy template collapses to:

```sql
CREATE POLICY engagements_select ON engagements
  FOR SELECT
  USING (
    is_internal() OR (is_client() AND account_id = current_account_id())
  );
```

## DB role separation

We use two database roles:

- `gitsols_app` — the role the API process connects as. Subject to RLS. Used for all request-scoped work.
- `gitsols_migrator` — superuser-equivalent role used only by `db:migrate` / `db:push`. Bypasses RLS via `BYPASSRLS`.

```sql
CREATE ROLE gitsols_app LOGIN PASSWORD '...';
CREATE ROLE gitsols_migrator LOGIN PASSWORD '...' BYPASSRLS;
GRANT USAGE ON SCHEMA public TO gitsols_app, gitsols_migrator;
-- Grant per-table privileges in migrations as tables land.
```

Production `DATABASE_URL` points to `gitsols_app`. CI / migration runs use a separate URL pointing to `gitsols_migrator`. Phase 2 wires this split into `drizzle.config.ts` via `MIGRATE_DATABASE_URL` env var.

## Testing RLS

Each per-tenant table should have a vitest spec that:

1. Inserts two rows in two different accounts.
2. Opens `withSessionContext({ role: 'client_primary', accountId: A })` and asserts only A's row is visible.
3. Opens `withSessionContext({ role: 'admin', accountId: null })` and asserts both rows are visible.
4. Attempts an UPDATE from a client role against another account's row and asserts it fails or affects 0 rows.

Phase 2 will land a vitest helper for steps 1-2 to avoid boilerplate.

## When you can skip RLS

- `audit_log` — write-only from app code, read-only from internal staff. Has its own policy: writes always allowed, reads require `is_internal()`.
- `accounts` — public to internal staff, single-row scope for client users (only their own org).
- `users` — read-self always allowed, list/create restricted by role.

## Phase 0 status

- ✅ `DatabaseService.withSessionContext()` implemented.
- ✅ Session-variable contract documented (this file).
- ⬜ Helper functions migration — added with the first real per-tenant table in Phase 2.
- ⬜ Per-table policies — applied per table in Phase 2.
- ⬜ `gitsols_app` / `gitsols_migrator` role split — Phase 2.

The Phase 0 schema (`users`, `accounts`, `audit_log`) intentionally ships without RLS policies — these three tables have their access rules enforced at the app layer for v0. Per-tenant tables added in Phase 2 will enforce at the DB layer from day one.
