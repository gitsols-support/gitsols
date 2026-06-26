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
import { eq, desc, asc } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import {
  opportunities,
  opportunityLineItems,
  opportunityAttachments,
  opportunityActivities,
  type DbOpportunity,
} from '../database/schema/opportunities'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  addOpportunityActivitySchema,
  type CreateOpportunityDto,
  type UpdateOpportunityDto,
  type AddOpportunityActivityDto,
} from './crm.dto'
import type { Opportunity, Industry, SessionUser } from '@gitsols/types'

@Injectable()
export class OpportunitiesService {
  constructor(private readonly db: DatabaseService) {}

  private base(row: DbOpportunity): Omit<Opportunity, 'lineItems' | 'attachments' | 'activity'> {
    return {
      id: row.id,
      name: row.name,
      accountId: opt(row.accountId),
      prospectName: row.prospectName,
      industry: opt(row.industry) as Industry | undefined,
      type: row.type,
      stage: row.stage,
      value: row.value,
      probability: row.probability,
      expectedClose: opt(row.expectedClose),
      owner: row.owner,
      source: row.source as Opportunity['source'],
      servicesInScope: row.servicesInScope ?? [],
      primaryContact: opt(row.primaryContact),
      primaryEmail: opt(row.primaryEmail),
      lostReason: opt(row.lostReason) as Opportunity['lostReason'],
      lostNote: opt(row.lostNote),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<Opportunity[]> {
    const rows = await this.db.db.select().from(opportunities).orderBy(desc(opportunities.createdAt))
    return rows.map((r) => ({ ...this.base(r), lineItems: [], attachments: [], activity: [] }))
  }

  async get(id: string): Promise<Opportunity> {
    const [row] = await this.db.db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Opportunity not found')

    const [items, atts, acts] = await Promise.all([
      this.db.db
        .select()
        .from(opportunityLineItems)
        .where(eq(opportunityLineItems.opportunityId, id)),
      this.db.db
        .select()
        .from(opportunityAttachments)
        .where(eq(opportunityAttachments.opportunityId, id)),
      this.db.db
        .select()
        .from(opportunityActivities)
        .where(eq(opportunityActivities.opportunityId, id))
        .orderBy(asc(opportunityActivities.ts)),
    ])

    return {
      ...this.base(row),
      lineItems: items.map((i) => ({
        id: i.id,
        service: i.service,
        qty: i.qty,
        rate: i.rate,
        recurring: i.recurring,
      })),
      attachments: atts.map((a) => ({
        id: a.id,
        kind: a.kind as Opportunity['attachments'][number]['kind'],
        name: a.name,
        url: opt(a.url),
        addedAt: a.addedAt,
        addedBy: a.addedBy,
      })),
      activity: acts.map((a) => ({
        id: a.id,
        ts: a.ts,
        kind: a.kind as Opportunity['activity'][number]['kind'],
        actor: a.actor,
        text: a.text,
      })),
    }
  }

  async create(dto: CreateOpportunityDto, actor: string): Promise<Opportunity> {
    const [row] = await this.db.db
      .insert(opportunities)
      .values({
        name: dto.name,
        accountId: dto.accountId,
        prospectName: dto.prospectName,
        industry: dto.industry,
        type: dto.type,
        stage: dto.stage,
        value: dto.value,
        probability: dto.probability,
        expectedClose: dto.expectedClose,
        owner: dto.owner,
        source: dto.source,
        servicesInScope: dto.servicesInScope,
        primaryContact: dto.primaryContact,
        primaryEmail: dto.primaryEmail,
      })
      .returning()

    if (dto.lineItems?.length) {
      await this.db.db
        .insert(opportunityLineItems)
        .values(dto.lineItems.map((li) => ({ ...li, opportunityId: row.id })))
    }
    await this.db.db.insert(opportunityActivities).values({
      opportunityId: row.id,
      kind: 'stage',
      actor,
      text: 'Opportunity opened.',
    })
    return this.get(row.id)
  }

  async update(id: string, dto: UpdateOpportunityDto, actor: string): Promise<Opportunity> {
    const [existing] = await this.db.db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1)
    if (!existing) throw new NotFoundException('Opportunity not found')

    const { lineItems, ...fields } = dto
    const [row] = await this.db.db
      .update(opportunities)
      .set({ ...fields, updatedAt: new Date().toISOString() })
      .where(eq(opportunities.id, id))
      .returning()

    if (dto.stage && dto.stage !== existing.stage) {
      await this.db.db.insert(opportunityActivities).values({
        opportunityId: id,
        kind: 'stage',
        actor,
        text: `Stage advanced: ${existing.stage} → ${dto.stage}.`,
      })
    }
    if (lineItems) {
      await this.db.db
        .delete(opportunityLineItems)
        .where(eq(opportunityLineItems.opportunityId, id))
      if (lineItems.length) {
        await this.db.db
          .insert(opportunityLineItems)
          .values(lineItems.map((li) => ({ ...li, opportunityId: id })))
      }
    }
    void row
    return this.get(id)
  }

  async addActivity(id: string, dto: AddOpportunityActivityDto, actor: string): Promise<Opportunity> {
    const [exists] = await this.db.db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1)
    if (!exists) throw new NotFoundException('Opportunity not found')
    await this.db.db
      .insert(opportunityActivities)
      .values({ opportunityId: id, kind: dto.kind, actor, text: dto.text })
    return this.get(id)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db
      .delete(opportunities)
      .where(eq(opportunities.id, id))
      .returning({ id: opportunities.id })
    if (res.length === 0) throw new NotFoundException('Opportunity not found')
  }
}

@ApiTags('opportunities')
@Roles(...INTERNAL_ONLY)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opps: OpportunitiesService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.opps.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.opps.get(id)
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createOpportunitySchema))
  async create(@Body() body: CreateOpportunityDto, @CurrentUser() user: SessionUser) {
    const opp = await this.opps.create(body, user?.name ?? 'Staff')
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'opportunity',
      entityId: opp.id,
      accountId: opp.accountId,
    })
    return opp
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateOpportunitySchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOpportunityDto,
    @CurrentUser() user: SessionUser,
  ) {
    const opp = await this.opps.update(id, body, user?.name ?? 'Staff')
    void writeAudit(this.db, user, {
      action: body.stage ? 'stage' : 'update',
      entity: 'opportunity',
      entityId: id,
      payload: body,
    })
    return opp
  }

  @Post(':id/activity')
  @UsePipes(new ZodValidationPipe(addOpportunityActivitySchema))
  async addActivity(
    @Param('id') id: string,
    @Body() body: AddOpportunityActivityDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.opps.addActivity(id, body, user?.name ?? 'Staff')
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin', 'sales')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.opps.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'opportunity', entityId: id })
  }
}
