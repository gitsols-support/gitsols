import { Controller, Get, Injectable, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { sql, gte, notInArray, ne, eq, desc } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { opportunities } from '../database/schema/opportunities'
import { accounts } from '../database/schema/accounts'
import { engagements } from '../database/schema/engagements'
import { tickets } from '../database/schema/tickets'
import { leads } from '../database/schema/leads'
import { marketingEngagements } from '../database/schema/marketing'
import { auditLog } from '../database/schema/audit-log'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import type {
  DashboardMetrics,
  ReportsSummary,
  PipelineStageRollup,
  ActivityEvent,
} from '@gitsols/types'


@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async metrics(): Promise<DashboardMetrics> {
    const db = this.db.db
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)

    const [pipeline] = await db
      .select({
        value: sql<number>`coalesce(sum(${opportunities.value}), 0)::int`,
        weighted: sql<number>`coalesce(sum(${opportunities.value} * ${opportunities.probability} / 100.0), 0)::int`,
      })
      .from(opportunities)
      .where(notInArray(opportunities.stage, ['closed-won', 'closed-lost']))

    const [acct] = await db
      .select({
        mrr: sql<number>`coalesce(sum(${accounts.mrr}), 0)::int`,
        total: sql<number>`count(*)::int`,
        atRisk: sql<number>`coalesce(sum(case when ${accounts.status} = 'at-risk' then 1 else 0 end), 0)::int`,
      })
      .from(accounts)

    const [tix] = await db
      .select({
        open: sql<number>`coalesce(sum(case when ${tickets.status} <> 'resolved' then 1 else 0 end), 0)::int`,
        p1: sql<number>`coalesce(sum(case when ${tickets.status} <> 'resolved' and ${tickets.priority} = 'p1' then 1 else 0 end), 0)::int`,
      })
      .from(tickets)

    const [eng] = await db
      .select({ active: sql<number>`count(*)::int` })
      .from(engagements)
      .where(eq(engagements.status, 'active'))

    const [lead] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(leads)
      .where(gte(leads.createdAt, weekAgo))

    const [mkt] = await db
      .select({ mrr: sql<number>`coalesce(sum(${marketingEngagements.monthlyRetainer}), 0)::int` })
      .from(marketingEngagements)
      .where(ne(marketingEngagements.status, 'closed'))

    const mrr = (acct?.mrr ?? 0) + (mkt?.mrr ?? 0)
    return {
      pipelineValue: pipeline?.value ?? 0,
      weightedPipelineValue: pipeline?.weighted ?? 0,
      mrr,
      arr: mrr * 12,
      openTickets: tix?.open ?? 0,
      p1Open: tix?.p1 ?? 0,
      activeEngagements: eng?.active ?? 0,
      leadsThisWeek: lead?.n ?? 0,
      accountsTotal: acct?.total ?? 0,
      accountsAtRisk: acct?.atRisk ?? 0,
      marketingMrr: mkt?.mrr ?? 0,
    }
  }

  async reports(): Promise<ReportsSummary> {
    const db = this.db.db
    const stageRows = await db
      .select({
        stage: opportunities.stage,
        count: sql<number>`count(*)::int`,
        value: sql<number>`coalesce(sum(${opportunities.value}), 0)::int`,
      })
      .from(opportunities)
      .groupBy(opportunities.stage)

    const pipelineByStage: PipelineStageRollup[] = stageRows.map((r) => ({
      stage: r.stage,
      count: r.count,
      value: r.value,
    }))

    const svcRows = await db
      .select({
        service: sql<string>`coalesce(${engagements.serviceSlug}, 'other')`,
        mrr: sql<number>`coalesce(sum(${engagements.mrrOrValue}), 0)::int`,
      })
      .from(engagements)
      .groupBy(engagements.serviceSlug)

    return {
      metrics: await this.metrics(),
      pipelineByStage,
      revenueByService: svcRows.map((r) => ({ service: r.service, mrr: r.mrr })),
    }
  }

  async activity(limit = 50): Promise<ActivityEvent[]> {
    const rows = await this.db.db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.occurredAt))
      .limit(Math.min(limit, 200))
    return rows.map((r) => ({
      id: r.id,
      actor: r.actorEmail,
      action: r.action,
      entity: r.entity,
      entityId: r.entityId ?? undefined,
      summary: r.payload ? JSON.stringify(r.payload).slice(0, 280) : undefined,
      occurredAt:
        r.occurredAt instanceof Date ? r.occurredAt.toISOString() : String(r.occurredAt),
    }))
  }
}

@ApiTags('dashboard')
@Roles(...INTERNAL_ONLY)
@Controller()
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard/metrics')
  metrics() {
    return this.dashboard.metrics()
  }

  @Get('reports/summary')
  reports() {
    return this.dashboard.reports()
  }

  @Get('activity')
  activity(@Query('limit') limit?: string) {
    return this.dashboard.activity(limit ? Number(limit) : 50)
  }
}
