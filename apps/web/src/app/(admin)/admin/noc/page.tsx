// /admin/noc — NOC Console (dashboard).
//
// Live fleet rollup, open alerts feed, and per-client status grid. Phase 2
// will hydrate from `/api/v1/noc/admin/rollup` + `/alerts` + `/endpoints`;
// for now this renders against `noc-stubs.ts` so the design is reviewable.

import Link from 'next/link'
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Lock,
  Wifi,
  Server,
  ArrowUpRight,
  Activity,
  Settings,
  ClipboardList,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import {
  NOC_ALERT_FEED,
  NOC_CLIENTS,
  NOC_ROLLUP,
  type NocAlertFeedItem,
} from '@/server/noc-stubs'

export default function NocConsolePage() {
  const r = NOC_ROLLUP
  const overall = r.critical > 0 ? 'critical' : r.warning > 0 ? 'warn' : 'healthy'

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="NOC · Live"
        title="GITSOLS Network Operations Center"
        description="Live signals from every managed endpoint. Every check traces to an open-source primitive (osquery, Telegraf, SNMP) and a HIPAA / PCI / SOC control."
        badge={{
          label:
            overall === 'critical' ? 'Critical' : overall === 'warn' ? 'Degraded' : 'Nominal',
          tone: overall === 'critical' ? 'warn' : overall === 'warn' ? 'warn' : 'live',
        }}
        breadcrumbs={[{ label: 'Admin' }, { label: 'NOC' }]}
        primaryAction={{ label: 'Open configurator', href: '/admin/noc/configurator', icon: Settings }}
        secondaryAction={{ label: 'Runbook library', href: '/admin/noc/runbooks' }}
      />

      {/* Headline fleet rollup */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-[#D5E0DE] border border-[#D5E0DE] rounded-[4px] overflow-hidden">
        <Rollup label="Endpoints" value={r.total} hint={`${NOC_CLIENTS.length} clients`} icon={Server} />
        <Rollup label="Healthy" value={r.healthy} hint="green" icon={CheckCircle2} tone="good" />
        <Rollup label="Warning" value={r.warning} hint={`${r.warning > 0 ? 'attention' : 'none'}`} icon={AlertTriangle} tone="warn" />
        <Rollup label="Critical" value={r.critical} hint={`${r.openAlerts} alerts open`} icon={ShieldAlert} tone="bad" />
        <Rollup label="Offline" value={r.offline} hint="last hb > 5m" icon={Wifi} tone="muted" />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Alert feed — left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          <AdminCard
            eyebrow="NOC · Triage queue"
            title="Open alerts"
            description="Auto-deduped per (endpoint × check). Acknowledge to silence, resolve to close."
            action={
              <Link
                href={'/admin/noc/alerts' as never}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F4C4C] hover:text-[#082F2F] inline-flex items-center gap-1"
              >
                All alerts <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
            flush
          >
            <ul>
              {NOC_ALERT_FEED.map((a, i) => (
                <li
                  key={a.id}
                  className={`px-6 py-4 hover:bg-[#F4F8F7]/60 transition-colors ${i < NOC_ALERT_FEED.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <AlertRow alert={a} />
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard
            eyebrow="Signal stream"
            title="Last 24h coverage"
            description="Pass rate by check category across the active fleet."
          >
            <CategoryStripChart />
          </AdminCard>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          <AdminCard eyebrow="Clients · NOC" title="Per-client status" flush>
            <ul>
              {NOC_CLIENTS.map((c, i) => (
                <li
                  key={c.id}
                  className={`flex items-center justify-between px-6 py-3.5 hover:bg-[#F4F8F7]/60 transition-colors ${i < NOC_CLIENTS.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <Link href={`/admin/noc/configurator/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusDot status={c.status} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#0F4C4C] truncate">{c.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D]">
                        {c.industry.replace(/-/g, ' ')} · {c.endpointCount} endpoints
                      </p>
                    </div>
                  </Link>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#5F6E6D]" />
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard eyebrow="Pipeline" title="What the agent does">
            <ol className="space-y-3 text-[12.5px] text-[#5F6E6D]">
              <PipelineStep n={1} icon={Cpu} title="osquery tick" body="200+ SQL-queryable tables. Cross-platform." />
              <PipelineStep n={2} icon={Lock} title="Ed25519 sign" body="Signed payload, nonce, ±5min skew window." />
              <PipelineStep n={3} icon={Activity} title="Ingest" body="Append-only heartbeat. Latest result per (endpoint, check)." />
              <PipelineStep n={4} icon={ShieldAlert} title="Open / close alert" body="Idempotent dedup by (endpoint, check)." />
              <PipelineStep n={5} icon={ClipboardList} title="Runbook attached" body="Linked at alert open. Internal + client-facing variants." />
            </ol>
            <Link
              href="/admin/noc/runbooks"
              className="mt-5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#0F4C4C] hover:text-[#082F2F]"
            >
              Browse runbooks <ArrowUpRight className="w-3 h-3" />
            </Link>
          </AdminCard>

          <AdminCard eyebrow="Open source" title="What's actually running">
            <ul className="text-[12.5px] text-[#5F6E6D] space-y-2">
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-[#0F766E] uppercase tracking-[0.18em]">Agent</span>
                <span>osquery + custom Go wrapper</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-[#0F766E] uppercase tracking-[0.18em]">Metrics</span>
                <span>Telegraf · VictoriaMetrics</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-[#0F766E] uppercase tracking-[0.18em]">Logs</span>
                <span>Vector → Loki</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-[#0F766E] uppercase tracking-[0.18em]">Network</span>
                <span>LibreNMS · SNMP polling</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-[#0F766E] uppercase tracking-[0.18em]">M365</span>
                <span>CIPP multi-tenant</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-[#0F766E] uppercase tracking-[0.18em]">SIEM</span>
                <span>Wazuh (Phase 2)</span>
              </li>
            </ul>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}

// ─── Inline sub-components ────────────────────────────────────────────────

function Rollup({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: number | string
  hint?: string
  icon: React.ElementType
  tone?: 'default' | 'good' | 'warn' | 'bad' | 'muted'
}) {
  const valueColor =
    tone === 'good'
      ? 'text-[#0F766E]'
      : tone === 'warn'
        ? 'text-amber-600'
        : tone === 'bad'
          ? 'text-red-600'
          : tone === 'muted'
            ? 'text-[#5F6E6D]'
            : 'text-[#0F4C4C]'
  return (
    <div className="bg-white px-5 py-4">
      <div className="flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
          {label}
        </p>
        <Icon className={`w-3.5 h-3.5 ${valueColor}`} />
      </div>
      <p
        className={`mt-2 font-serif text-[32px] leading-none tracking-[-0.018em] ${valueColor}`}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#0F766E]">
          {hint}
        </p>
      )}
    </div>
  )
}

function StatusDot({ status }: { status: 'healthy' | 'warning' | 'critical' | 'offline' }) {
  const color =
    status === 'healthy'
      ? 'bg-[#14B8A6]'
      : status === 'warning'
        ? 'bg-amber-500'
        : status === 'critical'
          ? 'bg-red-500'
          : 'bg-gray-300'
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${color} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
}

function AlertRow({ alert: a }: { alert: NocAlertFeedItem }) {
  const severityColors: Record<string, string> = {
    critical: 'text-red-600 bg-red-50 border-red-100',
    warn: 'text-amber-700 bg-amber-50 border-amber-100',
    info: 'text-[#0F4C4C] bg-[#ECFEFE] border-[#CFFAFA]',
  }
  return (
    <div className="flex items-start gap-3">
      <span
        className={`inline-flex items-center justify-center w-9 h-9 rounded-[3px] border flex-shrink-0 ${severityColors[a.severity]}`}
      >
        {a.severity === 'critical' ? (
          <ShieldAlert className="w-4 h-4" />
        ) : (
          <AlertTriangle className="w-4 h-4" />
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="text-[13.5px] font-semibold text-[#0F4C4C] leading-tight">{a.title}</p>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D]">{a.timeAgo}</span>
        </div>
        <p className="mt-1 text-[12.5px] text-[#5F6E6D] leading-relaxed">{a.summary}</p>
        <div className="mt-2 flex items-center gap-3 flex-wrap font-mono text-[10px] uppercase tracking-[0.16em] text-[#0F766E]">
          <span>{a.endpointHostname}</span>
          <span className="text-[#D5E0DE]">·</span>
          <span>{a.clientName}</span>
          <span className="text-[#D5E0DE]">·</span>
          <span className="text-[#5F6E6D]">{a.checkSlug}</span>
          {a.runbookSlug && (
            <>
              <span className="text-[#D5E0DE]">·</span>
              <Link
                href={`/admin/noc/runbooks/${a.runbookSlug}`}
                className="text-[#0F4C4C] hover:text-[#082F2F] underline decoration-dotted"
              >
                runbook ↗
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PipelineStep({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number
  icon: React.ElementType
  title: string
  body: string
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#0F4C4C]" />
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-[#0F4C4C] leading-tight">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0F766E] mr-2">
            {String(n).padStart(2, '0')}
          </span>
          {title}
        </p>
        <p className="text-[12px] text-[#5F6E6D] leading-relaxed mt-0.5">{body}</p>
      </div>
    </li>
  )
}

function CategoryStripChart() {
  // 9 categories x pass rate. Stub data — will pivot from results table.
  const rows = [
    { cat: 'Encryption', pct: 98 },
    { cat: 'Patching', pct: 86 },
    { cat: 'Identity', pct: 91 },
    { cat: 'EDR / AV', pct: 94 },
    { cat: 'Backup', pct: 89 },
    { cat: 'Network', pct: 96 },
    { cat: 'LOB apps', pct: 92 },
    { cat: 'Compliance', pct: 88 },
    { cat: 'Inventory', pct: 99 },
  ]
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.cat} className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D] w-28 flex-shrink-0">
            {r.cat}
          </span>
          <div className="flex-1 h-2 rounded-full bg-[#F4F8F7] overflow-hidden border border-[#D5E0DE]">
            <div
              className={`h-full ${r.pct >= 95 ? 'bg-[#14B8A6]' : r.pct >= 85 ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{ width: `${r.pct}%` }}
            />
          </div>
          <span className="font-mono text-[11px] font-semibold text-[#0F4C4C] w-10 text-right">{r.pct}%</span>
        </li>
      ))}
    </ul>
  )
}
