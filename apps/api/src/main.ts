import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { Logger as PinoLogger } from 'nestjs-pino'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import compress from '@fastify/compress'
import { AppModule } from './app.module'
import { loadEnv } from './config/env.schema'

/**
 * Bootstrap.
 *
 * NestJS 11 + Fastify + Pino. Order matters:
 *   1. Validate env at boot (loadEnv) — fail fast with a clear error.
 *   2. Create app with bufferLogs so Pino captures startup.
 *   3. Swap default logger for nestjs-pino.
 *   4. Register Fastify plugins: helmet, cors, compress (in that order — security first).
 *   5. Apply global ValidationPipe (whitelist + transform).
 *   6. Enable graceful-shutdown hooks for k8s/Cloud Run SIGTERM.
 *   7. Mount Swagger in non-production.
 *   8. Bind to PORT.
 */
async function bootstrap(): Promise<void> {
  const env = loadEnv()

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
    { bufferLogs: true },
  )

  const logger = app.get(PinoLogger)
  app.useLogger(logger)

  // Security headers + CORS + compression.
  // Helmet's contentSecurityPolicy is left disabled here because the API serves JSON,
  // not HTML — turn it on if you start serving rendered pages from this service.
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  await app.register(compress, { encodings: ['gzip', 'deflate'] })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.setGlobalPrefix('api/v1', { exclude: ['health/(.*)'] })
  app.enableShutdownHooks()

  // Swagger / OpenAPI — only mount outside production.
  if (env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('@gitsols/api')
      .setDescription('GITSOLS admin API')
      .setVersion('0.2.0')
      .addBearerAuth()
      .build()
    const doc = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/v1/docs', app, doc)
  }

  await app.listen(env.PORT, '0.0.0.0')

  // Plain stdout log (unbuffered) so the bind port is always visible in the
  // platform logs even before Pino flushes — useful for diagnosing the
  // platform healthcheck/port mapping.
  // eslint-disable-next-line no-console
  console.log(`[boot] API bound to 0.0.0.0:${env.PORT} (PORT env=${process.env.PORT ?? 'unset'})`)
  logger.log(`API listening on http://localhost:${env.PORT}`)
  logger.log(`Health: http://localhost:${env.PORT}/health/live`)
  if (env.NODE_ENV !== 'production') {
    logger.log(`Swagger: http://localhost:${env.PORT}/api/v1/docs`)
  }
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API', err)
  process.exit(1)
})
