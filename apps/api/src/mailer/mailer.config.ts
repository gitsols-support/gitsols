// Mailer-specific config slice. Kept separate from `appConfig` so the
// MailerService can be unit-tested without pulling in the full app surface.

import { registerAs } from '@nestjs/config'
import { loadEnv } from '../config/env.schema'

export const mailerConfig = registerAs('mailer', () => {
  const env = loadEnv()
  return {
    token: env.POSTMARK_API_TOKEN ?? '',
    from: env.POSTMARK_FROM_ADDRESS ?? '',
    /**
     * Address that gets a copy of every new lead. Falls back to the from
     * address so we never lose a notification when the env is half-set.
     */
    leadNotificationTo: env.LEAD_NOTIFICATION_TO ?? env.POSTMARK_FROM_ADDRESS ?? '',
  }
})
