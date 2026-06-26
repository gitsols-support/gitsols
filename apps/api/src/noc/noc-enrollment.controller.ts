// POST /api/v1/noc/enroll — first-run agent enrollment.
//
// The agent ships with no credentials. On first run an operator pastes a
// one-time token (issued by an admin via the configurator); the agent
// posts this endpoint with its generated public key + host metadata, the
// server validates the token, mints the endpoint record, and returns
// the initial agent config.

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { NocEnrollmentResponse } from '@gitsols/types'
import { Public } from '../auth/public.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { NocService } from './noc.service'
import { nocEnrollmentSchema, type NocEnrollmentDto } from './noc.dto'

@ApiTags('noc')
@Controller('noc')
export class NocEnrollmentController {
  constructor(private readonly noc: NocService) {}

  @ApiOperation({ summary: 'Agent first-run enrollment with one-time token.' })
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(201)
  @Post('enroll')
  @UsePipes(new ZodValidationPipe(nocEnrollmentSchema))
  async enroll(@Body() body: NocEnrollmentDto): Promise<NocEnrollmentResponse> {
    try {
      const { endpoint, config } = await this.noc.consumeEnrollment(body)
      return {
        endpointId: endpoint.id,
        clientId: endpoint.clientId,
        // Phase 3: the server's per-environment Ed25519 signing key is
        // injected here so the agent can verify config push responses.
        // For now we return the endpoint's own key as a placeholder.
        serverPublicKey: endpoint.publicKey,
        config,
      }
    } catch (err) {
      if (err instanceof Error) throw new BadRequestException(err.message)
      throw err
    }
  }
}
