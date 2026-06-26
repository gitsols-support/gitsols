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
import { eq, asc, desc, sql, and } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import {
  bespokeProjects,
  bespokeMilestones,
  type DbBespokeProject,
  type DbBespokeMilestone,
} from '../database/schema/bespoke'
import { accounts } from '../database/schema/accounts'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import {
  createBespokeSchema,
  updateBespokeSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  type CreateBespokeDto,
  type UpdateBespokeDto,
  type CreateMilestoneDto,
  type UpdateMilestoneDto,
} from './crm.dto'
import type { BespokeProject, Milestone, SessionUser } from '@gitsols/types'

@Injectable()
export class BespokeService {
  constructor(private readonly db: DatabaseService) {}

  private serialize(
    row: DbBespokeProject,
    accountName: string | null,
    counts: { total: number; done: number },
    ms?: DbBespokeMilestone[],
  ): BespokeProject {
    return {
      id: row.id,
      name: row.name,
      accountId: opt(row.accountId),
      accountName: opt(accountName),
      type: row.type,
      stage: row.stage,
      billing: row.billing,
      contractValue: row.contractValue,
      burned: row.burned,
      startedAt: opt(row.startedAt),
      targetGoLive: opt(row.targetGoLive),
      health: row.health,
      lead: opt(row.lead),
      team: row.team,
      milestonesTotal: counts.total,
      milestonesDone: counts.done,
      milestones: ms?.map(
        (m): Milestone => ({
          id: m.id,
          title: m.title,
          description: opt(m.description),
          status: m.status,
          dueDate: opt(m.dueDate),
          order: m.order,
        }),
      ),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  private async counts(projectId: string): Promise<{ total: number; done: number }> {
    const [total] = await this.db.db
      .select({ n: sql<number>`count(*)::int` })
      .from(bespokeMilestones)
      .where(eq(bespokeMilestones.projectId, projectId))
    const [done] = await this.db.db
      .select({ n: sql<number>`count(*)::int` })
      .from(bespokeMilestones)
      .where(and(eq(bespokeMilestones.projectId, projectId), eq(bespokeMilestones.status, 'approved')))
    return { total: total?.n ?? 0, done: done?.n ?? 0 }
  }

  async list(): Promise<BespokeProject[]> {
    const rows = await this.db.db
      .select({ p: bespokeProjects, accountName: accounts.name })
      .from(bespokeProjects)
      .leftJoin(accounts, eq(bespokeProjects.accountId, accounts.id))
      .orderBy(desc(bespokeProjects.createdAt))
    return Promise.all(
      rows.map(async (r) => this.serialize(r.p, r.accountName, await this.counts(r.p.id))),
    )
  }

  async get(id: string): Promise<BespokeProject> {
    const [row] = await this.db.db
      .select({ p: bespokeProjects, accountName: accounts.name })
      .from(bespokeProjects)
      .leftJoin(accounts, eq(bespokeProjects.accountId, accounts.id))
      .where(eq(bespokeProjects.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Project not found')
    const ms = await this.db.db
      .select()
      .from(bespokeMilestones)
      .where(eq(bespokeMilestones.projectId, id))
      .orderBy(asc(bespokeMilestones.order))
    const total = ms.length
    const done = ms.filter((m) => m.status === 'approved').length
    return this.serialize(row.p, row.accountName, { total, done }, ms)
  }

  async create(dto: CreateBespokeDto): Promise<BespokeProject> {
    const [row] = await this.db.db.insert(bespokeProjects).values(dto).returning()
    return this.get(row.id)
  }

  async update(id: string, dto: UpdateBespokeDto): Promise<BespokeProject> {
    const [row] = await this.db.db
      .update(bespokeProjects)
      .set({ ...dto, updatedAt: new Date().toISOString() })
      .where(eq(bespokeProjects.id, id))
      .returning()
    if (!row) throw new NotFoundException('Project not found')
    return this.get(id)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db
      .delete(bespokeProjects)
      .where(eq(bespokeProjects.id, id))
      .returning({ id: bespokeProjects.id })
    if (res.length === 0) throw new NotFoundException('Project not found')
  }

  async addMilestone(id: string, dto: CreateMilestoneDto): Promise<BespokeProject> {
    await this.db.db.insert(bespokeMilestones).values({ ...dto, projectId: id })
    return this.get(id)
  }

  async updateMilestone(
    id: string,
    milestoneId: string,
    dto: UpdateMilestoneDto,
  ): Promise<BespokeProject> {
    const [row] = await this.db.db
      .update(bespokeMilestones)
      .set(dto)
      .where(eq(bespokeMilestones.id, milestoneId))
      .returning()
    if (!row) throw new NotFoundException('Milestone not found')
    return this.get(id)
  }
}

@ApiTags('bespoke')
@Roles(...INTERNAL_ONLY)
@Controller('bespoke')
export class BespokeController {
  constructor(
    private readonly bespoke: BespokeService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.bespoke.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.bespoke.get(id)
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createBespokeSchema))
  async create(@Body() body: CreateBespokeDto, @CurrentUser() user: SessionUser) {
    const project = await this.bespoke.create(body)
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'bespoke_project',
      entityId: project.id,
      accountId: project.accountId,
    })
    return project
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateBespokeSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBespokeDto,
    @CurrentUser() user: SessionUser,
  ) {
    const project = await this.bespoke.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'bespoke_project', entityId: id })
    return project
  }

  @Post(':id/milestones')
  @UsePipes(new ZodValidationPipe(createMilestoneSchema))
  addMilestone(@Param('id') id: string, @Body() body: CreateMilestoneDto) {
    return this.bespoke.addMilestone(id, body)
  }

  @Patch(':id/milestones/:milestoneId')
  @UsePipes(new ZodValidationPipe(updateMilestoneSchema))
  updateMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: UpdateMilestoneDto,
  ) {
    return this.bespoke.updateMilestone(id, milestoneId, body)
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin', 'pm')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.bespoke.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'bespoke_project', entityId: id })
  }
}
