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
import { eq, asc } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { servicesCatalog, type DbServiceCatalogItem } from '../database/schema/services-catalog'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import {
  createServiceCatalogSchema,
  updateServiceCatalogSchema,
  type CreateServiceCatalogDto,
  type UpdateServiceCatalogDto,
} from './crm.dto'
import type { ServiceCatalogItem, SessionUser } from '@gitsols/types'

@Injectable()
export class ServicesCatalogService {
  constructor(private readonly db: DatabaseService) {}

  private serialize(row: DbServiceCatalogItem): ServiceCatalogItem {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      summary: opt(row.summary),
      defaultRate: row.defaultRate,
      billingUnit: row.billingUnit,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async list(): Promise<ServiceCatalogItem[]> {
    const rows = await this.db.db
      .select()
      .from(servicesCatalog)
      .orderBy(asc(servicesCatalog.category), asc(servicesCatalog.name))
    return rows.map((r) => this.serialize(r))
  }

  async get(id: string): Promise<ServiceCatalogItem> {
    const [row] = await this.db.db
      .select()
      .from(servicesCatalog)
      .where(eq(servicesCatalog.id, id))
      .limit(1)
    if (!row) throw new NotFoundException('Service not found')
    return this.serialize(row)
  }

  async create(dto: CreateServiceCatalogDto): Promise<ServiceCatalogItem> {
    const [row] = await this.db.db.insert(servicesCatalog).values(dto).returning()
    return this.serialize(row)
  }

  async update(id: string, dto: UpdateServiceCatalogDto): Promise<ServiceCatalogItem> {
    const [row] = await this.db.db
      .update(servicesCatalog)
      .set({ ...dto, updatedAt: new Date().toISOString() })
      .where(eq(servicesCatalog.id, id))
      .returning()
    if (!row) throw new NotFoundException('Service not found')
    return this.serialize(row)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db
      .delete(servicesCatalog)
      .where(eq(servicesCatalog.id, id))
      .returning({ id: servicesCatalog.id })
    if (res.length === 0) throw new NotFoundException('Service not found')
  }
}

@ApiTags('services-catalog')
@Roles(...INTERNAL_ONLY)
@Controller('services-catalog')
export class ServicesCatalogController {
  constructor(
    private readonly services: ServicesCatalogService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.services.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.services.get(id)
  }

  @Post()
  @HttpCode(201)
  @Roles('owner', 'admin', 'sales')
  @UsePipes(new ZodValidationPipe(createServiceCatalogSchema))
  async create(@Body() body: CreateServiceCatalogDto, @CurrentUser() user: SessionUser) {
    const item = await this.services.create(body)
    void writeAudit(this.db, user, { action: 'create', entity: 'service', entityId: item.id })
    return item
  }

  @Patch(':id')
  @Roles('owner', 'admin', 'sales')
  @UsePipes(new ZodValidationPipe(updateServiceCatalogSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateServiceCatalogDto,
    @CurrentUser() user: SessionUser,
  ) {
    const item = await this.services.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'service', entityId: id })
    return item
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.services.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'service', entityId: id })
  }
}
