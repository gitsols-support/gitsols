// Admin-facing lead endpoints. The public capture endpoint (POST /leads)
// lives in ../leads; this adds the staff list / triage / convert surface on
// the same route prefix (different HTTP verbs, so no collision).

import {
  Body,
  Controller,
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
import { eq, desc } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { leads, type DbLead } from '../database/schema/leads'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { OpportunitiesService } from './opportunities'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import { updateLeadSchema, type UpdateLeadDto } from './crm.dto'
import type {
  AdminLead,
  AdminLeadStatus,
  AdminLeadSource,
  ConvertLeadResponse,
  Industry,
  Opportunity,
  SessionUser,
} from '@gitsols/types'

const toIso = (v: unknown): string =>
  v instanceof Date ? v.toISOString() : String(v ?? new Date().toISOString())

@Injectable()
export class LeadsAdminService {
  constructor(
    private readonly db: DatabaseService,
    private readonly opps: OpportunitiesService,
  ) {}

  private serialize(row: DbLead): AdminLead {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: opt(row.phone),
      company: opt(row.company),
      industry: opt(row.industry) as Industry | undefined,
      serviceInterest: opt(row.serviceInterest),
      source: row.source as AdminLeadSource,
      message: opt(row.message),
      status: row.status as AdminLeadStatus,
      owner: opt(row.owner),
      score: row.score,
      receivedAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
    }
  }

  async list(): Promise<AdminLead[]> {
    const rows = await this.db.db.select().from(leads).orderBy(desc(leads.createdAt))
    return rows.map((r) => this.serialize(r))
  }

  async get(id: string): Promise<AdminLead> {
    const [row] = await this.db.db.select().from(leads).where(eq(leads.id, id)).limit(1)
    if (!row) throw new NotFoundException('Lead not found')
    return this.serialize(row)
  }

  async update(id: string, dto: UpdateLeadDto): Promise<AdminLead> {
    const [row] = await this.db.db
      .update(leads)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning()
    if (!row) throw new NotFoundException('Lead not found')
    return this.serialize(row)
  }

  async convert(id: string, actor: string): Promise<ConvertLeadResponse> {
    const [row] = await this.db.db.select().from(leads).where(eq(leads.id, id)).limit(1)
    if (!row) throw new NotFoundException('Lead not found')

    const allowed: Opportunity['source'][] = [
      'contact_form',
      'free_it_audit',
      'service_inquiry',
      'phone',
      'referral',
    ]
    const source = (allowed as string[]).includes(row.source)
      ? (row.source as Opportunity['source'])
      : 'service_inquiry'

    const opp = await this.opps.create(
      {
        name: `${row.company ?? row.name} · ${row.serviceInterest ?? 'new opportunity'}`,
        prospectName: row.company ?? row.name,
        industry: (row.industry as Industry) ?? undefined,
        source,
        servicesInScope: row.serviceInterest ? [row.serviceInterest] : [],
        primaryContact: row.name,
        primaryEmail: row.email,
        owner: row.owner ?? actor,
      },
      actor,
    )

    await this.db.db
      .update(leads)
      .set({ status: 'converted', updatedAt: new Date() })
      .where(eq(leads.id, id))

    return { opportunityId: opp.id }
  }
}

@ApiTags('leads-admin')
@Roles(...INTERNAL_ONLY)
@Controller('leads')
export class LeadsAdminController {
  constructor(
    private readonly leadsAdmin: LeadsAdminService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.leadsAdmin.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.leadsAdmin.get(id)
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateLeadSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateLeadDto,
    @CurrentUser() user: SessionUser,
  ) {
    const lead = await this.leadsAdmin.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'lead', entityId: id })
    return lead
  }

  @Post(':id/convert')
  @HttpCode(201)
  async convert(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    const res = await this.leadsAdmin.convert(id, user?.name ?? 'Staff')
    void writeAudit(this.db, user, {
      action: 'convert',
      entity: 'lead',
      entityId: id,
      payload: { opportunityId: res.opportunityId },
    })
    return res
  }
}
