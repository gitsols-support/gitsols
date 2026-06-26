// Database module — wraps DatabaseService and re-exports it globally so
// every feature module can inject it without explicit import boilerplate.

import { Global, Module } from '@nestjs/common'
import { DatabaseService } from './database.service'

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
