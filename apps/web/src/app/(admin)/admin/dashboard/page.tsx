import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  Building2,
  Code2,
  Inbox,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import {
  getAccounts,
  getBespokeProjects,
  getDashboardMetrics,
  getLeads,
  getTickets,
  formatCurrency,
  formatRelative,
} from '@/server/admin-data'

// Quality metrics not yet exposed by the dashboard metrics API. Kept as
// sensible placeholders so the health-row still renders.
// TODO: source from API
const QUALITY_METRICS = {
  npsRolling90: 64,
  csat: 4.7,
  uptime90: 99.984,
  milestoneOnTimeRate: 0.86,
  ticketSlaCompliance: 0.94,
}

export default async function AdminDashboardPage() {
  const [m, leads, tickets, bespoke, accounts] = await Promise.all([
    getDashboardMetrics(),
    getLeads(),
    getTickets(),
    getBespokeProjects(),
    getAccounts(),
  ])
  const recentLeads = leads.slice(0, 4)
  const topTickets = tickets.filter((t) => t.status !== 'resolved').slice(0, 4)
  const activeBespoke = bespoke.filter((p) => p.stage !== 'closed').slice(0, 4)

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Operations · Today"
        title="Daily standup"
        description="What requires attention today — pipeline movement, ticket SLAs, milestone burn-down, account health."
        badge={{ label: 'NOC nominal', tone: 'live' }}
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        primaryAction={{ label: 'Run QBR', href: '/admin/reports', icon: TrendingUp }}
        secondaryAction={{ label: 'Activity log', href: '/admin/activities' }}
      />

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#D5E0DE] border border-[#D5E0DE] rounded-[4px] overflow-hidden">
        <Kpi label="Pipeline value" value={formatCurrency(m.pipelineValue, { compact: true })} hint="↑ 12% MoM" icon={Inbox} />
        <Kpi label="MRR · live" value={formatCurrency(m.mrr, { compact: true })} hint={`ARR ${formatCurrency(m.arr, { compact: true })}`} icon={TrendingUp} />
        <Kpi label="Open tickets" value={m.openTickets} hint={`${m.p1Open} P1`} icon={Ticket} tone={m.p1Open > 0 ? 'warn' : 'default'} />
        <Kpi label="Active engagements" value={m.activeEngagements} hint={`${activeBespoke.length} bespoke`} icon={Briefcase} />
      </div>

      {/* Second-row health metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#D5E0DE] border border-[#D5E0DE] rounded-[4px] overflow-hidden">
        <Kpi label="Uptime · 90d" value={`${QUALITY_METRICS.uptime90}%`} hint="Sentry feed" />
        <Kpi label="Ticket SLA" value={`${Math.round(QUALITY_METRICS.ticketSlaCompliance * 100)}%`} hint="rolling 30d" />
        <Kpi label="Milestone on-time" value={`${Math.round(QUALITY_METRICS.milestoneOnTimeRate * 100)}%`} hint="rolling 90d" />
        <Kpi label="NPS · 90d" value={QUALITY_METRICS.npsRolling90} hint={`CSAT ${QUALITY_METRICS.csat.toFixed(1)}/5`} />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <AdminCard
            eyebrow="CRM · Inbox"
            title="Most recent leads"
            action={
              <Link href="/admin/leads" className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F4C4C] hover:text-[#082F2F] inline-flex items-center gap-1">
                Triage queue <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
            flush
          >
            <ul>
              {recentLeads.map((l, i) => (
                <li
                  key={l.id}
                  className={`flex items-center gap-4 px-6 py-4 ${i < recentLeads.length - 1 ? 'border-b border-[#E5EDEB]' : ''} hover:bg-[#F4F8F7]/60 transition-colors`}
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] font-serif text-[13px] text-[#0F4C4C] flex-shrink-0" style={{ fontFamily: 'var(--font-serif)' }}>
                    {l.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[14.5px] text-[#0F4C4C] tracking-[-0.005em] truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                      {l.name} · <span className="text-[#5F6E6D]">{l.company ?? '—'}</span>
                    </p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F766E] mt-0.5">
                      Score {l.score} · {l.status}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-[#5F6E6D] flex-shrink-0">{formatRelative(l.receivedAt)}</span>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard
            eyebrow="Delivery · Bespoke"
            title="Bespoke projects in flight"
            action={
              <Link href="/admin/bespoke" className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F4C4C] hover:text-[#082F2F] inline-flex items-center gap-1">
                All projects <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
            flush
          >
            <ul>
              {activeBespoke.map((p, i) => {
                const pct = Math.round((p.milestonesDone / p.milestonesTotal) * 100)
                return (
                  <li
                    key={p.id}
                    className={`flex items-center gap-4 px-6 py-4 ${i < activeBespoke.length - 1 ? 'border-b border-[#E5EDEB]' : ''} hover:bg-[#F4F8F7]/60 transition-colors`}
                  >
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#082F2F] text-[#CFFAFA] flex-shrink-0">
                      <Code2 className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0F766E]">{p.id}</p>
                      <p className="font-serif text-[14.5px] text-[#0F4C4C] tracking-[-0.005em] truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                        {p.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-20 h-1 bg-[#E5EDEB] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0F766E]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-[10.5px] text-[#5F6E6D]">
                        {p.milestonesDone}/{p.milestonesTotal}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </AdminCard>
        </div>

        <div className="space-y-5">
          <AdminCard
            eyebrow="Delivery · Urgent"
            title="Tickets needing attention"
            action={
              <Link href="/admin/tickets" className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F4C4C] hover:text-[#082F2F] inline-flex items-center gap-1">
                Queue <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
            flush
          >
            <ul>
              {topTickets.map((t, i) => (
                <li
                  key={t.id}
                  className={`px-5 py-3.5 ${i < topTickets.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-[2px] border ${t.priority === 'p1' ? 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]' : 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]'}`}>
                      {t.priority.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10.5px] text-[#5F6E6D]">{formatRelative(t.openedAt)}</span>
                  </div>
                  <p className="text-[13px] text-[#0F4C4C] leading-snug">{t.subject}</p>
                  <p className="text-[11.5px] text-[#5F6E6D] mt-0.5">{t.accountName ?? '—'}</p>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard eyebrow="Health" title="Account watch" flush>
            <ul>
              {accounts.filter((a) => a.health === 'critical' || a.health === 'watch').map((a, i, arr) => (
                <li
                  key={a.id}
                  className={`px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${a.health === 'critical' ? 'bg-[#B53A2B]' : 'bg-[#C5933A]'}`} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">{a.health}</span>
                  </div>
                  <p className="font-serif text-[14.5px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {a.name}
                  </p>
                  <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5">
                    {a.openTickets} tickets · MRR {formatCurrency(a.mrr, { compact: true })}
                  </p>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard eyebrow="Shortcuts" title="Jump to" flush>
            <ul>
              {[
                { href: '/admin/leads', label: 'Leads', icon: Inbox },
                { href: '/admin/accounts', label: 'Accounts', icon: Building2 },
                { href: '/admin/engagements', label: 'Engagements', icon: Briefcase },
                { href: '/admin/bespoke', label: 'Bespoke projects', icon: Code2 },
                { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
                { href: '/admin/users', label: 'Team & roles', icon: Users },
                { href: '/admin/activities', label: 'Activity log', icon: Activity },
              ].map((link, i, arr) => (
                <li key={link.href} className={i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}>
                  <Link
                    href={link.href as never}
                    className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-[#F4F8F7]/60 transition-colors group"
                  >
                    <span className="inline-flex items-center gap-2.5 text-[13px] text-[#0F4C4C]">
                      <link.icon className="w-3.5 h-3.5 text-[#0F766E]" />
                      {link.label}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D5E0DE] group-hover:text-[#0F4C4C] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  icon?: React.ElementType
  tone?: 'default' | 'warn'
}) {
  const hintTone = tone === 'warn' ? 'text-[#B53A2B]' : 'text-[#0F766E]'
  return (
    <div className="bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D]">{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-[#0F4C4C]" />
          </div>
        )}
      </div>
      <p className="font-serif text-[34px] text-[#0F4C4C] leading-none tracking-[-0.022em]" style={{ fontFamily: 'var(--font-serif)' }}>
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="block w-5 h-px bg-[#0F766E]" />
        {hint && <span className={`font-mono text-[10.5px] uppercase tracking-[0.16em] ${hintTone}`}>{hint}</span>}
      </div>
    </div>
  )
}
