// Mailer module — registers the Postmark-backed MailerService globally so
// any feature module can inject it without importing this module explicitly.

import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailerService } from './mailer.service'
import { mailerConfig } from './mailer.config'

@Global()
@Module({
  imports: [ConfigModule.forFeature(mailerConfig)],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
