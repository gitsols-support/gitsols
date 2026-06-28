// Email + password credential endpoints.
//
//   POST /api/v1/auth/password/verify  (public) — validate email+password,
//        return the user's role + mustResetPassword flag. Called by the web
//        app's Auth.js Credentials provider during sign-in.
//   POST /api/v1/auth/password/change  (authenticated) — set a new password
//        for the current user and clear the must-reset flag.

import {
  Body,
  Controller,
  HttpCode,
  Injectable,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { users } from '../database/schema/users'
import { Public } from './public.decorator'
import { CurrentUser } from './current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { hashPassword, verifyPassword } from './password.util'
import type { SessionUser } from '@gitsols/types'

export const verifyPasswordSchema = z
  .object({
    email: z.string().trim().email().max(320),
    password: z.string().min(1).max(200),
  })
  .strict()
export type VerifyPasswordDto = z.infer<typeof verifyPasswordSchema>

export const changePasswordSchema = z
  .object({
    // Optional: when present (voluntary change from the account page) it is
    // verified against the stored hash. Absent for the forced first-login
    // reset, which is already gated by a fresh authentication.
    currentPassword: z.string().min(1).max(200).optional(),
    newPassword: z
      .string()
      .min(10, 'Password must be at least 10 characters')
      .max(200)
      .regex(/[A-Za-z]/, 'Must contain a letter')
      .regex(/[0-9]/, 'Must contain a number'),
  })
  .strict()
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>

export interface VerifiedUser {
  id: string
  email: string
  name: string
  role: string
  accountId: string | null
  mustResetPassword: boolean
}

@Injectable()
export class PasswordService {
  constructor(private readonly db: DatabaseService) {}

  async verify(email: string, password: string): Promise<VerifiedUser> {
    const [row] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
    // Run a verify even on a missing user to reduce timing oracles.
    const ok = verifyPassword(password, row?.passwordHash)
    if (!row || !ok) throw new UnauthorizedException('Invalid email or password')
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      accountId: row.accountId,
      mustResetPassword: row.mustResetPassword,
    }
  }

  async change(userId: string, newPassword: string, currentPassword?: string): Promise<void> {
    if (currentPassword !== undefined) {
      const [row] = await this.db.db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      if (!row || !verifyPassword(currentPassword, row.passwordHash)) {
        throw new UnauthorizedException('Current password is incorrect')
      }
    }
    await this.db.db
      .update(users)
      .set({
        passwordHash: hashPassword(newPassword),
        mustResetPassword: false,
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, userId))
  }
}

@ApiTags('auth')
@Controller('auth/password')
export class PasswordController {
  constructor(private readonly passwords: PasswordService) {}

  @Public()
  @Post('verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validate email + password; returns role + reset flag.' })
  @UsePipes(new ZodValidationPipe(verifyPasswordSchema))
  verify(@Body() body: VerifyPasswordDto) {
    return this.passwords.verify(body.email, body.password)
  }

  @Post('change')
  @HttpCode(204)
  @ApiOperation({ summary: 'Set a new password for the current user.' })
  @UsePipes(new ZodValidationPipe(changePasswordSchema))
  async change(@Body() body: ChangePasswordDto, @CurrentUser() user: SessionUser | undefined) {
    if (!user) throw new UnauthorizedException()
    await this.passwords.change(user.id, body.newPassword, body.currentPassword)
  }
}
