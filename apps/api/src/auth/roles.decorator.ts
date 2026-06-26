// Role-based access decorator. The companion RolesGuard reads this metadata
// and allows the request through if the user's role is in the list.
//
// Usage:
//   @Roles('owner', 'admin')
//   @Get('audit-log')
//   list() { ... }
//
// Internal-only routes can use the helper `INTERNAL_ONLY`:
//   @Roles(...INTERNAL_ONLY)

import { SetMetadata } from '@nestjs/common'
import type { Role, InternalRole, ClientRole } from '@gitsols/types'
import { INTERNAL_ROLES, CLIENT_ROLES } from '@gitsols/types'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

/** Convenience: every internal staff role, regardless of seniority. */
export const INTERNAL_ONLY: readonly InternalRole[] = INTERNAL_ROLES

/** Convenience: client portal users only. */
export const CLIENT_ONLY: readonly ClientRole[] = CLIENT_ROLES
