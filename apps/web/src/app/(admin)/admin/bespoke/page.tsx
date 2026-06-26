import type { Metadata } from 'next'
import Link from 'next/link'
import { Code2, Plus, ArrowUpRight, Smartphone, LayoutDashboard, Database, Sparkles, Cable } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getBespokeProjects, formatCurrency } from '@/server/admin-data'
import type { BespokeProject } from '@gitsols/types'

export const metadata: Metadata = { title: 'Bespoke projects · Admin' }

const TYPE_ICON: Record<BespokeProject['type'], React.ElementType> = {
  'web-app': LayoutDashboard,
  'mobile-app': Smartphone,
  crm: Database,
  'ai-tool': Sparkles,
  integration: Cable,
}

const TYPE_LABEL: Record<BespokeProject['type'], string> = {
  'web-app': 'Web App',
  'mobile-app': 'Mobile App',
  crm: 'Custom CRM',
  'ai-tool': 'AI Tool',
  integration: 'Integration',
}

const STAGE_LABEL: Record<BespokeProject['stage'], string> = {
  discovery: 'Discovery',
  design: 'Design',
  build: 'Build',
  uat: 'UAT',
  launch: 'Launch',
  hypercare: 'Hypercare',
  closed: 'Closed',
}

const STAGE_ORDER: BespokeProject['stage'][] = [
  'discovery',
  'design',
  'build',
  'uat',
  'launch',
  'hypercare',
]

const BILLING_LABEL: Record<BespokeProject['billing'], string> = {
  fixed: 'Fixed-price',
  't-and-m': 'T&M',
  hybrid: 'Hybrid',
}

const HEALTH_DOT: Record<BespokeProject['health'], string> = {
  green: 'bg-[#14B8A6]',
  amber: 'bg-[#C5933A]',
  red: 'bg-[#B53A2B]',
}

export default async function AdminBespokePage() {
  const projects = await getBespokeProjects()
  const totalValue = projects.reduce((s, p) => s + p.contractValue, 0)
  const burned = projects.reduce((s, p) => s + p.burned, 0)
  const active = projects.filter((p) => p.stage !== 'closed').length
  const atRisk = projects.filter((p) => p.health !== 'green').length

  // Kanban grouping
  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    items: projects.filter((p) => p.stage === stage),
  }))

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Delivery · Build engagements"
        title="Bespoke projects"
        description="Custom web apps, mobile apps, AI tools, and CRMs built for clients on the same lifecycle as managed services — discovery, design, build, UAT, launch, hypercare."
        badge={{ label: `${active} in flight`, tone: 'live' }}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Delivery' },
          { label: 'Bespoke' },
        ]}
        stats={[
          { label: 'Active', value: active, hint: 'in flight' },
          { label: 'Contract value', value: formatCurrency(totalValue, { compact: true }) },
          { label: 'Burned', value: formatCurrency(burned, { compact: true }), hint: `${totalValue > 0 ? Math.round((burned / totalValue) * 100) : 0}%` },
          { label: 'At-risk', value: atRisk, hint: 'amber/red' },
        ]}
        primaryAction={{ label: 'New project', href: '/admin/bespoke/new', icon: Plus }}
        secondaryAction={{ label: 'Service catalog', href: '/admin/services' }}
      />

      {/* Kanban */}
      <AdminCard eyebrow="Pipeline" title="By stage" description="Drag to advance stage (Phase 2).">
        <div className="overflow-x-auto -mx-6 px-6 pb-2">
          <div className="grid grid-cols-6 gap-3 min-w-[1100px]">
            {byStage.map(({ stage, items }) => (
              <div key={stage}>
                <div className="flex items-center justify-between mb-2.5 px-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
                    {STAGE_LABEL[stage]}
                  </p>
                  <span className="font-serif text-[16px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[60px]">
                  {items.length === 0 && (
                    <div className="border border-dashed border-[#D5E0DE] rounded-[3px] p-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D]">
                      empty
                    </div>
                  )}
                  {items.map((p) => {
                    const Icon = TYPE_ICON[p.type]
                    return (
                      <Link
                        key={p.id}
                        href={`/admin/bespoke/${p.id}`}
                        className="block relative bg-white border border-[#D5E0DE] hover:border-[#0F4C4C]/40 hover:shadow-[0_12px_24px_-8px_rgba(8,47,47,0.18)] rounded-[3px] p-3 transition-all overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40 group-hover:bg-[#0F766E] transition-colors" />
                        <div className="flex items-start gap-2 mb-2">
                          <Icon className="w-3.5 h-3.5 text-[#0F4C4C] mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0F766E]">
                              {p.id}
                            </p>
                            <p
                              className="mt-0.5 font-serif text-[13px] text-[#0F4C4C] leading-tight tracking-[-0.005em]"
                              style={{ fontFamily: 'var(--font-serif)' }}
                            >
                              {p.name}
                            </p>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#5F6E6D] truncate">{p.accountName ?? '—'}</p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className={`inline-block w-2 h-2 rounded-full ${HEALTH_DOT[p.health]}`} />
                          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#5F6E6D]">
                            {p.milestonesDone}/{p.milestonesTotal}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminCard>

      {/* Detail table */}
      <AdminCard eyebrow="Roster" title="All projects" flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
              <tr className="text-left">
                <Th>Project</Th>
                <Th>Type</Th>
                <Th>Account</Th>
                <Th>Stage</Th>
                <Th>Billing</Th>
                <Th className="text-right">Value</Th>
                <Th className="text-right">Burned</Th>
                <Th>Milestones</Th>
                <Th>Target go-live</Th>
                <Th className="text-right">Open</Th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const Icon = TYPE_ICON[p.type]
                const pct = p.milestonesTotal > 0 ? Math.round((p.milestonesDone / p.milestonesTotal) * 100) : 0
                return (
                  <tr key={p.id} className="border-b border-[#E5EDEB] hover:bg-[#F4F8F7]/60 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#082F2F] text-[#CFFAFA] flex-shrink-0">
                          <Code2 className="w-4 h-4" />
                        </span>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0F766E]">{p.id}</p>
                          <p className="font-serif text-[14.5px] text-[#0F4C4C] leading-tight tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                            {p.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]">
                        <Icon className="w-3 h-3" />
                        {TYPE_LABEL[p.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-[12.5px] text-[#0F4C4C]">{p.accountName ?? '—'}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C]">
                        {STAGE_LABEL[p.stage]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">
                      {BILLING_LABEL[p.billing]}
                    </td>
                    <td className="px-4 py-3 align-top text-right font-serif text-[15px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {formatCurrency(p.contractValue, { compact: true })}
                    </td>
                    <td className="px-4 py-3 align-top text-right font-mono text-[11.5px] text-[#5F6E6D]">
                      {formatCurrency(p.burned, { compact: true })}
                      <span className="block text-[10px] text-[#0F766E]">
                        {p.contractValue > 0 ? Math.round((p.burned / p.contractValue) * 100) : 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="w-16 h-1 bg-[#E5EDEB] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0F766E]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-[10.5px] text-[#5F6E6D]">
                          {p.milestonesDone}/{p.milestonesTotal}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${HEALTH_DOT[p.health]}`} />
                        <span className="font-mono text-[11px] text-[#0F4C4C]">
                          {p.targetGoLive
                            ? new Date(p.targetGoLive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <Link
                        href={`/admin/bespoke/${p.id}`}
                        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F]"
                      >
                        Open
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium ${className}`}>
      {children}
    </th>
  )
}
