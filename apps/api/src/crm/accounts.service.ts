import { Injectable, NotFoundException } from '@nestjs/common'
import { eq, sql, inArray, and, ne } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { accounts, type DbAccount } from '../database/schema/accounts'
import { engagements } from '../database/schema/engagements'
import { tickets } from '../database/schema/tickets'
import { contacts } from '../database/schema/contacts'
import { opt, slugify, randomSuffix } from './crm.util'
import type { CreateAccountDto, UpdateAccountDto } from './crm.dto'
import type { CrmAccount, Contact, Industry } from '@gitsols/types'

@Injectable()
export class AccountsService {
  constructor(private readonly db: DatabaseService) {}

  private serialize(row: DbAccount, counts?: { engagements: number; tickets: number }): CrmAccount {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      industry: opt(row.industry) as Industry | undefined,
      tier: row.tier,
      primaryContact: opt(row.primaryContact),
      primaryEmail: opt(row.primaryEmail),
      mrr: row.mrr,
      seats: row.seats,
      status: row.status,
      health: row.health,
      since: opt(row.since),
      nextRenewal: opt(row.nextRenewal),
      activeEngagements: counts?.engagements ?? 0,
      openTickets: counts?.tickets ?? 0,
      servicesUsed: row.servicesUsed ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<CrmAccount[]> {
    const rows = await this.db.db.select().from(accounts).orderBy(accounts.name)
    if (rows.length === 0) return []
    const ids = rows.map((r) => r.id)

    const engCounts = await this.db.db
      .select({ accountId: engagements.accountId, n: sql<number>`count(*)::int` })
      .from(engagements)
      .where(and(inArray(engagements.accountId, ids), ne(engagements.status, 'closed')))
      .groupBy(engagements.accountId)

    const tixCounts = await this.db.db
      .select({ accountId: tickets.accountId, n: sql<number>`count(*)::int` })
      .from(tickets)
      .where(and(inArray(tickets.accountId, ids), ne(tickets.status, 'resolved')))
      .groupBy(tickets.accountId)

    const eMap = new Map(engCounts.map((c) => [c.accountId, c.n]))
    const tMap = new Map(tixCounts.map((c) => [c.accountId, c.n]))

    return rows.map((r) =>
      this.serialize(r, { engagements: eMap.get(r.id) ?? 0, tickets: tMap.get(r.id) ?? 0 }),
    )
  }

  async get(id: string): Promise<CrmAccount> {
    const [row] = await this.db.db.select().from(accounts).where(eq(accounts.id, id)).limit(1)
    if (!row) throw new NotFoundException('Account not found')
    const [eng] = await this.db.db
      .select({ n: sql<number>`count(*)::int` })
      .from(engagements)
      .where(and(eq(engagements.accountId, id), ne(engagements.status, 'closed')))
    const [tix] = await this.db.db
      .select({ n: sql<number>`count(*)::int` })
      .from(tickets)
      .where(and(eq(tickets.accountId, id), ne(tickets.status, 'resolved')))
    return this.serialize(row, { engagements: eng?.n ?? 0, tickets: tix?.n ?? 0 })
  }

  async contacts(id: string): Promise<Contact[]> {
    const rows = await this.db.db.select().from(contacts).where(eq(contacts.accountId, id))
    const [acct] = await this.db.db
      .select({ name: accounts.name })
      .from(accounts)
      .where(eq(accounts.id, id))
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: opt(r.phone),
      title: opt(r.title),
      accountId: opt(r.accountId),
      accountName: acct?.name,
      isPrimary: r.isPrimary,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  }

  async create(dto: CreateAccountDto): Promise<CrmAccount> {
    const slug = `${slugify(dto.name)}-${randomSuffix()}`
    const [row] = await this.db.db
      .insert(accounts)
      .values({
        name: dto.name,
        slug,
        industry: dto.industry,
        tier: dto.tier,
        status: dto.status,
        health: dto.health,
        primaryContact: dto.primaryContact,
        primaryEmail: dto.primaryEmail,
        mrr: dto.mrr,
        seats: dto.seats,
        since: dto.since,
        nextRenewal: dto.nextRenewal,
        servicesUsed: dto.servicesUsed,
      })
      .returning()
    return this.serialize(row)
  }

  async update(id: string, dto: UpdateAccountDto): Promise<CrmAccount> {
    const [row] = await this.db.db
      .update(accounts)
      .set({ ...dto, updatedAt: new Date().toISOString() })
      .where(eq(accounts.id, id))
      .returning()
    if (!row) throw new NotFoundException('Account not found')
    return this.serialize(row)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db.delete(accounts).where(eq(accounts.id, id)).returning({ id: accounts.id })
    if (res.length === 0) throw new NotFoundException('Account not found')
  }
}
