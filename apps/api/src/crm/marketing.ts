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
import {
  marketingEngagements,
  marketingDeliverables,
  type DbMarketingEngagement,
  type DbMarketingDeliverable,
} from '../database/schema/marketing'
import { accounts } from '../database/schema/accounts'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import {
  createMarketingSchema,
  updateMarketingSchema,
  createDeliverableSchema,
  updateDeliverableSchema,
  type CreateMarketingDto,
  type UpdateMarketingDto,
  type CreateDeliverableDto,
  type UpdateDeliverableDto,
} from './crm.dto'
import type { MarketingEngagement, MarketingDeliverable, SessionUser } from '@gitsols/types'

@Injectable()
export class MarketingService {
  constructor(private readonly db: DatabaseService) {}

  private serializeDeliverable(d: DbMarketingDeliverable): MarketingDeliverable {
    return {
      id: d.id,
      title: d.title,
      status: d.status,
      dueDate: opt(d.dueDate),
      order: d.order,
    }
  }

  private serialize(
    row: DbMarketingEngagement,
    accountName: string | null,
    deliverables?: DbMarketingDeliverable[],
  ): MarketingEngagement {
    return {
      id: row.id,
      name: row.name,
      accountId: opt(row.accountId),
      accountName: opt(accountName),
      kind: row.kind,
      status: row.status,
      health: row.health,
      monthlyRetainer: row.monthlyRetainer,
      setupFee: row.setupFee,
      owner: opt(row.owner),
      ghlLocationId: opt(row.ghlLocationId),
      startedAt: opt(row.startedAt),
      goLiveTarget: opt(row.goLiveTarget),
      notes: opt(row.notes),
      deliverables: deliverables?.map((d) => this.serializeDeliverable(d)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<MarketingEngagement[]> {
    const rows = await this.db.db
      .select({ m: marketingEngagements, accountName: accounts.name })
      .from(marketingEngagements)
      .leftJoin(accounts, eq(marketingEngagements.accountId, accounts.id))
      .orderBy(desc(marketingEngagements.createdAt))
    return rows.map((r) => this.serialize(r.m, r.accountName))
  }

  async get(id: string): Promise<MarketingEngagement> {
    const [row] = await this.db.db
      .select({ m: marketingEngagements, accountName: accounts.name })
      .from(marketingEngagements)
      .leftJoin(accounts, eq(marketingEngagements.accountId, accounts.id))
      .where(eq(marketingEngagements.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Marketing engagement not found')
    const ds = await this.db.db
      .select()
      .from(marketingDeliverables)
      .where(eq(marketingDeliverables.engagementId, id))
      .orderBy(asc(marketingDeliverables.order))
    return this.serialize(row.m, row.accountName, ds)
  }

  async create(dto: CreateMarketingDto): Promise<MarketingEngagement> {
    const [row] = await this.db.db.insert(marketingEngagements).values(dto).returning()
    return this.get(row.id)
  }

  async update(id: string, dto: UpdateMarketingDto): Promise<MarketingEngagement> {
    const [row] = await this.db.db
      .update(marketingEngagements)
      .set({ ...dto, updatedAt: new Date().toISOString() })
      .where(eq(marketingEngagements.id, id))
      .returning()
    if (!row) throw new NotFoundException('Marketing engagement not found')
    return this.get(id)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db
      .delete(marketingEngagements)
      .where(eq(marketingEngagements.id, id))
      .returning({ id: marketingEngagements.id })
    if (res.length === 0) throw new NotFoundException('Marketing engagement not found')
  }

  async addDeliverable(id: string, dto: CreateDeliverableDto): Promise<MarketingEngagement> {
    await this.db.db.insert(marketingDeliverables).values({ ...dto, engagementId: id })
    return this.get(id)
  }

  async updateDeliverable(
    id: string,
    deliverableId: string,
    dto: UpdateDeliverableDto,
  ): Promise<MarketingEngagement> {
    const [row] = await this.db.db
      .update(marketingDeliverables)
      .set(dto)
      .where(eq(marketingDeliverables.id, deliverableId))
      .returning()
    if (!row) throw new NotFoundException('Deliverable not found')
    return this.get(id)
  }
}

@ApiTags('marketing')
@Roles(...INTERNAL_ONLY)
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly marketing: MarketingService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.marketing.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.marketing.get(id)
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createMarketingSchema))
  async create(@Body() body: CreateMarketingDto, @CurrentUser() user: SessionUser) {
    const eng = await this.marketing.create(body)
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'marketing_engagement',
      entityId: eng.id,
      accountId: eng.accountId,
    })
    return eng
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateMarketingSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateMarketingDto,
    @CurrentUser() user: SessionUser,
  ) {
    const eng = await this.marketing.update(id, body)
    void writeAudit(this.db, user, {
      action: 'update',
      entity: 'marketing_engagement',
      entityId: id,
    })
    return eng
  }

  @Post(':id/deliverables')
  @UsePipes(new ZodValidationPipe(createDeliverableSchema))
  addDeliverable(@Param('id') id: string, @Body() body: CreateDeliverableDto) {
    return this.marketing.addDeliverable(id, body)
  }

  @Patch(':id/deliverables/:deliverableId')
  @UsePipes(new ZodValidationPipe(updateDeliverableSchema))
  updateDeliverable(
    @Param('id') id: string,
    @Param('deliverableId') deliverableId: string,
    @Body() body: UpdateDeliverableDto,
  ) {
    return this.marketing.updateDeliverable(id, deliverableId, body)
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin', 'sales')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.marketing.remove(id)
    void writeAudit(this.db, user, {
      action: 'delete',
      entity: 'marketing_engagement',
      entityId: id,
    })
  }
}
