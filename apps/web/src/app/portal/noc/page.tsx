// /portal/noc — client-facing NOC view.
//
// What the client sees of their own NOC posture: fleet rollup, endpoint
// grid for their account, redacted open alerts, and the runbooks we've
// explicitly marked as client-visible. Mirrors the staff console but
// scopes everything to the signed-in user's `accountId`.
//
// Phase 3 wires this to `/api/v1/noc/portal/*`. For now we render a
// scoped slice of the same stub data the admin uses so the design is
// reviewable end-to-end.

import Link from 'next/link'
import {
  RadioTower,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Server,
  Wifi,
  ArrowUpRight,
  Phone,
  ClipboardList,
} from 'lucide-react'
import Wordmark from '@/components/marketing/Wordmark'
import { NOC_ALERT_FEED, NOC_ENDPOINTS, NOC_RUNBOOK_LIBRARY } from '@/server/noc-stubs'

// Phase 3: derive from the signed-in user's accountId.
const DEMO_CLIENT_ID = 'c_001'
const DEMO_CLIENT_NAME = 'Riverside Medical Group'

export default function PortalNocPage() {
  const myEndpoints = NOC_ENDPOINTS.filter((e) => e.clientId === DEMO_CLIENT_ID)
  const myAlerts = NOC_ALERT_FEED.filter((a) => a.clientId === DEMO_CLIENT_ID)
  const clientVisibleRunbooks = NOC_RUNBOOK_LIBRARY.filter(
    (r) => r.audience === 'client_visible' || r.audience === 'both',
  )

  const rollup = {
    total: myEndpoints.length,
    healthy: myEndpoints.filter((e) => e.status === 'healthy').length,
    warning: myEndpoints.filter((e) => e.status === 'warning').length,
    critical: myEndpoints.filter((e) => e.status === 'critical').length,
  }

  return (
    <div className="min-h-screen bg-[#F4F8F7]">
      {/* Top banner — same recipe as AuthShell */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C4C] via-[#0A3A3A] to-[#070F2C]" />
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #155E5E 0%, transparent 40%), radial-gradient(circle at 80% 70%, #14B8A6 0%, transparent 35%)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden
        />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10 py-10 text-white">
          <div className="flex items-center justify-between mb-8">
            <Link href="/portal" className="inline-block">
              <Wordmark tone="dark" height={32} />
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#14B8A6]">
              Client portal · NOC
            </span>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#14B8A6]">
            Network Operations Center · live
          </p>
          <h1
            className="mt-3 font-serif text-3xl xl:text-4xl leading-[1.04] tracking-[-0.022em]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {DEMO_CLIENT_NAME}
            <br />
            <span className="text-[#14B8A6]">at a glance.</span>
          </h1>
          <p className="mt-4 text-[14px] text-white/65 max-w-2xl leading-relaxed">
            Every managed endpoint reports to the GITSOLS NOC every 60 minutes.
            Below is what we see right now — no marketing, no theater. Click
            into an alert for the runbook our engineer is following.
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            <PortalRollup label="Endpoints" value={rollup.total} tone="default" />
            <PortalRollup label="Healthy" value={rollup.healthy} tone="good" />
            <PortalRollup label="Warning" value={rollup.warning} tone="warn" />
            <PortalRollup label="Critical" value={rollup.critical} tone="bad" />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10 space-y-8">
        {/* Active alerts */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-[22px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
              Active alerts
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
              {myAlerts.length} open
            </span>
          </div>
          <div className="bg-white border border-[#D5E0DE] rounded-[4px] overflow-hidden">
            {myAlerts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#0F766E] mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-[#0F4C4C]">All clear.</p>
                <p className="text-[12.5px] text-[#5F6E6D] mt-1">
                  No open alerts across your fleet.
                </p>
              </div>
            ) : (
              <ul>
                {myAlerts.map((a, i) => (
                  <li
                    key={a.id}
                    className={`px-6 py-4 ${i < myAlerts.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-[3px] border flex-shrink-0 ${
                          a.severity === 'critical'
                            ? 'text-red-600 bg-red-50 border-red-100'
                            : 'text-amber-700 bg-amber-50 border-amber-100'
                        }`}
                      >
                        {a.severity === 'critical' ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 flex-wrap">
                          <p className="text-[13.5px] font-semibold text-[#0F4C4C] leading-tight">
                            {a.title}
                          </p>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D]">
                            {a.timeAgo}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] text-[#5F6E6D] leading-relaxed">
                          {a.summary}
                        </p>
                        <div className="mt-2 flex items-center gap-3 flex-wrap font-mono text-[10px] uppercase tracking-[0.16em] text-[#0F766E]">
                          <span>{a.endpointHostname}</span>
                          {a.runbookSlug && (
                            <>
                              <span className="text-[#D5E0DE]">·</span>
                              <Link
                                href={`/portal/noc/runbooks/${a.runbookSlug}` as never}
                                className="text-[#0F4C4C] hover:text-[#082F2F] underline decoration-dotted"
                              >
                                what we're doing about it →
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Endpoint grid */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-[22px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
              Your endpoints
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
              {myEndpoints.length} devices
            </span>
          </div>
          <div className="bg-white border border-[#D5E0DE] rounded-[4px] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
                <tr>
                  <Th>Device</Th>
                  <Th>Kind</Th>
                  <Th>Status</Th>
                  <Th>Last check</Th>
                </tr>
              </thead>
              <tbody>
                {myEndpoints.map((e, i) => {
                  const Icon =
                    e.kind === 'server' ? Server : e.kind === 'network_device' ? Wifi : Cpu
                  return (
                    <tr
                      key={e.id}
                      className={`hover:bg-[#F4F8F7]/60 transition-colors ${i < myEndpoints.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                    >
                      <Td>
                        <span className="inline-flex items-center gap-2 font-mono text-[12px] font-semibold text-[#0F4C4C]">
                          <Icon className="w-3.5 h-3.5 text-[#0F766E]" />
                          {e.hostname}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D]">
                          {e.kind.replace('_', ' ')}
                        </span>
                      </Td>
                      <Td>
                        <StatusPill status={e.status} />
                      </Td>
                      <Td>
                        <span className="font-mono text-[11px] text-[#5F6E6D]">
                          {fmtAgo(e.lastHeartbeatAt)}
                        </span>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Runbooks visible to clients */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-[22px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
              Self-serve guides
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
              {clientVisibleRunbooks.length} guides
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clientVisibleRunbooks.map((r) => (
              <Link
                key={r.id}
                href={`/portal/noc/runbooks/${r.slug}` as never}
                className="group block bg-white border border-[#D5E0DE] hover:border-[#0F766E]/40 rounded-[4px] p-5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex-shrink-0">
                    <ClipboardList className="w-3.5 h-3.5 text-[#0F4C4C]" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#0F4C4C] leading-tight group-hover:text-[#082F2F]">
                      {r.title}
                    </p>
                    <p className="text-[12px] text-[#5F6E6D] mt-1 line-clamp-2">{r.summary}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#5F6E6D] group-hover:text-[#0F4C4C] flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Call NOC CTA */}
        <section className="bg-white border border-[#D5E0DE] rounded-[4px] p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-[3px] bg-[#ECFEFE] border border-[#CFFAFA]">
              <RadioTower className="w-4 h-4 text-[#0F4C4C]" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-[#0F4C4C]">Need to talk to a human?</p>
              <p className="text-[12px] text-[#5F6E6D]">
                The GITSOLS NOC is staffed 24/7 for current clients.
              </p>
            </div>
          </div>
          <a
            href="tel:8885030666"
            className="inline-flex items-center gap-2 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[12.5px] font-semibold px-4 py-2.5 rounded-[3px] transition-colors border border-[#082F2F]"
          >
            <Phone className="w-3.5 h-3.5" />
            888-503-0666
          </a>
        </section>
      </main>
    </div>
  )
}

// ─── Small inline components ──────────────────────────────────────────────

function PortalRollup({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'good' | 'warn' | 'bad' | 'default'
}) {
  const valueColor =
    tone === 'good'
      ? 'text-[#14B8A6]'
      : tone === 'warn'
        ? 'text-amber-300'
        : tone === 'bad'
          ? 'text-red-300'
          : 'text-white'
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-[3px] px-3 py-2.5">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/50">{label}</p>
      <p className={`mt-1 font-serif text-[28px] leading-none tracking-[-0.018em] ${valueColor}`}>
        {value}
      </p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium">
      {children}
    </th>
  )
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-6 py-3.5">{children}</td>
}

function StatusPill({
  status,
}: {
  status: 'healthy' | 'warning' | 'critical' | 'offline' | 'unenrolled'
}) {
  const cfg = {
    healthy: { bg: 'bg-[#ECFEFE]', text: 'text-[#0F4C4C]', border: 'border-[#CFFAFA]', label: 'Healthy' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', label: 'Warning' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', label: 'Critical' },
    offline: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: 'Offline' },
    unenrolled: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'Unenrolled' },
  } as const
  const c = cfg[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
    </span>
  )
}

function fmtAgo(iso?: string): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
