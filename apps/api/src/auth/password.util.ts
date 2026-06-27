// Password hashing with Node's built-in scrypt — no external dependency, safe
// on Railway. Format: scrypt$<N>$<saltHex>$<hashHex>. Verification is
// constant-time.

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEYLEN = 64
const COST = 16384 // scrypt N

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEYLEN, { N: COST })
  return `scrypt$${COST}$${salt.toString('hex')}$${hash.toString('hex')}`
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false
  const cost = Number(parts[1])
  const salt = Buffer.from(parts[2], 'hex')
  const expected = Buffer.from(parts[3], 'hex')
  if (!Number.isFinite(cost) || salt.length === 0 || expected.length === 0) return false
  const actual = scryptSync(password, salt, expected.length, { N: cost })
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
