// /api/v1/noc/admin/* — staff-only read + write endpoints behind the
// JwtAuthGuard. These power the admin NOC console (dashboard, configurator,
// runbook editor, alert triage).

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { and, eq } from 'drizzle-orm'
import { Roles } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { DatabaseService } from '../database/database.service'
import {
  nocAlerts,
  nocCheckDefinitions,
  nocClientConfigs,
} from '../database/schema/noc'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { NocService } from './noc.service'
import {
  nocAlertActionSchema,
  nocConfigUpsertSchema,
  nocRunbookUpsertSchema,
  type NocAlertActionDto,
  type NocConfigUpsertDto,
  type NocRunbookUpsertDto,
} from './noc.dto'
import type { SessionUser } from '@gitsols/types'

@ApiTags('noc-admin')
@Roles('owner', 'admin', 'sales', 'pm', 'tech')
@Controller('noc/admin')
export class NocAdminController {
  constructor(
    private readonly noc: NocService,
    private readonly db: DatabaseService,
  ) {}

  // ──── Dashboard ─────────────────────────────────────────────────────────

  @Get('rollup')
  @ApiOperation({ summary: 'Fleet rollup (optionally scoped by client).' })
  rollup(@Query('clientId') clientId?: string) {
    return this.noc.fleetRollup(clientId)
  }

  @Get('endpoints')
  endpoints(@Query('clientId') clientId?: string) {
    return this.noc.listEndpoints(clientId)
  }

  @Get('alerts')
  alerts(@Query('clientId') clientId?: string) {
    return this.noc.listOpenAlerts(clientId)
  }

  // ──── Configurator ──────────────────────────────────────────────────────

  @Get('checks')
  @ApiOperation({ summary: 'Global check catalog.' })
  async checks() {
    return this.db.db.select().from(nocCheckDefinitions)
  }

  @Get('clients/:clientId/configs')
  async clientConfigs(@Param('clientId') clientId: string) {
    return this.db.db
      .select()
      .from(nocClientConfigs)
      .where(eq(nocClientConfigs.clientId, clientId))
  }

  @Post('clients/:clientId/configs')
  @UsePipes(new ZodValidationPipe(nocConfigUpsertSchema))
  async upsertConfig(
    @Param('clientId') clientId: string,
    @Body() body: NocConfigUpsertDto,
    @CurrentUser() user: SessionUser,
  ) {
    if (body.clientId !== clientId) {
      // soft guard — the URL is authoritative
      body = { ...body, clientId }
    }
    const existing = await this.db.db
      .select()
      .from(nocClientConfigs)
      .where(
        and(
          eq(nocClientConfigs.clientId, clientId),
          eq(nocClientConfigs.checkDefinitionId, body.checkDefinitionId),
        ),
      )
      .limit(1)

    if (existing[0]) {
      const [updated] = await this.db.db
        .update(nocClientConfigs)
        .set({
          enabled: body.enabled,
          overrideSeverity: body.overrideSeverity,
          overrideScheduleMinutes: body.overrideScheduleMinutes,
          thresholdOverrides: body.thresholdOverrides,
          runbookSlug: body.runbookSlug,
          scopeTags: body.scopeTags ?? [],
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(nocClientConfigs.id, existing[0].id))
        .returning()
      return updated
    }

    const [created] = await this.db.db
      .insert(nocClientConfigs)
      .values({
        clientId,
        checkDefinitionId: body.checkDefinitionId,
        enabled: body.enabled,
        overrideSeverity: body.overrideSeverity,
        overrideScheduleMinutes: body.overrideScheduleMinutes,
        thresholdOverrides: body.thresholdOverrides,
        runbookSlug: body.runbookSlug,
        scopeTags: body.scopeTags ?? [],
        updatedBy: user.id,
      })
      .returning()
    return created
  }

  // ──── Enrollment issuance ───────────────────────────────────────────────

  @Post('clients/:clientId/enroll-token')
  @ApiOperation({ summary: 'Issue a one-time enrollment token.' })
  async issueEnrollmentToken(
    @Param('clientId') clientId: string,
    @Query('hostname') hostname: string | undefined,
    @CurrentUser() user: SessionUser,
  ) {
    return this.noc.issueEnrollmentToken(clientId, {
      intendedHostname: hostname,
      createdBy: user.id,
    })
  }

  // ──── Runbooks ──────────────────────────────────────────────────────────

  @Get('runbooks')
  runbooks(@Query('clientId') clientId?: string) {
    return this.noc.listRunbooks(clientId)
  }

  @Post('runbooks')
  @UsePipes(new ZodValidationPipe(nocRunbookUpsertSchema))
  async upsertRunbook(
    @Body() body: NocRunbookUpsertDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.noc.upsertRunbook(body, user.id)
  }

  // ──── Alert actions ─────────────────────────────────────────────────────

  @Post('alerts/action')
  @UsePipes(new ZodValidationPipe(nocAlertActionSchema))
  async alertAction(
    @Body() body: NocAlertActionDto,
    @CurrentUser() user: SessionUser,
  ) {
    const now = new Date()
    const patch =
      body.action === 'acknowledge'
        ? {
            status: 'acknowledged' as const,
            acknowledgedAt: now,
            acknowledgedBy: user.id,
          }
        : body.action === 'resolve'
          ? {
              status: 'resolved' as const,
              resolvedAt: now,
              resolvedBy: user.id,
              resolutionNote: body.note,
            }
          : { status: 'suppressed' as const, resolutionNote: body.note }
    const [updated] = await this.db.db
      .update(nocAlerts)
      .set(patch)
      .where(eq(nocAlerts.id, body.alertId))
      .returning()
    return updated
  }
}
