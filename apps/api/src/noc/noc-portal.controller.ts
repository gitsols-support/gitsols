// /api/v1/noc/portal/* — client-facing read endpoints.
//
// Client users (role ∈ ClientRole) see only their own Account's data. The
// JwtAuthGuard validates the session and `accountId` is pinned to the
// request — every query below scopes by it.

import { Controller, ForbiddenException, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { NocService } from './noc.service'
import type { SessionUser } from '@gitsols/types'

@ApiTags('noc-portal')
@Roles('client_primary', 'client_user')
@Controller('noc/portal')
export class NocPortalController {
  constructor(private readonly noc: NocService) {}

  private clientIdFor(user: SessionUser): string {
    if (!user.accountId) {
      throw new ForbiddenException('No account bound to session')
    }
    return user.accountId
  }

  @Get('rollup')
  rollup(@CurrentUser() user: SessionUser) {
    return this.noc.fleetRollup(this.clientIdFor(user))
  }

  @Get('endpoints')
  endpoints(@CurrentUser() user: SessionUser) {
    return this.noc.listEndpoints(this.clientIdFor(user))
  }

  @Get('alerts')
  alerts(@CurrentUser() user: SessionUser) {
    return this.noc.listOpenAlerts(this.clientIdFor(user))
  }

  @Get('runbooks')
  async runbooks(@CurrentUser() user: SessionUser, @Query('category') category?: string) {
    const all = await this.noc.listRunbooks(this.clientIdFor(user))
    // Clients only see client-visible runbooks.
    const visible = all.filter(
      (r) => r.audience === 'client_visible' || r.audience === 'both',
    )
    return category ? visible.filter((r) => r.category === category) : visible
  }
}
