// POST /api/v1/noc/heartbeat — agent → server heartbeat ingest.
//
// Public route (no JWT) — the agent authenticates by signing the request
// body with its per-endpoint Ed25519 private key. The server looks up the
// endpoint by `endpointId` in the body, verifies the signature against the
// stored public key, checks for replay, and accepts.
//
// Throttled per-IP at 60 req/min — a single agent at default cadence
// posts every 60 minutes, so this leaves headroom for many endpoints behind
// the same NAT plus retries.

import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  NotFoundException,
  Post,
  Req,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'
import { eq } from 'drizzle-orm'
import { Public } from '../auth/public.decorator'
import { DatabaseService } from '../database/database.service'
import { nocEndpoints } from '../database/schema/noc'
import { NocService } from './noc.service'
import { NocSignatureService } from './noc-signature.service'
import { nocHeartbeatSchema } from './noc.dto'

@ApiTags('noc')
@Controller('noc')
export class NocIngestController {
  constructor(
    private readonly noc: NocService,
    private readonly sig: NocSignatureService,
    private readonly db: DatabaseService,
  ) {}

  @ApiOperation({ summary: 'Agent → NOC heartbeat (Ed25519 signed).' })
  @Public()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @HttpCode(202)
  @Post('heartbeat')
  async heartbeat(
    @Body() body: unknown,
    @Headers('x-gitsols-signature') signature: string | undefined,
    @Req() req: FastifyRequest,
  ): Promise<{ accepted: true; openedAlerts: number }> {
    if (!signature) {
      throw new BadRequestException('Missing x-gitsols-signature header')
    }

    const parsed = nocHeartbeatSchema.safeParse(body)
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message)
    }
    const payload = parsed.data

    if (!this.sig.withinSkew(payload.sentAt)) {
      throw new BadRequestException('Heartbeat outside allowed clock skew')
    }

    // Look up endpoint to fetch the stored public key.
    const [endpoint] = await this.db.db
      .select()
      .from(nocEndpoints)
      .where(eq(nocEndpoints.id, payload.endpointId))
      .limit(1)
    if (!endpoint) throw new NotFoundException('Unknown endpoint')

    // Verify the signature over the raw request body. Fastify exposes the
    // raw body via `req.rawBody` when JSON parser is configured to keep it;
    // fall back to re-serialization (less safe — agent must match server
    // canonical form). For Phase 2 we accept the trade-off and document.
    const rawBody = (req as { rawBody?: Buffer }).rawBody ??
      Buffer.from(JSON.stringify(payload))
    const valid = this.sig.verify(rawBody, signature, endpoint.publicKey)

    const result = await this.noc.ingestHeartbeat({
      payload,
      signatureValid: valid,
      sourceIp: req.ip,
    })

    if (!result.accepted || !valid) {
      throw new BadRequestException('Heartbeat rejected')
    }
    return { accepted: true, openedAlerts: result.openedAlerts }
  }
}
