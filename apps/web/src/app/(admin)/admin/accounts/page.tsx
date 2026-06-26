import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Plus, Search, Filter, ArrowUpRight } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getAccounts, formatCurrency } from '@/server/admin-data'
import type { CrmAccount, AccountStatus } from '@gitsols/types'

export const metadata: Metadata = { title: 'Accounts · Admin' }

const TIER_LABEL: Record<string, string> = {
  enterprise: 'Enterprise',
  'mid-market': 'Mid-market',
  smb: 'SMB',
}

const STATUS_TONE: Record<string, string> = {
  active: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  onboarding: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  'at-risk': 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  churned: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const HEALTH_DOT: Record<string, string> = {
  excellent: 'bg-[#14B8A6]',
  good: 'bg-[#0F766E]',
  watch: 'bg-[#C5933A]',
  critical: 'bg-[#B53A2B]',
}

const INDUSTRY_LABEL: Record<string, string> = {
  healthcare: 'Healthcare',
  'financial-services': 'Financial svcs',
  'professional-services': 'Professional svcs',
  other: 'Other',
}

const STATUS_FILTERS: AccountStatus[] = ['active', 'onboarding', 'at-risk', 'churned']

export default async function AdminAccountsPage() {
  const accounts = await getAccounts()
  const totalMrr = accounts.reduce((s, a) => s + a.mrr, 0)
  const totalSeats = accounts.reduce((s, a) => s + a.seats, 0)
  const active = accounts.filter((a) => a.status === 'active').length
  const atRisk = accounts.filter((a) => a.status === 'at-risk').length

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="CRM · Clients"
        title="Accounts"
        description="Every signed client organization. Health, MRR, open engagements, renewal cadence — at a glance."
        badge={{ label: `${active} active`, tone: 'live' }}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'CRM' },
          { label: 'Accounts' },
        ]}
        stats={[
          { label: 'Accounts', value: accounts.length, hint: 'all tiers' },
          { label: 'Active MRR', value: formatCurrency(totalMrr, { compact: true }), hint: 'recurring' },
          { label: 'Seats served', value: totalSeats.toLocaleString() },
          { label: 'At-risk', value: atRisk, hint: 'flag' },
        ]}
        primaryAction={{ label: 'New account', href: '/admin/accounts/new', icon: Plus }}
        secondaryAction={{ label: 'Open pipeline', href: '/admin/pipeline' }}
      />

      <AdminCard eyebrow="Filters" title="Book of business">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5F6E6D]" />
            <input type="text" placeholder="Search account or contact…" className="input pl-9" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] px-3 py-1.5 rounded-[3px] border transition-colors ${STATUS_TONE[s] ?? STATUS_TONE.active}`}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Tier & industry
          </button>
        </div>
      </AdminCard>

      <AdminCard eyebrow="Roster" title={`${accounts.length} accounts`} flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
              <tr className="text-left">
                <Th>Account</Th>
                <Th>Industry</Th>
                <Th>Tier</Th>
                <Th>Primary</Th>
                <Th className="text-right">MRR</Th>
                <Th className="text-center">Seats</Th>
                <Th className="text-center">Engagements</Th>
                <Th className="text-center">Tickets</Th>
                <Th>Status</Th>
                <Th className="text-right">Open</Th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a: CrmAccount) => (
                <tr key={a.id} className="border-b border-[#E5EDEB] hover:bg-[#F4F8F7]/60 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#0F4C4C] text-white flex-shrink-0">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-[15px] text-[#0F4C4C] leading-tight tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                          {a.name}
                        </p>
                        <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5">
                          {a.id}
                          {a.since ? ` · since ${new Date(a.since).getFullYear()}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">
                    {a.industry ? (INDUSTRY_LABEL[a.industry] ?? a.industry) : '—'}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F4C4C] bg-[#F4F8F7] border border-[#D5E0DE] px-2 py-1 rounded-[3px]">
                      {TIER_LABEL[a.tier]}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="text-[12.5px] text-[#0F4C4C]">{a.primaryContact ?? '—'}</p>
                    <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5 truncate max-w-[180px]">{a.primaryEmail ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <span className="font-serif text-[16px] text-[#0F4C4C] tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {formatCurrency(a.mrr, { compact: true })}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-center font-mono text-[12px] text-[#0F4C4C]">{a.seats}</td>
                  <td className="px-4 py-3 align-top text-center font-mono text-[12px] text-[#0F4C4C]">{a.activeEngagements}</td>
                  <td className="px-4 py-3 align-top text-center font-mono text-[12px] text-[#0F4C4C]">{a.openTickets}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${HEALTH_DOT[a.health] ?? HEALTH_DOT.good}`} />
                      <span className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${STATUS_TONE[a.status] ?? STATUS_TONE.active}`}>
                        {a.status.replace('-', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link
                      href={`/admin/accounts/${a.id}`}
                      className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F]"
                    >
                      Account
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
