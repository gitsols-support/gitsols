import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckCircle2, Circle, Clock, MapPin } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getMarketingEngagement, formatCurrency } from '@/server/admin-data'
import type { MarketingDeliverable } from '@gitsols/types'

export const metadata: Metadata = { title: 'Marketing engagement · Admin' }

const DELIVERABLE_ICON: Record<MarketingDeliverable['status'], typeof Circle> = {
  todo: Circle,
  'in-progress': Clock,
  done: CheckCircle2,
}

export default async function MarketingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const e = await getMarketingEngagement(id)
  if (!e) notFound()

  const deliverables = e.deliverables ?? []
  const done = deliverables.filter((d) => d.status === 'done').length

  return (
    <div className="max-w-[1100px] space-y-6">
      <AdminPageHeader
        eyebrow="Growth · Marketing & GHL"
        title={e.name}
        description={e.accountName ? `Client: ${e.accountName}` : 'Unlinked engagement'}
        badge={{ label: e.status, tone: e.status === 'paused' ? 'warn' : 'live' }}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Marketing', href: '/admin/marketing' },
          { label: e.name },
        ]}
        stats={[
          { label: 'Retainer', value: `${formatCurrency(e.monthlyRetainer)}/mo` },
          { label: 'Setup fee', value: formatCurrency(e.setupFee) },
          { label: 'Deliverables', value: `${done}/${deliverables.length}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <AdminCard eyebrow="Delivery" title="Deliverables" flush>
            {deliverables.length === 0 ? (
              <p className="px-6 py-10 text-sm text-gray-500 text-center">
                No deliverables tracked yet.
              </p>
            ) : (
              <ul>
                {deliverables.map((d, i) => {
                  const Icon = DELIVERABLE_ICON[d.status]
                  return (
                    <li
                      key={d.id}
                      className={`flex items-center gap-3 px-6 py-3.5 ${i < deliverables.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                    >
                      <Icon
                        className={`w-4 h-4 ${d.status === 'done' ? 'text-[#14B8A6]' : d.status === 'in-progress' ? 'text-[#C5933A]' : 'text-gray-300'}`}
                      />
                      <span
                        className={`text-sm flex-1 ${d.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                      >
                        {d.title}
                      </span>
                      {d.dueDate && <span className="text-xs text-gray-400">{d.dueDate}</span>}
                    </li>
                  )
                })}
              </ul>
            )}
          </AdminCard>

          {e.notes && (
            <AdminCard eyebrow="Context" title="Notes">
              <p className="text-sm text-gray-600 leading-relaxed">{e.notes}</p>
            </AdminCard>
          )}
        </div>

        <div className="space-y-5">
          <AdminCard eyebrow="Engagement" title="Details">
            <dl className="space-y-3 text-sm">
              <Row label="Type" value={e.kind} />
              <Row label="Status" value={e.status} />
              <Row label="Health" value={e.health} />
              <Row label="Owner" value={e.owner ?? '—'} />
              <Row label="Started" value={e.startedAt ?? '—'} />
              <Row label="Go-live target" value={e.goLiveTarget ?? '—'} />
            </dl>
          </AdminCard>

          {e.ghlLocationId && (
            <AdminCard eyebrow="GoHighLevel" title="Sub-account">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-[#14B8A6]" />
                <span className="font-mono text-xs">{e.ghlLocationId}</span>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-800 font-medium text-right">{value}</dd>
    </div>
  )
}
