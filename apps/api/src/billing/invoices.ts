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
  invoices,
  invoiceLineItems,
  proposals,
  type DbInvoice,
  type DbInvoiceLineItem,
} from '../database/schema/billing'
import { accounts } from '../database/schema/accounts'
import { engagements } from '../database/schema/engagements'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from '../crm/crm.audit'
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  type CreateInvoiceDto,
  type UpdateInvoiceDto,
} from '../crm/crm.dto'
import type { Invoice, SessionUser } from '@gitsols/types'
import { computeTotals, normalizeItems, serializeLineItem, formatDocNumber } from './billing.helpers'
import { renderInvoicePdf } from './billing-pdf'
import { ProposalsService } from './proposals'

@Injectable()
export class InvoicesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly proposalsService: ProposalsService,
  ) {}

  private serialize(
    row: DbInvoice,
    accountName: string | null,
    engagementName: string | null,
    proposalNumber: string | null,
    items: DbInvoiceLineItem[],
  ): Invoice {
    return {
      id: row.id,
      number: row.number,
      title: row.title,
      accountId: row.accountId ?? undefined,
      accountName: accountName ?? undefined,
      engagementId: row.engagementId ?? undefined,
      engagementName: engagementName ?? undefined,
      proposalId: row.proposalId ?? undefined,
      proposalNumber: proposalNumber ?? undefined,
      clientName: row.clientName,
      clientEmail: row.clientEmail ?? undefined,
      status: row.status,
      issueDate: row.issueDate ?? undefined,
      dueDate: row.dueDate ?? undefined,
      currency: row.currency,
      notes: row.notes ?? undefined,
      terms: row.terms ?? undefined,
      taxRate: row.taxRate,
      discount: row.discount,
      subtotal: row.subtotal,
      taxAmount: row.taxAmount,
      total: row.total,
      amountPaid: row.amountPaid,
      balanceDue: row.total - row.amountPaid,
      owner: row.owner,
      lineItems: items.sort((a, b) => a.sortOrder - b.sortOrder).map(serializeLineItem),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<Invoice[]> {
    const rows = await this.db.db
      .select({
        i: invoices,
        accountName: accounts.name,
        engagementName: engagements.name,
        proposalNumber: proposals.number,
      })
      .from(invoices)
      .leftJoin(accounts, eq(invoices.accountId, accounts.id))
      .leftJoin(engagements, eq(invoices.engagementId, engagements.id))
      .leftJoin(proposals, eq(invoices.proposalId, proposals.id))
      .orderBy(desc(invoices.createdAt))
    if (rows.length === 0) return []
    const items = await this.db.db.select().from(invoiceLineItems)
    const byParent = new Map<string, DbInvoiceLineItem[]>()
    for (const it of items) {
      const arr = byParent.get(it.invoiceId) ?? []
      arr.push(it)
      byParent.set(it.invoiceId, arr)
    }
    return rows.map((r) =>
      this.serialize(r.i, r.accountName, r.engagementName, r.proposalNumber, byParent.get(r.i.id) ?? []),
    )
  }

  async get(id: string): Promise<Invoice> {
    const [row] = await this.db.db
      .select({
        i: invoices,
        accountName: accounts.name,
        engagementName: engagements.name,
        proposalNumber: proposals.number,
      })
      .from(invoices)
      .leftJoin(accounts, eq(invoices.accountId, accounts.id))
      .leftJoin(engagements, eq(invoices.engagementId, engagements.id))
      .leftJoin(proposals, eq(invoices.proposalId, proposals.id))
      .where(eq(invoices.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Invoice not found')
    const items = await this.db.db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id))
    return this.serialize(row.i, row.accountName, row.engagementName, row.proposalNumber, items)
  }

  private async nextNumber(): Promise<string> {
    const [{ count }] = await this.db.db.select({ count: sql<number>`count(*)::int` }).from(invoices)
    return formatDocNumber('INV', Number(count) + 1)
  }

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const items = normalizeItems(dto.lineItems)
    const taxRate = dto.taxRate ?? 0
    const discount = dto.discount ?? 0
    const totals = computeTotals(items, taxRate, discount)
    const number = await this.nextNumber()

    const [row] = await this.db.db
      .insert(invoices)
      .values({
        number,
        title: dto.title ?? '',
        accountId: dto.accountId ?? null,
        engagementId: dto.engagementId ?? null,
        proposalId: dto.proposalId ?? null,
        clientName: dto.clientName ?? '',
        clientEmail: dto.clientEmail ?? null,
        status: dto.status ?? 'draft',
        issueDate: dto.issueDate ?? new Date().toISOString().slice(0, 10),
        dueDate: dto.dueDate ?? null,
        currency: dto.currency ?? 'USD',
        notes: dto.notes ?? null,
        terms: dto.terms ?? null,
        taxRate,
        discount,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        amountPaid: dto.amountPaid ?? 0,
        owner: dto.owner ?? 'Unassigned',
      })
      .returning()
    if (items.length) {
      await this.db.db.insert(invoiceLineItems).values(items.map((it) => ({ ...it, invoiceId: row.id })))
    }
    return this.get(row.id)
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const existing = await this.get(id)
    const taxRate = dto.taxRate ?? existing.taxRate
    const discount = dto.discount ?? existing.discount

    let totals = { subtotal: existing.subtotal, taxAmount: existing.taxAmount, total: existing.total }
    if (dto.lineItems) {
      const items = normalizeItems(dto.lineItems)
      totals = computeTotals(items, taxRate, discount)
      await this.db.db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id))
      if (items.length) {
        await this.db.db.insert(invoiceLineItems).values(items.map((it) => ({ ...it, invoiceId: id })))
      }
    } else if (dto.taxRate !== undefined || dto.discount !== undefined) {
      totals = computeTotals(
        existing.lineItems.map((li) => ({ qty: li.qty, unitPrice: li.unitPrice })),
        taxRate,
        discount,
      )
    }

    const [row] = await this.db.db
      .update(invoices)
      .set({
        title: dto.title ?? existing.title,
        accountId: dto.accountId ?? existing.accountId ?? null,
        engagementId: dto.engagementId ?? existing.engagementId ?? null,
        clientName: dto.clientName ?? existing.clientName,
        clientEmail: dto.clientEmail ?? existing.clientEmail ?? null,
        status: dto.status ?? existing.status,
        issueDate: dto.issueDate ?? existing.issueDate ?? null,
        dueDate: dto.dueDate ?? existing.dueDate ?? null,
        currency: dto.currency ?? existing.currency,
        notes: dto.notes ?? existing.notes ?? null,
        terms: dto.terms ?? existing.terms ?? null,
        taxRate,
        discount,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        amountPaid: dto.amountPaid ?? existing.amountPaid,
        owner: dto.owner ?? existing.owner,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(invoices.id, id))
      .returning()
    if (!row) throw new NotFoundException('Invoice not found')
    return this.get(id)
  }

  /** Create an invoice from an accepted proposal, copying line items, and mark
   *  the proposal converted. */
  async fromProposal(proposalId: string): Promise<Invoice> {
    const proposal = await this.proposalsService.get(proposalId)
    const invoice = await this.create({
      title: proposal.title,
      accountId: proposal.accountId,
      engagementId: proposal.engagementId,
      proposalId: proposal.id,
      clientName: proposal.clientName,
      clientEmail: proposal.clientEmail,
      status: 'draft',
      currency: proposal.currency,
      notes: proposal.notes,
      terms: proposal.terms,
      taxRate: proposal.taxRate,
      discount: proposal.discount,
      owner: proposal.owner,
      lineItems: proposal.lineItems.map((li) => ({
        serviceSlug: li.serviceSlug,
        description: li.description,
        qty: li.qty,
        unitPrice: li.unitPrice,
        unit: li.unit,
        recurring: li.recurring,
      })),
    })
    await this.proposalsService.update(proposalId, { status: 'converted' })
    return invoice
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db.delete(invoices).where(eq(invoices.id, id)).returning({ id: invoices.id })
    if (res.length === 0) throw new NotFoundException('Invoice not found')
  }

  async pdf(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await this.get(id)
    return { buffer: renderInvoicePdf(invoice), filename: `${invoice.number}.pdf` }
  }
}

