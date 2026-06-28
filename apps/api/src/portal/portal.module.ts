import { Module } from '@nestjs/common'
import { CrmModule } from '../crm/crm.module'
import { PortalService, PortalController } from './portal'

@Module({
  imports: [CrmModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
