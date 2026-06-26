// Thin wrapper around the Drizzle client.
//
// Two responsibilities:
//   1. Own the connection pool lifecycle (open on init, close on shutdown).
//   2. Provide a `withSessionContext()` helper so request-scoped code can set
//      Postgres session variables that RLS policies read.
//
// The session-context pattern is the safety net for multi-tenancy: even if
// app code forgets to filter by accountId, the database refuses to return
// rows the requesting user can't see. See `drizzle/rls/README.md`.

import { Injectable, OnModuleDestroy, OnModuleInit, Inject, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'
import postgres from 'postgres'
import { appConfig } from '../config/app.config'
import * as schema from './schema'

export type Database = PostgresJsDatabase<typeof schema>

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name)
  private client!: ReturnType<typeof postgres>
  private _db!: Database

  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  onModuleInit(): void {
    this.client = postgres(this.config.database.url, {
      max: this.config.database.poolMax,
      // Avoid the `prepare: true` default — it conflicts with PgBouncer in
      // transaction-pooling mode, which Neon/Supabase use by default.
      prepare: false,
    })
    this._db = drizzle(this.client, { schema })
    this.logger.log('Database client connected')
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.end({ timeout: 5 })
    this.logger.log('Database client closed')
  }

  /**
   * The Drizzle client. Use directly for queries that don't need RLS context
   * (e.g. health checks, internal-only tables).
   */
  get db(): Database {
    return this._db
  }

  /**
   * Run a callback inside a transaction with Postgres session variables set
   * for RLS. The variables are:
   *
   *   gitsols.user_id    — JWT subject (UUID)
   *   gitsols.account_id — tenant scope (UUID or '' for internal staff)
   *   gitsols.role       — JWT role
   *
   * Phase 2 will add per-table RLS policies that read these via
   * `current_setting('gitsols.account_id', true)`. The `, true` returns NULL
   * instead of erroring when the setting isn't present, so the same policy
   * can be evaluated by migrations and superuser tools.
   */
  async withSessionContext<T>(
    ctx: { userId: string; accountId: string | null; role: string },
    work: (tx: Database) => Promise<T>,
  ): Promise<T> {
    return this._db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('gitsols.user_id', ${ctx.userId}, true)`)
      await tx.execute(
        sql`SELECT set_config('gitsols.account_id', ${ctx.accountId ?? ''}, true)`,
      )
      await tx.execute(sql`SELECT set_config('gitsols.role', ${ctx.role}, true)`)
      return work(tx as Database)
    })
  }

  /** Used by the health controller's /ready probe. */
  async ping(): Promise<boolean> {
    try {
      await this._db.execute(sql`SELECT 1`)
      return true
    } catch (err) {
      this.logger.warn({ err }, 'Database ping failed')
      return false
    }
  }
}
