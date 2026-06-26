import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { eq, asc, desc } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { tickets, ticketComments, type DbTicket } from '../database/schema/tickets'
import { accounts } from '../database/schema/accounts'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import {
  createTicketSchema,
  updateTicketSchema,
  addTicketCommentSchema,
  type CreateTicketDto,
  type UpdateTicketDto,
  type AddTicketCommentDto,
} from './crm.dto'
import type { Ticket, SessionUser } from '@gitsols/types'

@Injectable()
export class TicketsService {
  constructor(private readonly db: DatabaseService) {}

  private serialize(row: DbTicket, accountName: string | null): Ticket {
    return {
      id: row.id,
      accountId: opt(row.accountId),
      accountName: opt(accountName),
      subject: row.subject,
      description: opt(row.description),
      priority: row.priority,
      status: row.status,
      assignee: opt(row.assignee),
      category: row.category,
      openedAt: row.openedAt,
      slaTarget: opt(row.slaTarget),
      resolvedAt: opt(row.resolvedAt),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<Ticket[]> {
    const rows = await this.db.db
      .select({ t: tickets, accountName: accounts.name })
      .from(tickets)
      .leftJoin(accounts, eq(tickets.accountId, accounts.id))
      .orderBy(desc(tickets.openedAt))
    return rows.map((r) => this.serialize(r.t, r.accountName))
  }

  async get(id: string): Promise<Ticket> {
    const [row] = await this.db.db
      .select({ t: tickets, accountName: accounts.name })
      .from(tickets)
      .leftJoin(accounts, eq(tickets.accountId, accounts.id))
      .where(eq(tickets.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Ticket not found')
    const comments = await this.db.db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, id))
      .orderBy(asc(ticketComments.createdAt))
    return {
      ...this.serialize(row.t, row.accountName),
      comments: comments.map((c) => ({
        id: c.id,
        author: c.author,
        body: c.body,
        createdAt: c.createdAt,
      })),
    }
  }

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const [row] = await this.db.db.insert(tickets).values(dto).returning()
    return this.get(row.id)
  }

  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    const patch: Record<string, unknown> = { ...dto, updatedAt: new Date().toISOString() }
    if (dto.status === 'resolved') patch.resolvedAt = new Date().toISOString()
    const [row] = await this.db.db
      .update(tickets)
      .set(patch)
      .where(eq(tickets.id, id))
      .returning()
    if (!row) throw new NotFoundException('Ticket not found')
    return this.get(id)
  }

  async addComment(id: string, dto: AddTicketCommentDto, author: string): Promise<Ticket> {
    const [exists] = await this.db.db
      .select({ id: tickets.id })
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1)
    if (!exists) throw new NotFoundException('Ticket not found')
    await this.db.db.insert(ticketComments).values({ ticketId: id, body: dto.body, author })
    return this.get(id)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db
      .delete(tickets)
      .where(eq(tickets.id, id))
      .returning({ id: tickets.id })
    if (res.length === 0) throw new NotFoundException('Ticket not found')
  }
}

@ApiTags('tickets')
@Roles(...INTERNAL_ONLY)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly tickets: TicketsService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.tickets.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.tickets.get(id)
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createTicketSchema))
  async create(@Body() body: CreateTicketDto, @CurrentUser() user: SessionUser) {
    const ticket = await this.tickets.create(body)
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'ticket',
      entityId: ticket.id,
      accountId: ticket.accountId,
    })
    return ticket
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateTicketSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTicketDto,
    @CurrentUser() user: SessionUser,
  ) {
    const ticket = await this.tickets.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'ticket', entityId: id })
    return ticket
  }

  @Post(':id/comments')
  @UsePipes(new ZodValidationPipe(addTicketCommentSchema))
  addComment(
    @Param('id') id: string,
    @Body() body: AddTicketCommentDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.tickets.addComment(id, body, user?.name ?? 'Staff')
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin', 'pm', 'tech')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.tickets.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'ticket', entityId: id })
  }
}
