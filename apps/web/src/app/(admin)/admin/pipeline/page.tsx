import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getOpportunities, formatCurrency } from '@/server/admin-data'
import PipelineBoard from './PipelineBoard'

export const metadata: Metadata = { title: 'Pipeline · Admin' }

export default async function AdminPipelinePage() {
  const opps = await getOpportunities()

  const owners = Array.from(new Set(opps.map((o) => o.owner))).filter(Boolean)
  const active = opps.filter((o) => o.stage !== 'closed-won' && o.stage !== 'closed-lost')
  const totalValue = active.reduce((s, o) => s + o.value, 0)
  const weightedValue = active.reduce((s, o) => s + (o.value * o.probability) / 100, 0)
  const wonThisQuarter = opps.filter((o) => o.stage === 'closed-won').length
  const closingThisMonth = opps.filter(
    (o) =>
      o.stage !== 'closed-won' &&
      o.stage !== 'closed-lost' &&
      o.expectedClose !== undefined &&
      new Date(o.expectedClose).getMonth() === new Date().getMonth(),
  ).length

  return (
    <div className="max-w-[1600px] space-y-6">
      <AdminPageHeader
        eyebrow="CRM · Sales pipeline"
        title="Pipeline"
        description="Lead → Qualified → Proposal → SoW → Closed. Drag a card between columns to change its stage — every move is saved to the API."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'CRM' },
          { label: 'Pipeline' },
        ]}
        badge={{ label: `${active.length} in play`, tone: 'live' }}
        stats={[
          { label: 'Total value', value: formatCurrency(totalValue, { compact: true }) },
          {
            label: 'Weighted',
            value: formatCurrency(weightedValue, { compact: true }),
            hint: 'p × value',
          },
          { label: 'Won · QTD', value: wonThisQuarter },
          { label: 'Closing · this mo', value: closingThisMonth },
        ]}
        primaryAction={{ label: 'New opportunity', href: '/admin/pipeline/new', icon: Plus }}
        secondaryAction={{ label: 'Open leads queue', href: '/admin/leads' }}
      />

      <PipelineBoard initial={opps} owners={owners} />
    </div>
  )
}
