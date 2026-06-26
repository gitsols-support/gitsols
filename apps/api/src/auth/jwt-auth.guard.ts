// JWT bearer-token guard.
//
// The web app (apps/web) authenticates users via Auth.js and signs a JWT
// using AUTH_SECRET. This guard:
//   1. Reads the Bearer token from the Authorization header.
//   2. Verifies signature + expiry against AUTH_SECRET + AUTH_ISSUER.
//   3. Attaches a typed `SessionUser` to `request.user` for downstream code.
//
// Routes opt out with `@Public()`. Routes are protected by default once this
// guard is registered as APP_GUARD in AppModule.

import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { FastifyRequest } from 'fastify'
import type { JwtPayload, SessionUser } from '@gitsols/types'
import { appConfig } from '../config/app.config'
import { IS_PUBLIC_KEY } from './public.decorator'

export interface AuthenticatedRequest extends FastifyRequest {
  user?: SessionUser
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractBearerToken(req)
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token')
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.auth.secret,
        issuer: this.config.auth.issuer,
      })

      req.user = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        accountId: payload.accountId,
      }
      return true
    } catch (err) {
      this.logger.warn({ err }, 'JWT verification failed')
      throw new UnauthorizedException('Invalid or expired token')
    }
  }

  private extractBearerToken(req: FastifyRequest): string | null {
    const header = req.headers.authorization
    if (!header || !header.toLowerCase().startsWith('bearer ')) return null
    const token = header.slice(7).trim()
    return token.length > 0 ? token : null
  }
}
