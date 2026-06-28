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
import { users, type DbUser } from '../database/schema/users'
import { hashPassword } from '../auth/password.util'
import { accounts } from '../database/schema/accounts'
import { Roles } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserDto,
  type UpdateUserDto,
} from './crm.dto'
import type { AdminUser, Role, SessionUser } from '@gitsols/types'

const toIso = (v: unknown): string =>
  v instanceof Date ? v.toISOString() : String(v ?? new Date().toISOString())

@Injectable()
export class UsersAdminService {
  constructor(private readonly db: DatabaseService) {}

  private serialize(row: DbUser, accountName: string | null): AdminUser {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as Role,
      accountId: opt(row.accountId),
      accountName: opt(accountName),
      createdAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
    }
  }

  async list(): Promise<AdminUser[]> {
    const rows = await this.db.db
      .select({ u: users, accountName: accounts.name })
      .from(users)
      .leftJoin(accounts, eq(users.accountId, accounts.id))
      .orderBy(asc(users.name))
    return rows.map((r) => this.serialize(r.u, r.accountName))
  }

  async create(dto: CreateUserDto): Promise<AdminUser> {
    const [row] = await this.db.db
      .insert(users)
      .values({
        email: dto.email.toLowerCase(),
        name: dto.name,
        role: dto.role,
        accountId: dto.accountId,
        ...(dto.initialPassword
          ? { passwordHash: hashPassword(dto.initialPassword), mustResetPassword: true }
          : {}),
      })
      .returning()
    return this.serialize(row, null)
  }

  async update(id: string, dto: UpdateUserDto): Promise<AdminUser> {
    const [row] = await this.db.db
      .update(users)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    if (!row) throw new NotFoundException('User not found')
    return this.serialize(row, null)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db.delete(users).where(eq(users.id, id)).returning({ id: users.id })
    if (res.length === 0) throw new NotFoundException('User not found')
  }
}

@ApiTags('users')
@Roles('owner', 'admin')
@Controller('users')
export class UsersAdminController {
  constructor(
    private readonly usersAdmin: UsersAdminService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.usersAdmin.list()
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async create(@Body() body: CreateUserDto, @CurrentUser() user: SessionUser) {
    const created = await this.usersAdmin.create(body)
    void writeAudit(this.db, user, { action: 'create', entity: 'user', entityId: created.id })
    return created
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() user: SessionUser,
  ) {
    const updated = await this.usersAdmin.update(id, body)
    void writeAudit(this.db, user, { action: 'update', entity: 'user', entityId: id })
    return updated
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.usersAdmin.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'user', entityId: id })
  }
}
