// Mark a controller or handler as public — skips JwtAuthGuard.
//
// Usage:
//   @Public()
//   @Get('health')
//   health() { ... }

import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true)
