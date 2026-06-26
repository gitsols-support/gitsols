import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { DatabaseService } from '../database/database.service'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { AccountsService } from './accounts.service'
import { writeAudit } from './crm.audit'
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountDto,
  type UpdateAccountDto,
} from './crm.dto'
import type { SessionUser } from '@gitsols/types'

@ApiTags('accounts')
@Roles(...INTERNAL_ONLY)
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accounts: AccountsService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all accounts with live engagement/ticket counts.' })
  list() {
    return this.accounts.list()
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.accounts.get(id)
  }

  @Get(':id/contacts')
  contacts(@Param('id') id: string) {
    return this.accounts.contacts(id)
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountSchema))
  async create(@Body() body: CreateAccountDto, @CurrentUser() user: SessionUser) {
    const account = await this.accounts.create(body)
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'account',
      entityId: account.id,
      accountId: account.id,
    })
    return account
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateAccountSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateAccountDto,
    @CurrentUser() user: SessionUser,
  ) {
    const account = await this.accounts.update(id, body)
    void writeAudit(this.db, user, {
      action: 'update',
      entity: 'account',
      entityId: id,
      accountId: id,
      payload: body,
    })
    return account
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner', 'admin')
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.accounts.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'account', entityId: id })
  }
}
