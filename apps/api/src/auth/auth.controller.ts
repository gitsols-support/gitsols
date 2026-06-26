// /api/v1/auth/me — returns the SessionUser attached by JwtAuthGuard.
//
// Used as a "is my token still valid" check by the web app on page mounts.
// Returns 401 (handled by the guard) if the token is missing, invalid, or
// expired.

import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import type { SessionUser } from '@gitsols/types'
import { CurrentUser } from './current-user.decorator'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'Return the authenticated user from the JWT.' })
  @Get('me')
  me(@CurrentUser() user: SessionUser | undefined): SessionUser {
    // The guard rejects requests without a valid JWT before we get here,
    // so `user` is always defined. The optional in the signature satisfies
    // the param decorator's loose type.
    if (!user) {
      throw new Error('CurrentUser missing on authenticated route')
    }
    return user
  }
}
