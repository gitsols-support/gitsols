// Generic Zod validation pipe. Used by the leads controller and any other
// endpoint that prefers Zod schemas over class-validator DTOs.
//
// Throws Nest BadRequestException with a structured `details` payload so the
// web app can surface field-specific errors.

import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodError, ZodType } from 'zod'

export class ZodValidationPipe<TSchema extends ZodType> implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    try {
      return this.schema.parse(value)
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: {
            issues: err.issues.map((i) => ({
              path: i.path.join('.'),
              message: i.message,
              code: i.code,
            })),
          },
        })
      }
      throw err
    }
  }
}
