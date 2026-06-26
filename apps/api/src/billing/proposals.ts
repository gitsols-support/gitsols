import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  StreamableFile,
  UsePipes,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { eq, desc, sql } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import {
  proposals,
  proposalLineItems,
  type DbProposal,
  type DbProposalLineItem,
} from '../database/schema/billing'
import { accounts } from '../database/schema/accounts'
import { engagements } from '../database/schema/engagements'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from '../crm/crm.audit'
import {
  createProposalSchema,
  updateProposalSchema,
  type CreateProposalDto,
  type UpdateProposalDto,
} from '../crm/crm.dto'
import type { Proposal, SessionUser } from '@gitsols/types'
import { computeTotals, normalizeItems, serializeLineItem, formatDocNumber } from './billing.helpers'
import { renderProposalPdf } from './billing-pdf'

@Injectable()
export class ProposalsService {
  constructor(private readonly db: DatabaseService) {}

  private serialize(
    row: DbProposal,
    accountName: string | null,
    engagementName: string | null,
    items: DbProposalLineItem[],
  ): Proposal {
    return {
      id: row.id,
      number: row.number,
      title: row.title,
      accountId: row.accountId ?? undefined,
      accountName: accountName ?? undefined,
      engagementId: row.engagementId ?? undefined,
      engagementName: engagementName ?? undefined,
      clientName: row.clientName,
      clientEmail: row.clientEmail ?? undefined,
      status: row.status,
      issueDate: row.issueDate ?? undefined,
      validUntil: row.validUntil ?? undefined,
      currency: row.currency,
      notes: row.notes ?? undefined,
      terms: row.terms ?? undefined,
      taxRate: row.taxRate,
      discount: row.discount,
      subtotal: row.subtotal,
      taxAmount: row.taxAmount,
      total: row.total,
      owner: row.owner,
      lineItems: items.sort((a, b) => a.sortOrder - b.sortOrder).map(serializeLineItem),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<Proposal[]> {
    const rows = await this.db.db
      .select({ p: proposals, accountName: accounts.name, engagementName: engagements.name })
      .from(proposals)
      .leftJoin(accounts, eq(proposals.accountId, accounts.id))
      .leftJoin(engagements, eq(proposals.engagementId, engagements.id))
      .orderBy(desc(proposals.createdAt))
    if (rows.length === 0) return []
    const items = await this.db.db.select().from(proposalLineItems)
    const byParent = new Map<string, DbProposalLineItem[]>()
    for (const it of items) {
      const arr = byParent.get(it.proposalId) ?? []
      arr.push(it)
      byParent.set(it.proposalId, arr)
    }
    return rows.map((r) => this.serialize(r.p, r.accountName, r.engagementName, byParent.get(r.p.id) ?? []))
  }

  async get(id: string): Promise<Proposal> {
    const [row] = await this.db.db
      .select({ p: proposals, accountName: accounts.name, engagementName: engagements.name })
      .from(proposals)
      .leftJoin(accounts, eq(proposals.accountId, accounts.id))
      .leftJoin(engagements, eq(proposals.engagementId, engagements.id))
      .where(eq(proposals.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Proposal not found')
    const items = await this.db.db
      .select()
      .from(proposalLineItems)
      .where(eq(proposalLineItems.proposalId, id))
    return this.serialize(row.p, row.accountName, row.engagementName, items)
  }

  private async nextNumber(): Promise<string> {
    const [{ count }] = await this.db.db
      .select({ count: sql<number>`count(*)::int` })
      .from(proposals)
    return formatDocNumber('PRO', Number(count) + 1)
  }

  async create(dto: CreateProposalDto): Promise<Proposal> {
    const items = normalizeItems(dto.lineItems)
    const taxRate = dto.taxRate ?? 0
    const discount = dto.discount ?? 0
    const totals = computeTotals(items, taxRate, discount)
    const number = await this.nextNumber()

    const [row] = await this.db.db
      .insert(proposals)
      .values({
        number,
        title: dto.title,
        accountId: dto.accountId ?? null,
        engagementId: dto.engagementId ?? null,
        clientName: dto.clientName ?? '',
        clientEmail: dto.clientEmail ?? null,
        status: dto.status ?? 'draft',
        issueDate: dto.issueDate ?? new Date().toISOString().slice(0, 10),
        validUntil: dto.validUntil ?? null,
        currency: dto.currency ?? 'USD',
        notes: dto.notes ?? null,
        terms: dto.terms ?? null,
        taxRate,
        discount,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        owner: dto.owner ?? 'Unassigned',
      })
      .returning()
    if (items.length) {
      await this.db.db.insert(proposalLineItems).values(items.map((it) => ({ ...it, proposalId: row.id })))
    }
    return this.get(row.id)
  }

  async update(id: string, dto: UpdateProposalDto): Promise<Proposal> {
    const existing = await this.get(id)
    const taxRate = dto.taxRate ?? existing.taxRate
    const discount = dto.discount ?? existing.discount

    // If line items are provided, replace them wholesale and recompute.
    let totals = { subtotal: existing.subtotal, taxAmount: existing.taxAmount, total: existing.total }
    if (dto.lineItems) {
      const items = normalizeItems(dto.lineItems)
      totals = computeTotals(items, taxRate, discount)
      await this.db.db.delete(proposalLineItems).where(eq(proposalLineItems.proposalId, id))
      if (items.length) {
        await this.db.db.insert(proposalLineItems).values(items.map((it) => ({ ...it, proposalId: id })))
      }
    } else if (dto.taxRate !== undefined || dto.discount !== undefined) {
      totals = computeTotals(
        existing.lineItems.map((li) => ({ qty: li.qty, unitPrice: li.unitPrice })),
        taxRate,
        discount,
      )
    }

    const [row] = await this.db.db
      .update(proposals)
      .set({
        title: dto.title ?? existing.title,
        accountId: dto.accountId ?? existing.accountId ?? null,
        engagementId: dto.engagementId ?? existing.engagementId ?? null,
        clientName: dto.clientName ?? existing.clientName,
        clientEmail: dto.clientEmail ?? existing.clientEmail ?? null,
        status: dto.status ?? existing.status,
        issueDate: dto.issueDate ?? existing.issueDate ?? null,
        validUntil: dto.validUntil ?? existing.validUntil ?? null,
        currency: dto.currency ?? existing.currency,
        notes: dto.notes ?? existing.notes ?? null,
        terms: dto.terms ?? existing.terms ?? null,
        taxRate,
        discount,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        owner: dto.owner ?? existing.owner,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(proposals.id, id))
      .returning()
    if (!row) throw new NotFoundException('Proposal not found')
    return this.get(id)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db.delete(proposals).where(eq(proposals.id, id)).returning({ id: proposals.id })
    if (res.length === 0) throw new NotFoundException('Proposal not found')
  }

  async pdf(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const proposal = await this.get(id)
    return { buffer: renderProposalPdf(proposal), filename: `${proposal.number}.pdf` }
  }
}

@ApiTags('proposals')
@Roles(...INTERNAL_ONLY)
@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly proposals: ProposalsService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.proposals.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.proposals.get(id)
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async download(@Param('id') id: string, @CurrentUser() user: SessionUser): Promise<StreamableFile> {
    const { buffer, filename } = await this.proposals.pdf(id)
    void writeAudit(this.db, user, { action: 'export', entity: 'proposal', entityId: id })
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    })
  }

  @Post()
  @HttpCode(201)
  @Roles('owner', 'admin', 'sales')
  @UsePipes(new ZodValidationPipe(createProposalSchema))
  async create(@Body() body: CreateProposalDto, @CurrentUser() user: SessionUser) {
    const proposal = await this.proposals.create(body)
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'proposal',
      entityId: proposal.id,
      accountId: proposal.accountId,
    })
    return proposal
  }

  @Patch(':id')
  @Roles('owner', 'admin', 'sales')
  @UsePipes(new ZodValidationPipe(updateProposalSchema))
  async update(@Param('id') id: string, @Body() body: UpdateProposalDto, @CurrentUser() user: SessionUser) {
    const proposal = await this.proposals.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'proposal', entityId: id })
    return proposal
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.proposals.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'proposal', entityId: id })
  }
}
