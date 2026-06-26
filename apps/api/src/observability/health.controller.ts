import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from '../auth/public.decorator'
import { DatabaseService } from '../database/database.service'

/**
 * Health endpoints — used by Kubernetes / Cloud Run / Railway probes.
 *
 *   GET /health/live   — process is up (always 200 if the controller responds)
 *   GET /health/ready  — process can serve traffic (DB ping succeeds)
 *
 * These live OUTSIDE the /api/v1 global prefix on purpose, skip the global
 * throttler, and are marked @Public() so probes never get rate-limited or
 * 401'd.
 */
@ApiTags('health')
@SkipThrottle()
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @ApiOperation({ summary: 'Liveness probe — process is up.' })
  @Get('live')
  live(): { status: 'ok'; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  @ApiOperation({ summary: 'Readiness probe — process can serve traffic.' })
  @Get('ready')
  async ready(): Promise<{ status: 'ready'; timestamp: string; db: 'ok' }> {
    const dbOk = await this.db.ping()
    if (!dbOk) {
      throw new HttpException(
        { status: 'degraded', db: 'unreachable', timestamp: new Date().toISOString() },
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }
    return { status: 'ready', timestamp: new Date().toISOString(), db: 'ok' }
  }
}
