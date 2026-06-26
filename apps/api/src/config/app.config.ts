import { registerAs } from '@nestjs/config'
import { loadEnv } from './env.schema'

/**
 * Centralised env-var contract. The shape of `process.env` is documented
 * (and validated) in `env.schema.ts`. Inject via:
 *
 *   @Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>
 */
export const appConfig = registerAs('app', () => {
  const env = loadEnv()
  return {
    env: env.NODE_ENV,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    logPretty: env.LOG_PRETTY,
    corsOrigins: env.CORS_ORIGINS,
    throttle: {
      ttlMs: env.THROTTLE_TTL_MS,
      limit: env.THROTTLE_LIMIT,
    },
    database: {
      url: env.DATABASE_URL,
      poolMax: env.DATABASE_POOL_MAX,
    },
    auth: {
      secret: env.AUTH_SECRET,
      issuer: env.AUTH_ISSUER,
    },
  }
})
