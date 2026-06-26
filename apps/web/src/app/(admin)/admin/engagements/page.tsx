import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, Plus, ArrowUpRight } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getEngagements, formatCurrency } from '@/server/admin-data'
import type { Engagement } from '@gitsols/types'

export const metadata: Metadata = { title: 'Engagements · Admin' }

const STATUS_TONE: Record<string, string> = {
  active: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  onboarding: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  paused: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  renewing: 'bg-[#CFFAFA] text-[#0F4C4C] border-[#0F766E]',
  closed: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const HEALTH_DOT: Record<string, string> = {
  green: 'bg-[#14B8A6]',
  amber: 'bg-[#C5933A]',
  red: 'bg-[#B53A2B]',
}

const TYPE_LABEL: Record<string, string> = {
  managed: 'Managed retainer',
  project: 'Project',
  discovery: 'Discovery sprint',
}

export default async function AdminEngagementsPage() {
  const engagements = await getEngagements()
  const totalMrr = engagements
    .filter((e) => e.type === 'managed')
    .reduce((s, e) => s + e.mrrOrValue, 0)
  const projectValue = engagements
    .filter((e) => e.type === 'project')
    .reduce((s, e) => s + e.mrrOrValue, 0)

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Delivery · Active work"
        title="Engagements"
        description="Every active client project and managed retainer. Stage-by-stage progression keyed to the 9-stage engagement lifecycle."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Delivery' }, { label: 'Engagements' }]}
        badge={{ label: `${engagements.filter((e) => e.status === 'active').length} active`, tone: 'live' }}
        stats={[
          { label: 'Active', value: engagements.filter((e) => e.status === 'active').length },
          { label: 'Onboarding', value: engagements.filter((e) => e.status === 'onboarding').length },
          { label: 'Retainer MRR', value: formatCurrency(totalMrr, { compact: true }) },
          { label: 'Project value', value: formatCurrency(projectValue, { compact: true }) },
        ]}
        primaryAction={{ label: 'New engagement', href: '/admin/engagements/new', icon: Plus }}
        secondaryAction={{ label: 'Lifecycle', href: '/admin/process' }}
      />

      <AdminCard eyebrow="Active book" title="All engagements" flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
              <tr className="text-left">
                <Th>Engagement</Th>
                <Th>Account</Th>
                <Th>Type</Th>
                <Th>Stage</Th>
                <Th>Next milestone</Th>
                <Th className="text-right">Value</Th>
                <Th>Health</Th>
                <Th>Status</Th>
                <Th className="text-right">Open</Th>
              </tr>
            </thead>
            <tbody>
              {engagements.map((e: Engagement) => (
                <tr key={e.id} className="border-b border-[#E5EDEB] hover:bg-[#F4F8F7]/60 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#0F4C4C] text-white flex-shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0F766E]">{e.id}</p>
                        <p className="font-serif text-[14.5px] text-[#0F4C4C] leading-tight tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                          {e.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-[12.5px] text-[#0F4C4C]">{e.accountName}</td>
                  <td className="px-4 py-3 align-top font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">
                    {TYPE_LABEL[e.type] ?? e.type}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]">
                      {e.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="text-[12.5px] text-[#0F4C4C]">{e.nextMilestone ?? '—'}</p>
                    <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5">
                      {e.nextMilestoneDue
                        ? `Due ${new Date(e.nextMilestoneDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : 'No due date'}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top text-right font-serif text-[15px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {formatCurrency(e.mrrOrValue, { compact: true })}
                    <span className="block font-mono text-[10px] text-[#5F6E6D] mt-0.5">
                      {e.type === 'managed' ? '/ mo' : 'total'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${HEALTH_DOT[e.health] ?? HEALTH_DOT.green}`} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${STATUS_TONE[e.status] ?? STATUS_TONE.active}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link
                      href={`/admin/engagements/${e.id}`}
                      className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F]"
                    >
                      Open
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
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
