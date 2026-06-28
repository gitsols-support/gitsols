// Client portal API — every endpoint is scoped to the signed-in user's
// accountId (from the JWT). Client roles only. Reuses the admin domain
// services and filters their results to the caller's account, so a client can
// never see another tenant's data.

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  Injectable,
  Param,
  Post,
  StreamableFile,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'
import { DatabaseService } from '../database/database.service'
import { accounts } from '../database/schema/accounts'
import { nocEndpoints, nocAlerts, type DbNocEndpoint, type DbNocAlert } from '../database/schema/noc'
import { tickets } from '../database/schema/tickets'
import { Roles, CLIENT_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { EngagementsService } from '../crm/engagements'
import { TicketsService } from '../crm/tickets'
import { DocumentsService } from '../crm/documents'
import { ProposalsService } from '../billing/proposals'
import { InvoicesService } from '../billing/invoices'
import { renderInvoicePdf } from '../billing/billing-pdf'
import { renderProposalPdf } from '../billing/billing-pdf'
import type {
  SessionUser,
  PortalOverview,
  PortalNocSummary,
  NocEndpointSummary,
  NocAlertSummary,
} from '@gitsols/types'

const createPortalTicketSchema = z
  .object({
    subject: z.string().trim().min(1).max(200),
    description: z.string().trim().max(4000).optional(),
    priority: z.enum(['p1', 'p2', 'p3', 'p4']).optional(),
    category: z.string().trim().max(40).optional(),
  })
  .strict()
type CreatePortalTicketDto = z.infer<typeof createPortalTicketSchema>

function requireAccount(user: SessionUser | undefined): string {
  if (!user) throw new UnauthorizedException()
  if (!user.accountId) throw new ForbiddenException('No account associated with this user')
  return user.accountId
}

@Injectable()
export class PortalService {
  constructor(
    private readonly db: DatabaseService,
    private readonly engagements: EngagementsService,
    private readonly tickets: TicketsService,
    private readonly documents: DocumentsService,
    private readonly proposals: ProposalsService,
    private readonly invoices: InvoicesService,
  ) {}

  async engagementsFor(accountId: string) {
    return (await this.engagements.list()).filter((e) => e.accountId === accountId)
  }
  async ticketsFor(accountId: string) {
    return (await this.tickets.list()).filter((t) => t.accountId === accountId)
  }
  async documentsFor(accountId: string) {
    return (await this.documents.list()).filter((d) => d.accountId === accountId)
  }
  async invoicesFor(accountId: string) {
    return (await this.invoices.list()).filter((i) => i.accountId === accountId)
  }
  async proposalsFor(accountId: string) {
    return (await this.proposals.list()).filter((p) => p.accountId === accountId)
  }
  invoiceById(id: string) {
    return this.invoices.get(id)
  }
  proposalById(id: string) {
    return this.proposals.get(id)
  }

  async overview(accountId: string): Promise<PortalOverview> {
    const [acc] = await this.db.db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
    if (!acc) throw new ForbiddenException('Account not found')
    const engagements = await this.engagementsFor(accountId)
    const ticketList = await this.ticketsFor(accountId)
    const invoiceList = await this.invoicesFor(accountId)
    const openTickets = ticketList.filter((t) => t.status !== 'resolved').length
    const outstanding = invoiceList.filter((i) => i.status !== 'paid' && i.status !== 'void')
    const balanceDue = outstanding.reduce((s, i) => s + i.balanceDue, 0)
    // Soonest upcoming milestone across active engagements.
    let nextMilestone: PortalOverview['nextMilestone']
    for (const e of engagements) {
      if (e.nextMilestone && e.nextMilestoneDue) {
        if (!nextMilestone || e.nextMilestoneDue < (nextMilestone.due ?? '9999')) {
          nextMilestone = { title: e.nextMilestone, due: e.nextMilestoneDue, engagement: e.name }
        }
      }
    }
    return {
      account: { id: acc.id, name: acc.name, industry: acc.industry ?? undefined, since: acc.since ?? undefined },
      engagementsActive: engagements.filter((e) => e.status === 'active').length,
      openTickets,
      invoicesOutstanding: outstanding.length,
      balanceDue,
      nextMilestone,
    }
  }

  async createTicket(accountId: string, dto: CreatePortalTicketDto) {
    const validCategories = ['incident', 'request', 'change', 'project'] as const
    const category = (validCategories as readonly string[]).includes(dto.category ?? '')
      ? (dto.category as (typeof validCategories)[number])
      : 'request'
    const [row] = await this.db.db
      .insert(tickets)
      .values({
        accountId,
        subject: dto.subject,
        description: dto.description ?? null,
        priority: dto.priority ?? 'p3',
        category,
      })
      .returning()
    return this.tickets.get(row.id)
  }

  async noc(accountId: string): Promise<PortalNocSummary> {
    const eps = await this.db.db
      .select()
      .from(nocEndpoints)
      .where(eq(nocEndpoints.clientId, accountId))
      .orderBy(desc(nocEndpoints.lastHeartbeatAt))
    const alerts = await this.db.db
      .select()
      .from(nocAlerts)
      .where(and(eq(nocAlerts.clientId, accountId), eq(nocAlerts.status, 'open')))
      .orderBy(desc(nocAlerts.openedAt))

    const epSummaries: NocEndpointSummary[] = eps.map((e: DbNocEndpoint) => ({
      id: e.id,
      clientId: e.clientId,
      hostname: e.hostname,
      displayName: e.displayName ?? undefined,
      kind: e.kind,
      osFamily: e.osFamily,
      osVersion: e.osVersion ?? undefined,
      status: e.status,
      lastHeartbeatAt: e.lastHeartbeatAt ? new Date(e.lastHeartbeatAt).toISOString() : undefined,
      passCount: 0,
      warnCount: 0,
      failCount: 0,
      agentVersion: e.agentVersion ?? undefined,
      tags: e.tags ?? [],
    }))
    const alertSummaries: NocAlertSummary[] = alerts.map((a: DbNocAlert) => ({
      id: a.id,
      clientId: a.clientId,
      endpointId: a.endpointId,
      endpointHostname: eps.find((e) => e.id === a.endpointId)?.hostname ?? '—',
      checkSlug: a.checkDefinitionId,
      severity: a.severity,
      status: a.status,
      title: a.title,
      summary: a.summary ?? undefined,
      runbookSlug: a.runbookSlug ?? undefined,
      openedAt: a.openedAt ? new Date(a.openedAt).toISOString() : new Date().toISOString(),
    }))
    const count = (s: string) => epSummaries.filter((e) => e.status === s).length
    return {
      rollup: {
        total: epSummaries.length,
        healthy: count('healthy'),
        warning: count('warning'),
        critical: count('critical'),
        offline: count('offline'),
        openAlerts: alertSummaries.length,
        lastHeartbeatAt: epSummaries[0]?.lastHeartbeatAt,
      },
      endpoints: epSummaries,
      alerts: alertSummaries,
    }
  }
}

@ApiTags('portal')
@Roles(...CLIENT_ONLY)
@Controller('portal')
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Get('overview')
  overview(@CurrentUser() user: SessionUser | undefined) {
    return this.portal.overview(requireAccount(user))
  }

  @Get('engagements')
  engagements(@CurrentUser() user: SessionUser | undefined) {
    return this.portal.engagementsFor(requireAccount(user))
  }

  @Get('invoices')
  invoices(@CurrentUser() user: SessionUser | undefined) {
    return this.portal.invoicesFor(requireAccount(user))
  }

  @Get('proposals')
  proposals(@CurrentUser() user: SessionUser | undefined) {
    return this.portal.proposalsFor(requireAccount(user))
  }

  @Get('tickets')
  tickets(@CurrentUser() user: SessionUser | undefined) {
    return this.portal.ticketsFor(requireAccount(user))
  }

  @Post('tickets')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createPortalTicketSchema))
  createTicket(@Body() body: CreatePortalTicketDto, @CurrentUser() user: SessionUser | undefined) {
    return this.portal.createTicket(requireAccount(user), body)
  }

  @Get('documents')
  documents(@CurrentUser() user: SessionUser | undefined) {
    return this.portal.documentsFor(requireAccount(user))
  }

  @Get('noc')
  noc(@CurrentUser() user: SessionUser | undefined) {
    return this.portal.noc(requireAccount(user))
  }

  @Get('invoices/:id/pdf')
  @Header('Content-Type', 'application/pdf')
  async invoicePdf(@Param('id') id: string, @CurrentUser() user: SessionUser | undefined): Promise<StreamableFile> {
    const accountId = requireAccount(user)
    const inv = await this.portal.invoiceById(id)
    if (inv.accountId !== accountId) throw new ForbiddenException()
    return new StreamableFile(renderInvoicePdf(inv), {
      type: 'application/pdf',
      disposition: `attachment; filename="${inv.number}.pdf"`,
    })
  }

  @Get('proposals/:id/pdf')
  @Header('Content-Type', 'application/pdf')
  async proposalPdf(@Param('id') id: string, @CurrentUser() user: SessionUser | undefined): Promise<StreamableFile> {
    const accountId = requireAccount(user)
    const p = await this.portal.proposalById(id)
    if (p.accountId !== accountId) throw new ForbiddenException()
    return new StreamableFile(renderProposalPdf(p), {
      type: 'application/pdf',
      disposition: `attachment; filename="${p.number}.pdf"`,
    })
  }
}
