// Smoke test for the health controller — proves the test runner is wired up
// and the health contract returns the shape probes expect.

import { describe, it, expect } from 'vitest'
import { HealthController } from './health.controller'
import type { DatabaseService } from '../database/database.service'

// Minimal fake — we only need .ping() for ready(). Cast through unknown to
// avoid pulling in the full DatabaseService surface in tests.
function fakeDb(pingResult: boolean): DatabaseService {
  return {
    ping: () => Promise.resolve(pingResult),
  } as unknown as DatabaseService
}

describe('HealthController', () => {
  it('GET /health/live returns ok with a timestamp', () => {
    const controller = new HealthController(fakeDb(true))
    const res = controller.live()
    expect(res.status).toBe('ok')
    expect(typeof res.timestamp).toBe('string')
    expect(() => new Date(res.timestamp)).not.toThrow()
  })

  it('GET /health/ready returns ready when DB ping succeeds', async () => {
    const controller = new HealthController(fakeDb(true))
    const res = await controller.ready()
    expect(res.status).toBe('ready')
    expect(res.db).toBe('ok')
    expect(typeof res.timestamp).toBe('string')
  })

  it('GET /health/ready throws 503 when DB ping fails', async () => {
    const controller = new HealthController(fakeDb(false))
    await expect(controller.ready()).rejects.toThrow()
  })
})
