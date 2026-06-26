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
import { eq } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { contacts, type DbContact } from '../database/schema/contacts'
import { accounts } from '../database/schema/accounts'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import {
  createContactSchema,
  updateContactSchema,
  type CreateContactDto,
  type UpdateContactDto,
} from './crm.dto'
import type { Contact, SessionUser } from '@gitsols/types'

@Injectable()
export class ContactsService {
  constructor(private readonly db: DatabaseService) {}

  private serialize(row: DbContact, accountName?: string | null): Contact {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: opt(row.phone),
      title: opt(row.title),
      accountId: opt(row.accountId),
      accountName: opt(accountName),
      isPrimary: row.isPrimary,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<Contact[]> {
    const rows = await this.db.db
      .select({ c: contacts, accountName: accounts.name })
      .from(contacts)
      .leftJoin(accounts, eq(contacts.accountId, accounts.id))
      .orderBy(contacts.name)
    return rows.map((r) => this.serialize(r.c, r.accountName))
  }

  async get(id: string): Promise<Contact> {
    const [row] = await this.db.db
      .select({ c: contacts, accountName: accounts.name })
      .from(contacts)
      .leftJoin(accounts, eq(contacts.accountId, accounts.id))
      .where(eq(contacts.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Contact not found')
    return this.serialize(row.c, row.accountName)
  }

  async create(dto: CreateContactDto): Promise<Contact> {
    const [row] = await this.db.db.insert(contacts).values(dto).returning()
    return this.serialize(row)
  }

  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    const [row] = await this.db.db
      .update(contacts)
      .set({ ...dto, updatedAt: new Date().toISOString() })
      .where(eq(contacts.id, id))
      .returning()
    if (!row) throw new NotFoundException('Contact not found')
    return this.serialize(row)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning({ id: contacts.id })
    if (res.length === 0) throw new NotFoundException('Contact not found')
  }
}

@ApiTags('contacts')
@Roles(...INTERNAL_ONLY)
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contacts: ContactsService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.contacts.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.contacts.get(id)
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createContactSchema))
  async create(@Body() body: CreateContactDto, @CurrentUser() user: SessionUser) {
    const contact = await this.contacts.create(body)
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'contact',
      entityId: contact.id,
      accountId: contact.accountId,
    })
    return contact
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateContactSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateContactDto,
    @CurrentUser() user: SessionUser,
  ) {
    const contact = await this.contacts.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'contact', entityId: id })
    return contact
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.contacts.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'contact', entityId: id })
  }
}
