// Shared audit-log writer for CRM mutations. Best-effort: an audit failure
// must never break the user-facing request, so callers `void writeAudit(...)`.

import { Logger } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { auditLog } from '../database/schema/audit-log'
import type { SessionUser } from '@gitsols/types'

const logger = new Logger('CrmAudit')

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface AuditInput {
  action: 'create' | 'update' | 'delete' | 'read' | 'export' | 'convert' | 'stage'
  entity: string
  entityId?: string | null
  accountId?: string | null
  payload?: Record<string, unknown>
}

export async function writeAudit(
  db: DatabaseService,
  user: SessionUser | undefined,
  input: AuditInput,
): Promise<void> {
  try {
    await db.db.insert(auditLog).values({
      actorId: user && UUID_RE.test(user.id) ? user.id : null,
      actorEmail: user?.email ?? 'system@gitsols.com',
      actorRole: user?.role ?? 'system',
      accountId: input.accountId && UUID_RE.test(input.accountId) ? input.accountId : null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId && UUID_RE.test(input.entityId) ? input.entityId : null,
      payload: input.payload ?? null,
    })
  } catch (err) {
    logger.warn({ err, entity: input.entity, action: input.action }, 'audit.write_failed')
  }
}
