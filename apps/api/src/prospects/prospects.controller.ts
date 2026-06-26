// POST /api/v1/prospects — public endpoint for the multistep audit intake.
//
// Throttled tighter than the rest of the API (5 submissions per IP per
// 10 minutes) because a successful POST mints a tokenized preview URL +
// fires an email. Public via @Public() — no JWT.

import { Body, Controller, Headers, HttpCode, Post, Req, UsePipes } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { FastifyRequest } from 'fastify'
import type { CreateProspectResponse } from '@gitsols/types'
import { Public } from '../auth/public.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { ProspectsService } from './prospects.service'
import { createProspectSchema, type CreateProspectDto } from './prospect.dto'

@ApiTags('prospects')
@Controller('prospects')
export class ProspectsController {
  constructor(private readonly prospects: ProspectsService) {}

  @ApiOperation({ summary: 'Submit a completed multistep intake.' })
  @Public()
  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } })
  @HttpCode(201)
  @Post()
  @UsePipes(new ZodValidationPipe(createProspectSchema))
  async submit(
    @Body() body: CreateProspectDto,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string | undefined,
  ): Promise<CreateProspectResponse> {
    const ipAddress = req.ip
    // `answers` is a discriminated union across intake flows (audit / bespoke
    // scope / marketing). Read shared + flow-specific fields through a typed
    // accessor so the controller stays agnostic to which flow posted.
    const a = body.answers as Record<string, unknown>
    const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)
    const num = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined)
    const firstStr = (v: unknown): string | undefined =>
      Array.isArray(v) && typeof v[0] === 'string' ? (v[0] as string) : undefined
    const result = await this.prospects.create({
      name: str(a.name) ?? '',
      email: (str(a.email) ?? '').toLowerCase(),
      phone: str(a.phone),
      role: str(a.role),
      companyName: str(a.companyName) ?? '',
      industry: str(a.industry),
      employeeCount: num(a.employeeCount),
      officeCount: num(a.officeCount),
      intakeFlow: body.flow,
      intakeVersion: body.intakeVersion,
      intakePayload: a,
      topPriority: firstStr(a.topPriorities),
      status: 'new',
      sourceUrl: body.sourceUrl,
      attribution: body.attribution,
      ipAddress,
      userAgent: ua,
    })

    return {
      id: result.prospect.id,
      previewToken: result.previewToken.token,
      previewExpiresAt: result.previewToken.expiresAt.toISOString(),
    }
  }
}
