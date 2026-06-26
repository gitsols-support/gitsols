import { Module } from '@nestjs/common'
import { NocIngestController } from './noc-ingest.controller'
import { NocEnrollmentController } from './noc-enrollment.controller'
import { NocAdminController } from './noc-admin.controller'
import { NocPortalController } from './noc-portal.controller'
import { NocService } from './noc.service'
import { NocSignatureService } from './noc-signature.service'

@Module({
  controllers: [
    NocIngestController,
    NocEnrollmentController,
    NocAdminController,
    NocPortalController,
  ],
  providers: [NocService, NocSignatureService],
  exports: [NocService],
})
export class NocModule {}