@ApiTags('invoices')
@Roles(...INTERNAL_ONLY)
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoices: InvoicesService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.invoices.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.invoices.get(id)
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async download(@Param('id') id: string, @CurrentUser() user: SessionUser): Promise<StreamableFile> {
    const { buffer, filename } = await this.invoices.pdf(id)
    void writeAudit(this.db, user, { action: 'export', entity: 'invoice', entityId: id })
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    })
  }

  @Post()
  @HttpCode(201)
  @Roles('owner', 'admin', 'sales')
  @UsePipes(new ZodValidationPipe(createInvoiceSchema))
  async create(@Body() body: CreateInvoiceDto, @CurrentUser() user: SessionUser) {
    const invoice = await this.invoices.create(body)
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'invoice',
      entityId: invoice.id,
      accountId: invoice.accountId,
    })
    return invoice
  }

  @Post('from-proposal/:proposalId')
  @HttpCode(201)
  @Roles('owner', 'admin', 'sales')
  async convert(@Param('proposalId') proposalId: string, @CurrentUser() user: SessionUser) {
    const invoice = await this.invoices.fromProposal(proposalId)
    void writeAudit(this.db, user, {
      action: 'convert',
      entity: 'invoice',
      entityId: invoice.id,
      payload: { fromProposal: proposalId },
    })
    return invoice
  }

  @Patch(':id')
  @Roles('owner', 'admin', 'sales')
  @UsePipes(new ZodValidationPipe(updateInvoiceSchema))
  async update(@Param('id') id: string, @Body() body: UpdateInvoiceDto, @CurrentUser() user: SessionUser) {
    const invoice = await this.invoices.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'invoice', entityId: id })
    return invoice
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.invoices.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'invoice', entityId: id })
  }
}
