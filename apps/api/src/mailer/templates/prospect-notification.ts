// Notification email sent to LEAD_NOTIFICATION_TO when a prospect completes
// the multistep intake. Richer than the lead notification because the data
// is richer — top priority, requested windows, MFA estimate, etc.

import type { DbProspect } from '../../database/schema/prospects'

interface BuildOptions {
  adminOrigin?: string
}

export function buildProspectNotification(
  prospect: DbProspect,
  opts: BuildOptions = {},
): { subject: string; text: string; html: string } {
  const subject = `New prospect — ${prospect.companyName} (${prospect.intakeFlow})`
  const adminLink = opts.adminOrigin
    ? `${opts.adminOrigin.replace(/\/$/, '')}/admin/prospects/${prospect.id}`
    : `/admin/prospects/${prospect.id}`

  const a = (prospect.intakePayload ?? {}) as Record<string, unknown>

  const summary: [string, string | undefined][] = [
    ['Contact', `${prospect.name} <${prospect.email}>`],
    ['Phone', prospect.phone ?? undefined],
    ['Company', prospect.companyName],
    ['Industry', prospect.industry ?? undefined],
    ['Employees', numStr(prospect.employeeCount)],
    ['Offices', numStr(prospect.officeCount)],
    ['Top priority', prospect.topPriority ?? undefined],
    ['Identity platform', str(a.identityPlatform)],
    ['Endpoints', numStr(a.endpointCount)],
    ['LOB app', str(a.lobApp)],
    ['Backup vendor', str(a.backupVendor)],
    ['Last restore drill', str(a.lastRestoreDrill)],
    ['MFA coverage', a.mfaCoveragePercent != null ? `${a.mfaCoveragePercent}%` : undefined],
    ['Prompts', strList(a.prompts)],
    ['Top priorities (ranked)', strList(a.topPriorities)],
    ['Preferred windows', strList(a.preferredWindows)],
  ]

  const filtered = summary.filter(([, v]) => Boolean(v))

  const text = [
    `New prospect from the marketing site.`,
    ``,
    ...filtered.map(([k, v]) => `${k}: ${v}`),
    ...(a.notesForCall ? ['', 'Notes for the call:', String(a.notesForCall)] : []),
    ``,
    `Open in admin: ${adminLink}`,
  ].join('\n')

  const html = `<!doctype html>
<html lang="en">
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F6F4EE;color:#082F2F;margin:0;padding:24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #E1DDD0;border-radius:6px;overflow:hidden;">
      <tr>
        <td style="background:#082F2F;padding:20px 24px;border-bottom:2px solid #B89968;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:#B89968;font-weight:600;">New prospect · ${escapeHtml(prospect.intakeFlow)}</div>
          <div style="margin-top:8px;font-size:22px;font-weight:700;color:#ffffff;">${escapeHtml(prospect.companyName)}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;">${escapeHtml(prospect.name)} · ${escapeHtml(prospect.email)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          ${renderRows(filtered)}
          ${a.notesForCall ? renderNotes(String(a.notesForCall)) : ''}
          <div style="margin-top:24px;">
            <a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#B89968;color:#082F2F;text-decoration:none;font-weight:600;font-size:13px;padding:11px 18px;border-radius:3px;">Open in admin</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 24px;background:#F6F4EE;font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:#5F6E6D;border-top:1px solid #E1DDD0;">
          Prospect ID · ${escapeHtml(prospect.id)}
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, text, html }
}

function renderRows(rows: [string, string | undefined][]): string {
  return rows
    .map(
      ([k, v]) => `
      <div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid #F1F5F5;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:#8C6F3F;font-weight:600;">${escapeHtml(k)}</div>
        <div style="font-size:13px;color:#082F2F;text-align:right;word-break:break-all;">${escapeHtml(String(v))}</div>
      </div>`,
    )
    .join('')
}

function renderNotes(notes: string): string {
  return `
    <div style="margin-top:16px;padding:14px 16px;background:#F6F4EE;border-left:3px solid #B89968;border-radius:3px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:#8C6F3F;font-weight:600;margin-bottom:6px;">Notes for the call</div>
      <div style="font-size:13px;color:#082F2F;white-space:pre-wrap;line-height:1.5;">${escapeHtml(notes)}</div>
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

function str(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined
  const s = String(v).trim()
  return s.length > 0 ? s : undefined
}

function numStr(v: unknown): string | undefined {
  if (typeof v !== 'number' || !Number.isFinite(v)) return undefined
  return String(v)
}

function strList(v: unknown): string | undefined {
  if (!Array.isArray(v) || v.length === 0) return undefined
  return v.map((x) => String(x)).join(', ')
}
