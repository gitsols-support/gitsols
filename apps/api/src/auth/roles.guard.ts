// Role guard — reads @Roles() metadata and denies the request if the user's
// role isn't in the allow-list. Runs AFTER JwtAuthGuard, so `req.user` is
// guaranteed populated (or the route is @Public()).

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Role } from '@gitsols/types'
import type { AuthenticatedRequest } from './jwt-auth.guard'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    // No @Roles() metadata = no role restriction beyond authentication.
    if (!required || required.length === 0) return true

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!req.user) {
      throw new ForbiddenException('Authenticated user not found on request')
    }

    if (!required.includes(req.user.role)) {
      throw new ForbiddenException(`Role "${req.user.role}" not permitted`)
    }
    return true
  }
}
