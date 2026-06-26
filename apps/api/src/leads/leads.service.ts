// Leads service — persists submissions and fires the new-lead notification.
//
// Phase 1 scope:
//   - Insert into `leads` table.
//   - Pino-log a structured "lead.created" event so ops sees activity.
//   - Email the LEAD_NOTIFICATION_TO inbox via Postmark (no-op when not configured).
//
// Mail send is best-effort: if Postmark fails we log it but never fail the
// HTTP request — the user-facing form should always succeed once the row is
// in the database.
//
// Phase 2 adds: dedup against existing contacts, automatic lead scoring,
// attribution-channel rollup, Slack notifications.

import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { DatabaseService } from '../database/database.service'
import { leads, type DbLead, type NewDbLead } from '../database/schema/leads'
import { MailerService } from '../mailer/mailer.service'
import { mailerConfig } from '../mailer/mailer.config'
import { buildLeadNotification } from '../mailer/templates/lead-notification'

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly mailer: MailerService,
    @Inject(mailerConfig.KEY)
    private readonly mailCfg: ConfigType<typeof mailerConfig>,
  ) {}

  async create(input: NewDbLead): Promise<DbLead> {
    const [row] = await this.db.db.insert(leads).values(input).returning()
    if (!row) {
      throw new Error('Insert returned no row')
    }
    this.logger.log(
      {
        leadId: row.id,
        source: row.source,
        serviceInterest: row.serviceInterest,
        industry: row.industry,
      },
      'lead.created',
    )

    // Fire-and-don't-await — we don't want a slow Postmark response to back
    // up the request thread. Errors are swallowed; the MailerService logs
    // them at error level.
    void this.notify(row).catch((err) => {
      this.logger.error({ err, leadId: row.id }, 'lead.notify_failed')
    })

    return row
  }

  private async notify(lead: DbLead): Promise<void> {
    if (!this.mailCfg.leadNotificationTo) return
    const { subject, text, html } = buildLeadNotification(lead)
    await this.mailer.send({
      to: this.mailCfg.leadNotificationTo,
      replyTo: lead.email,
      subject,
      text,
      html,
      tag: `lead:${lead.source}`,
    })
  }
}
