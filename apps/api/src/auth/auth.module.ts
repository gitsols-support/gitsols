// Auth module — registers the JWT verifier and both guards globally.
//
// Globals registered via providers:
//   - JwtAuthGuard  (APP_GUARD #2 — runs after Throttler)
//   - RolesGuard    (APP_GUARD #3 — runs after Jwt, reads req.user)
//
// Order matters. NestJS applies APP_GUARDs in registration order, so this
// module's guards are added in AppModule after ThrottlerGuard.

import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigType } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { appConfig } from '../config/app.config'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RolesGuard } from './roles.guard'
import { AuthController } from './auth.controller'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [appConfig.KEY],
      useFactory: (cfg: ConfigType<typeof appConfig>) => ({
        secret: cfg.auth.secret,
        verifyOptions: {
          issuer: cfg.auth.issuer,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
