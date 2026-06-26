// GET /api/v1/preview/:token — unauth fetch of preview-portal data.
//
// Public + throttled. The token itself is the authorization (random, 30-day
// TTL, view-tracked). No JWT, no session.

import { Controller, Get, Headers, Param, Req } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { FastifyRequest } from 'fastify'
import type { PreviewPortalData } from '@gitsols/types'
import { Public } from '../auth/public.decorator'
import { PreviewService } from './preview.service'

@ApiTags('preview')
@Controller('preview')
export class PreviewController {
  constructor(private readonly preview: PreviewService) {}

  @ApiOperation({ summary: 'Fetch unauthenticated preview-portal data by token.' })
  @Public()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get(':token')
  async get(
    @Param('token') token: string,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string | undefined,
  ): Promise<PreviewPortalData> {
    return this.preview.getByToken(token, {
      ipAddress: req.ip,
      userAgent: ua,
    })
  }
}
