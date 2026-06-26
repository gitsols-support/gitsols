// Lead-notification template — sent to LEAD_NOTIFICATION_TO on every new lead.
//
// Keep templates as pure functions of their data so they're trivial to test
// and to regenerate after copy changes. No JSX, no HTML strings sprawled
// across the codebase.

import type { DbLead } from '../../database/schema/leads'

interface BuildOptions {
  /**
   * Public origin of the admin app — used for the "Open in admin" deeplink
   * in the notification body. Falls back to a relative path if not provided.
   */
  adminOrigin?: string
}

export function buildLeadNotification(
  lead: DbLead,
  opts: BuildOptions = {},
): { subject: string; text: string; html: string } {
  const subject = `New lead — ${lead.name} (${lead.source})`
  const adminLink = opts.adminOrigin
    ? `${opts.adminOrigin.replace(/\/$/, '')}/admin/leads/${lead.id}`
    : `/admin/leads/${lead.id}`

  const fields: [string, string | null | undefined][] = [
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Company', lead.company],
    ['Service interest', lead.serviceInterest],
    ['Industry', lead.industry],
    ['Source', lead.source],
    ['Submitted from', lead.sourceUrl],
    ['IP', lead.ipAddress],
  ]

  const text = [
    `New lead from the marketing site.`,
    ``,
    ...fields
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => `${k}: ${v}`),
    ...(lead.message ? ['', 'Message:', lead.message] : []),
    ``,
    `Open in admin: ${adminLink}`,
  ].join('\n')

  const html = `<!doctype html>
<html lang="en">
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F8FAFA;color:#042F2E;margin:0;padding:24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E2E8E8;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="background:#0F4C4C;padding:18px 24px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#CFFAFA;font-weight:700;">New lead · marketing site</div>
          <div style="margin-top:6px;font-size:20px;font-weight:700;color:#ffffff;">${escapeHtml(lead.name)}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:2px;">${escapeHtml(lead.email)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          ${renderFields(fields)}
          ${lead.message ? renderMessage(lead.message) : ''}
          <div style="margin-top:24px;">
            <a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#14B8A6;color:#ffffff;text-decoration:none;font-weight:600;font-size:13px;padding:10px 16px;border-radius:10px;">Open in admin</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 24px;background:#F1F5F5;font-size:11px;color:#5F7676;">
          Lead ID: <code style="font-family:monospace;">${escapeHtml(lead.id)}</code>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, text, html }
}

function renderFields(fields: [string, string | null | undefined][]): string {
  return fields
    .filter(([, v]) => Boolean(v))
    .map(
      ([k, v]) => `
      <div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid #F1F5F5;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#14B8A6;font-weight:700;">${escapeHtml(k)}</div>
        <div style="font-size:13px;color:#042F2E;text-align:right;word-break:break-all;">${escapeHtml(String(v))}</div>
      </div>`,
    )
    .join('')
}

function renderMessage(message: string): string {
  return `
    <div style="margin-top:16px;padding:16px;background:#ECFEFE;border:1px solid #CFFAFA;border-radius:10px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#14B8A6;font-weight:700;margin-bottom:6px;">Message</div>
      <div style="font-size:13px;color:#042F2E;white-space:pre-wrap;">${escapeHtml(message)}</div>
    </div>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
