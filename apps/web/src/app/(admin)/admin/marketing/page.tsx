import type { Metadata } from 'next'
import Link from 'next/link'
import { Megaphone, ArrowUpRight, Rocket, DollarSign } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getMarketingEngagements, formatCurrency } from '@/server/admin-data'
import type { MarketingEngagement, MarketingStatus, MarketingServiceKind } from '@gitsols/types'

export const metadata: Metadata = { title: 'Marketing & GHL · Admin' }

const KIND_LABEL: Record<MarketingServiceKind, string> = {
  'ghl-implementation': 'GHL implementation',
  seo: 'SEO',
  'paid-ads': 'Paid ads',
  social: 'Social',
  'web-design': 'Web design',
  'email-automation': 'Email automation',
  reputation: 'Reputation',
  'full-funnel': 'Full funnel',
}

const STATUS_TONE: Record<MarketingStatus, string> = {
  scoping: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
  onboarding: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  building: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  live: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  optimizing: 'bg-[#CFFAFA] text-[#0F4C4C] border-[#0F766E]',
  paused: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  closed: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const HEALTH_DOT: Record<MarketingEngagement['health'], string> = {
  green: 'bg-[#14B8A6]',
  amber: 'bg-[#C5933A]',
  red: 'bg-[#B53A2B]',
}

export default async function AdminMarketingPage() {
  const engagements = await getMarketingEngagements()

  const mrr = engagements
    .filter((e) => e.status !== 'closed')
    .reduce((s, e) => s + e.monthlyRetainer, 0)
  const setup = engagements.reduce((s, e) => s + e.setupFee, 0)
  const ghl = engagements.filter((e) => e.kind === 'ghl-implementation').length
  const live = engagements.filter((e) => e.status === 'live' || e.status === 'optimizing').length

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Growth · Marketing & GHL"
        title="Marketing & GoHighLevel"
        description="Marketing retainers and GoHighLevel implementations — pipelines, funnels, and automation delivered for clients."
        badge={{ label: `${engagements.length} engagements`, tone: 'live' }}
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Marketing' }]}
        stats={[
          { label: 'Monthly retainer', value: formatCurrency(mrr, { compact: true }) },
          { label: 'Setup (booked)', value: formatCurrency(setup, { compact: true }) },
          { label: 'GHL builds', value: ghl },
          { label: 'Live / optimizing', value: live },
        ]}
      />

      <AdminCard
        eyebrow="Growth · Engagements"
        title="Marketing engagements"
        description="Every active marketing and GoHighLevel engagement. Click through for deliverables and status."
        flush
      >
        {engagements.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Megaphone className="w-8 h-8 mx-auto text-[#9FB3B0] mb-3" />
            <p className="text-sm text-gray-600">No marketing engagements yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Seed demo data or create one from an account.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#14B8A6]/70 border-b border-[#E5EDEB]">
                <th className="px-6 py-3 font-bold">Engagement</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Retainer</th>
                <th className="px-4 py-3 font-bold text-right">Setup</th>
                <th className="px-4 py-3 font-bold">GHL location</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {engagements.map((e, i) => (
                <tr
                  key={e.id}
                  className={`hover:bg-[#F4F8F7]/60 transition-colors ${i < engagements.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${HEALTH_DOT[e.health]}`} />
                      <div>
                        <div className="font-semibold text-gray-800">{e.name}</div>
                        {e.accountName && (
                          <div className="text-xs text-gray-500">{e.accountName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{KIND_LABEL[e.kind]}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_TONE[e.status]}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-gray-800">
                    {formatCurrency(e.monthlyRetainer)}/mo
                  </td>
                  <td className="px-4 py-4 text-right text-gray-600">
                    {formatCurrency(e.setupFee)}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-500">
                    {e.ghlLocationId ?? '—'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/marketing/${e.id}` as never}
                      className="inline-flex items-center gap-1 text-[#0F4C4C] hover:text-[#082F2F] text-xs font-medium"
                    >
                      Open <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard eyebrow="Growth · Offering" title="What we deliver">
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <Rocket className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
              GoHighLevel sub-account build-outs: pipelines, funnels, calendars, automations.
            </li>
            <li className="flex gap-2">
              <Rocket className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
              Local SEO, Google &amp; Meta ads, and reputation management.
            </li>
            <li className="flex gap-2">
              <Rocket className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
              Missed-call text-back, speed-to-lead, and nurture/reactivation workflows.
            </li>
          </ul>
        </AdminCard>
        <AdminCard eyebrow="Growth · Revenue" title="Recurring marketing revenue">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-[#14B8A6]" />
            <div>
              <div className="text-2xl font-bold text-[#0F4C4C]">{formatCurrency(mrr)}</div>
              <div className="text-xs text-gray-500">
                Monthly recurring across {engagements.filter((e) => e.status !== 'closed').length}{' '}
                active engagements
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
