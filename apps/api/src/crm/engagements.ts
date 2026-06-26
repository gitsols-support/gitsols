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
  engagements,
  milestones,
  type DbEngagement,
  type DbMilestone,
} from '../database/schema/engagements'
import { accounts } from '../database/schema/accounts'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import {
  createEngagementSchema,
  updateEngagementSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  type CreateEngagementDto,
  type UpdateEngagementDto,
  type CreateMilestoneDto,
  type UpdateMilestoneDto,
} from './crm.dto'
import type { Engagement, Milestone, SessionUser } from '@gitsols/types'

@Injectable()
export class EngagementsService {
  constructor(private readonly db: DatabaseService) {}

  private serializeMilestone(m: DbMilestone): Milestone {
    return {
      id: m.id,
      title: m.title,
      description: opt(m.description),
      status: m.status,
      dueDate: opt(m.dueDate),
      order: m.order,
    }
  }

  private serialize(row: DbEngagement, accountName: string | null, ms?: DbMilestone[]): Engagement {
    return {
      id: row.id,
      name: row.name,
      accountId: row.accountId,
      accountName: accountName ?? '—',
      type: row.type,
      status: row.status,
      stage: row.stage,
      health: row.health,
      startedAt: opt(row.startedAt),
      nextMilestone: opt(row.nextMilestone),
      nextMilestoneDue: opt(row.nextMilestoneDue),
      mrrOrValue: row.mrrOrValue,
      serviceSlug: opt(row.serviceSlug),
      milestones: ms?.map((m) => this.serializeMilestone(m)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<Engagement[]> {
    const rows = await this.db.db
      .select({ e: engagements, accountName: accounts.name })
      .from(engagements)
      .leftJoin(accounts, eq(engagements.accountId, accounts.id))
      .orderBy(desc(engagements.createdAt))
    return rows.map((r) => this.serialize(r.e, r.accountName))
  }

  async get(id: string): Promise<Engagement> {
    const [row] = await this.db.db
      .select({ e: engagements, accountName: accounts.name })
      .from(engagements)
      .leftJoin(accounts, eq(engagements.accountId, accounts.id))
      .where(eq(engagements.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Engagement not found')
    const ms = await this.db.db
      .select()
      .from(milestones)
      .where(eq(milestones.engagementId, id))
      .orderBy(asc(milestones.order))
    return this.serialize(row.e, row.accountName, ms)
  }

  async create(dto: CreateEngagementDto): Promise<Engagement> {
    const [row] = await this.db.db.insert(engagements).values(dto).returning()
    return this.get(row.id)
  }

  async update(id: string, dto: UpdateEngagementDto): Promise<Engagement> {
    const [row] = await this.db.db
      .update(engagements)
      .set({ ...dto, updatedAt: new Date().toISOString() })
      .where(eq(engagements.id, id))
      .returning()
    if (!row) throw new NotFoundException('Engagement not found')
    return this.get(id)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db
      .delete(engagements)
      .where(eq(engagements.id, id))
      .returning({ id: engagements.id })
    if (res.length === 0) throw new NotFoundException('Engagement not found')
  }

  async addMilestone(id: string, dto: CreateMilestoneDto): Promise<Engagement> {
    await this.db.db.insert(milestones).values({ ...dto, engagementId: id })
    return this.get(id)
  }

  async updateMilestone(
    id: string,
    milestoneId: string,
    dto: UpdateMilestoneDto,
  ): Promise<Engagement> {
    const [row] = await this.db.db
      .update(milestones)
      .set(dto)
      .where(eq(milestones.id, milestoneId))
      .returning()
    if (!row) throw new NotFoundException('Milestone not found')
    return this.get(id)
  }
}

@ApiTags('engagements')
@Roles(...INTERNAL_ONLY)
@Controller('engagements')
export class EngagementsController {
  constructor(
    private readonly engagements: EngagementsService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.engagements.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.engagements.get(id)
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createEngagementSchema))
  async create(@Body() body: CreateEngagementDto, @CurrentUser() user: SessionUser) {
    const eng = await this.engagements.create(body)
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'engagement',
      entityId: eng.id,
      accountId: eng.accountId,
    })
    return eng
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateEngagementSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateEngagementDto,
    @CurrentUser() user: SessionUser,
  ) {
    const eng = await this.engagements.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'engagement', entityId: id })
    return eng
  }

  @Post(':id/milestones')
  @UsePipes(new ZodValidationPipe(createMilestoneSchema))
  addMilestone(@Param('id') id: string, @Body() body: CreateMilestoneDto) {
    return this.engagements.addMilestone(id, body)
  }

  @Patch(':id/milestones/:milestoneId')
  @UsePipes(new ZodValidationPipe(updateMilestoneSchema))
  updateMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: UpdateMilestoneDto,
  ) {
    return this.engagements.updateMilestone(id, milestoneId, body)
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin', 'pm')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.engagements.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'engagement', entityId: id })
  }
}
