// POST /api/v1/leads — public lead capture endpoint.
//
// Marked @Public() (no JWT required) and uses the global ThrottlerGuard for
// rate limiting. The Phase 1 marketing site posts here from /contact and
// /free-it-audit and the per-service inquiry forms.

import { Body, Controller, Headers, HttpCode, Post, Req, UsePipes } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { FastifyRequest } from 'fastify'
import { Public } from '../auth/public.decorator'
import { LeadsService } from './leads.service'
import { ZodValidationPipe } from './zod-validation.pipe'
import { createLeadSchema, type CreateLeadDto } from './lead.dto'

interface CreateLeadResponse {
  id: string
  status: 'new'
}

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @ApiOperation({ summary: 'Submit a lead from the marketing site.' })
  @Public()
  // Tighter limit than the global default: 10 submissions per IP per 10 minutes.
  @Throttle({ default: { limit: 10, ttl: 10 * 60_000 } })
  @HttpCode(201)
  @Post()
  @UsePipes(new ZodValidationPipe(createLeadSchema))
  async submit(
    @Body() body: CreateLeadDto,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string | undefined,
  ): Promise<CreateLeadResponse> {
    const ipAddress = req.ip
    const lead = await this.leads.create({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      company: body.company,
      message: body.message,
      serviceInterest: body.serviceInterest,
      industry: body.industry,
      source: body.source ?? 'contact_form',
      sourceUrl: body.sourceUrl,
      attribution: body.attribution,
      ipAddress,
      userAgent: ua,
    })
    return { id: lead.id, status: 'new' }
  }
}
