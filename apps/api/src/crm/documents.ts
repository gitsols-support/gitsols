import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { eq, desc } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { documents, type DbDocument } from '../database/schema/documents'
import { accounts } from '../database/schema/accounts'
import { Roles, INTERNAL_ONLY } from '../auth/roles.decorator'
import { CurrentUser } from '../auth/current-user.decorator'
import { ZodValidationPipe } from '../leads/zod-validation.pipe'
import { writeAudit } from './crm.audit'
import { opt } from './crm.util'
import { createDocumentSchema, type CreateDocumentDto } from './crm.dto'
import type { CrmDocument, SessionUser } from '@gitsols/types'

@Injectable()
export class DocumentsService {
  constructor(private readonly db: DatabaseService) {}

  private serialize(row: DbDocument, accountName: string | null): CrmDocument {
    return {
      id: row.id,
      name: row.name,
      kind: row.kind,
      accountId: opt(row.accountId),
      accountName: opt(accountName),
      storageKey: opt(row.storageKey),
      url: opt(row.url),
      sizeBytes: opt(row.sizeBytes),
      mimeType: opt(row.mimeType),
      uploadedBy: opt(row.uploadedBy),
      createdAt: row.createdAt,
    }
  }

  async list(): Promise<CrmDocument[]> {
    const rows = await this.db.db
      .select({ d: documents, accountName: accounts.name })
      .from(documents)
      .leftJoin(accounts, eq(documents.accountId, accounts.id))
      .orderBy(desc(documents.createdAt))
    return rows.map((r) => this.serialize(r.d, r.accountName))
  }

  async create(dto: CreateDocumentDto, uploadedBy: string): Promise<CrmDocument> {
    const [row] = await this.db.db
      .insert(documents)
      .values({ ...dto, uploadedBy })
      .returning()
    return this.serialize(row, null)
  }

  async remove(id: string): Promise<void> {
    const res = await this.db.db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning({ id: documents.id })
    if (res.length === 0) throw new NotFoundException('Document not found')
  }
}

@ApiTags('documents')
@Roles(...INTERNAL_ONLY)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documents: DocumentsService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  list() {
    return this.documents.list()
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createDocumentSchema))
  async create(@Body() body: CreateDocumentDto, @CurrentUser() user: SessionUser) {
    const doc = await this.documents.create(body, user?.name ?? 'Staff')
    void writeAudit(this.db, user, {
      action: 'create',
      entity: 'document',
      entityId: doc.id,
      accountId: doc.accountId,
    })
    return doc
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    await this.documents.remove(id)
    void writeAudit(this.db, user, { action: 'delete', entity: 'document', entityId: id })
  }
}
