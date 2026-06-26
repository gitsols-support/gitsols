// Postmark mailer — thin wrapper around the official client.
//
// The service is always provided; it just no-ops with a structured log when
// POSTMARK_API_TOKEN is empty. That keeps dev environments runnable without
// secrets and means feature code never has to branch on "is mail wired?".

import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { ServerClient, Models } from 'postmark'
import { appConfig } from '../config/app.config'
import { mailerConfig } from './mailer.config'

export interface SendEmailInput {
  to: string | string[]
  /** Optional Reply-To override. Defaults to the from address. */
  replyTo?: string
  subject: string
  /** Plain-text body. Sent alongside HTML if both are present. */
  text?: string
  /** HTML body. If only text is provided we send it as plain. */
  html?: string
  /** Postmark message stream — default is 'outbound' (transactional). */
  messageStream?: 'outbound' | 'broadcast' | string
  /** Optional Postmark tag for filtering in the dashboard. */
  tag?: string
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  private readonly client: ServerClient | null
  private readonly from: string | null

  constructor(
    @Inject(mailerConfig.KEY)
    private readonly mailCfg: ConfigType<typeof mailerConfig>,
    @Inject(appConfig.KEY)
    private readonly appCfg: ConfigType<typeof appConfig>,
  ) {
    if (mailCfg.token && mailCfg.from) {
      this.client = new ServerClient(mailCfg.token)
      this.from = mailCfg.from
    } else {
      this.client = null
      this.from = null
    }
  }

  /**
   * Send an email. Resolves with `{ skipped: true }` if Postmark isn't
   * configured — that's intentional, callers should treat send failures as
   * non-fatal (the user-facing form still succeeds; we'll see the lead in
   * the DB regardless).
   */
  async send(
    input: SendEmailInput,
  ): Promise<{ sent: true; messageId: string } | { sent: false; reason: string }> {
    if (!this.client || !this.from) {
      this.logger.warn(
        { to: redactRecipients(input.to), subject: input.subject },
        'Postmark not configured — email skipped',
      )
      return { sent: false, reason: 'postmark_not_configured' }
    }

    try {
      const res = await this.client.sendEmail({
        From: this.from,
        To: Array.isArray(input.to) ? input.to.join(', ') : input.to,
        ReplyTo: input.replyTo ?? this.from,
        Subject: input.subject,
        TextBody: input.text,
        HtmlBody: input.html,
        MessageStream: input.messageStream ?? 'outbound',
        Tag: input.tag,
        TrackOpens: false,
        TrackLinks: Models.LinkTrackingOptions.None,
      })
      this.logger.log(
        {
          messageId: res.MessageID,
          to: redactRecipients(input.to),
          subject: input.subject,
          env: this.appCfg.env,
        },
        'email.sent',
      )
      return { sent: true, messageId: res.MessageID }
    } catch (err) {
      this.logger.error({ err, subject: input.subject }, 'email.send_failed')
      return { sent: false, reason: err instanceof Error ? err.message : 'unknown' }
    }
  }
}

// Redact the user portion of recipient emails for log lines that may end up
// in low-trust log aggregators. Pino-level redaction already covers the
// `*.email` field elsewhere; this is a per-call belt-and-suspenders.
function redactRecipients(to: string | string[]): string {
  const list = Array.isArray(to) ? to : [to]
  return list
    .map((addr) => {
      const [user, domain] = addr.split('@')
      if (!domain) return '<malformed>'
      const head = user?.slice(0, 2) ?? ''
      return `${head}***@${domain}`
    })
    .join(', ')
}
