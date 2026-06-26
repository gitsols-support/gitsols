// NOC signature verification.
//
// Every heartbeat from the agent ships with an Ed25519 detached signature
// over the canonical JSON payload. The agent's public key is stored on
// the endpoint row at enrollment time; here we verify the signature and
// reject replays.
//
// Replay protection is two layers:
//   1. The payload `sentAt` must be within ±5 minutes of `now`.
//   2. The (endpointId, nonce) tuple must not have been seen before (the
//      unique index on `noc_heartbeats` enforces this).

import { Injectable, Logger } from '@nestjs/common'
import * as crypto from 'node:crypto'

const CLOCK_SKEW_MS = 5 * 60 * 1000

@Injectable()
export class NocSignatureService {
  private readonly logger = new Logger(NocSignatureService.name)

  /**
   * Verify an Ed25519 signature over the raw JSON body.
   *
   * @param rawBody  the exact bytes the agent signed (NOT a re-serialized
   *                 object — JSON whitespace would differ).
   * @param signatureB64 detached signature, url-safe base64.
   * @param publicKeyB64 endpoint's Ed25519 public key, url-safe base64.
   */
  verify(
    rawBody: Buffer,
    signatureB64: string,
    publicKeyB64: string,
  ): boolean {
    try {
      const signature = Buffer.from(signatureB64, 'base64url')
      const publicKey = crypto.createPublicKey({
        key: Buffer.from(publicKeyB64, 'base64url'),
        format: 'der',
        type: 'spki',
      })
      return crypto.verify(null, rawBody, publicKey, signature)
    } catch (err) {
      this.logger.warn({ err }, 'noc.signature.verify_error')
      return false
    }
  }

  /**
   * Reject heartbeats whose `sentAt` is too far from server time.
   */
  withinSkew(sentAt: string, now = Date.now()): boolean {
    const t = Date.parse(sentAt)
    if (Number.isNaN(t)) return false
    return Math.abs(t - now) <= CLOCK_SKEW_MS
  }
}
