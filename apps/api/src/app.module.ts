import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { appConfig } from './config/app.config'
import { mailerConfig } from './mailer/mailer.config'
import { HealthController } from './observability/health.controller'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { MailerModule } from './mailer/mailer.module'
import { LeadsModule } from './leads/leads.module'
import { ProspectsModule } from './prospects/prospects.module'
import { PreviewModule } from './preview/preview.module'
import { NocModule } from './noc/noc.module'
import { CrmModule } from './crm/crm.module'

/**
 * Root module — keep this thin. Feature modules live under their own
 * directory (database/, auth/, future: accounts/, engagements/, …) and
 * import here.
 *
 * Globals registered:
 *   - ConfigModule  (env contract via Zod, see `config/env.schema.ts`)
 *   - LoggerModule  (Pino with redaction for auth/secret fields)
 *   - ThrottlerModule + APP_GUARD (rate limit every request by default;
 *     opt out per-route with @SkipThrottle())
 *   - DatabaseModule (global — DatabaseService is injectable anywhere)
 *   - AuthModule    (global JwtAuthGuard + RolesGuard; opt out with @Public())
 *
 * Guard execution order: Throttler → JwtAuth → Roles. Nest evaluates
 * APP_GUARDs in registration order, so authentication runs after rate
 * limiting (we want anonymous traffic burnt down before we crypto-verify).
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mailerConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.LOG_PRETTY === 'true'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            '*.password',
            '*.token',
            '*.apiKey',
            '*.secret',
          ],
          censor: '[REDACTED]',
        },
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (cfg: ConfigType<typeof appConfig>) => [
        {
          ttl: cfg.throttle.ttlMs,
          limit: cfg.throttle.limit,
        },
      ],
    }),
    DatabaseModule,
    MailerModule,
    AuthModule,
    LeadsModule,
    ProspectsModule,
    PreviewModule,
    NocModule,
    CrmModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
