import type { Metadata } from 'next'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { DASHBOARD_METRICS, formatCurrency } from '@/server/admin-stubs'

export const metadata: Metadata = { title: 'Reports · Admin' }

const PIPELINE_BY_STAGE = [
  { stage: 'New', value: 180_000 },
  { stage: 'Qualified', value: 320_000 },
  { stage: 'Proposal', value: 410_000 },
  { stage: 'SoW Sent', value: 230_000 },
  { stage: 'Closed Won', value: 95_000 },
]

const SAVED_REPORTS = [
  { name: 'Pipeline weekly · by stage', last: 'auto · Mon 7:00 ET' },
  { name: 'MRR & churn · monthly', last: 'auto · 1st of month' },
  { name: 'Ticket SLA · rolling 30d', last: 'updated 4h ago' },
  { name: 'Milestone burn-down · all engagements', last: 'updated 7m ago' },
  { name: 'NPS / CSAT · rolling 90d', last: 'updated 1d ago' },
  { name: 'Tech utilization · monthly', last: 'auto · 1st of month' },
]

export default function AdminReportsPage() {
  const m = DASHBOARD_METRICS
  const maxStageValue = Math.max(...PIPELINE_BY_STAGE.map((s) => s.value))

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Insight · Reports"
        title="Reports & analytics"
        description="Pipeline value, MRR/ARR, churn, engagement health, NPS, ticket SLA, and tech utilization — sourced from the live CRM. Scheduled reports email weekly."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Library' }, { label: 'Reports' }]}
        stats={[
          { label: 'Pipeline', value: formatCurrency(m.pipelineValue, { compact: true }) },
          { label: 'MRR', value: formatCurrency(m.mrr, { compact: true }) },
          { label: 'NPS · 90d', value: m.npsRolling90 },
          { label: 'Uptime · 90d', value: `${m.uptime90}%` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AdminCard
          eyebrow="Sales"
          title="Pipeline by stage"
          description="Weighted value progressing through the kanban"
          className="lg:col-span-2"
        >
          <div className="space-y-4 mt-2">
            {PIPELINE_BY_STAGE.map((s) => (
              <div key={s.stage}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                    {s.stage}
                  </span>
                  <span className="font-serif text-[17px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {formatCurrency(s.value, { compact: true })}
                  </span>
                </div>
                <div className="h-2 bg-[#F4F8F7] border border-[#D5E0DE] rounded-[2px] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0F766E] to-[#0F4C4C]" style={{ width: `${(s.value / maxStageValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard eyebrow="Saved" title="Reports library" flush>
          <ul>
            {SAVED_REPORTS.map((r, i, arr) => (
              <li
                key={r.name}
                className={`px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
              >
                <p className="font-serif text-[14px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {r.name}
                </p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-0.5">
                  {r.last}
                </p>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <Heat label="Win rate · 90d" value="42%" delta="+4pts" tone="up" />
        <Heat label="Avg cycle" value="38d" delta="-3d" tone="up" />
        <Heat label="Churn · TTM" value="3.4%" delta="+0.2pts" tone="down" />
        <Heat label="Tech util · 30d" value="73%" delta="-2pts" tone="down" />
      </div>
    </div>
  )
}

function Heat({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: 'up' | 'down' }) {
  return (
    <div className="relative bg-white border border-[#D5E0DE] rounded-[4px] p-5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5F6E6D]">{label}</p>
      <p className="mt-2 font-serif text-[32px] text-[#0F4C4C] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
        {value}
      </p>
      <p className={`mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] ${tone === 'up' ? 'text-[#0F766E]' : 'text-[#B53A2B]'}`}>
        {delta} {tone === 'up' ? '↑' : '↓'}
      </p>
    </div>
  )
}
