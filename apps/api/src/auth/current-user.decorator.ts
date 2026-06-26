// Parameter decorator — pulls the validated SessionUser off the request.
//
// Usage:
//   @Get('me')
//   me(@CurrentUser() user: SessionUser) { return user }
//
// If used on a non-authenticated route the value will be `undefined`. Pair
// with @Public() only when you're sure that's intentional.

import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { SessionUser } from '@gitsols/types'
import type { AuthenticatedRequest } from './jwt-auth.guard'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser | undefined => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return req.user
  },
)
