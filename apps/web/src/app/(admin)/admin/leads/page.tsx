import type { Metadata } from 'next'
import Link from 'next/link'
import { Inbox, Filter, Mail, Phone, Search, ArrowUpRight } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getLeads, formatRelative } from '@/server/admin-data'
import type { AdminLead, AdminLeadStatus } from '@gitsols/types'

export const metadata: Metadata = { title: 'Leads · Admin' }

const SOURCE_LABEL: Record<string, string> = {
  contact_form: 'Contact form',
  free_it_audit: 'Free IT audit',
  service_inquiry: 'Service inquiry',
  bespoke_scope_request: 'Bespoke scope',
  phone: 'Phone',
  referral: 'Referral',
  other: 'Other',
}

const STATUS_TONE: Record<string, string> = {
  new: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  qualifying: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  qualified: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  contacted: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  disqualified: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
  converted: 'bg-[#CFFAFA] text-[#0F4C4C] border-[#0F766E]',
  junk: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const INDUSTRY_LABEL: Record<string, string> = {
  healthcare: 'Healthcare',
  'financial-services': 'Financial svcs',
  'professional-services': 'Professional svcs',
  other: 'Other',
}

const STATUS_FILTERS: AdminLeadStatus[] = [
  'new',
  'qualifying',
  'qualified',
  'contacted',
  'disqualified',
  'converted',
  'junk',
]

export default async function AdminLeadsPage() {
  const leads = await getLeads()
  const counts = leads.reduce<Record<string, number>>(
    (acc, l) => ({ ...acc, [l.status]: (acc[l.status] ?? 0) + 1 }),
    {},
  )
  const avgScore = leads.length
    ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length)
    : 0

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="CRM · Inbound"
        title="Leads"
        description="Every inquiry from the public site lands here — contact form, audit intake, service inquiry, bespoke scope. Triage, qualify, convert."
        badge={{ label: 'Live · 6 this week', tone: 'live' }}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'CRM' },
          { label: 'Leads' },
        ]}
        stats={[
          { label: 'New', value: counts.new ?? 0, hint: 'unread' },
          { label: 'Qualifying', value: counts.qualifying ?? 0 },
          { label: 'Qualified', value: counts.qualified ?? 0, hint: 'ready' },
          { label: 'Avg score', value: avgScore, hint: '/100' },
        ]}
        primaryAction={{ label: 'New lead', href: '/admin/leads/new', icon: Inbox }}
        secondaryAction={{ label: 'Pipeline view', href: '/admin/pipeline' }}
      />

      {/* Filter rail */}
      <AdminCard eyebrow="Filters" title="Triage queue">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5F6E6D]" />
            <input
              type="text"
              placeholder="Search by name, company, message…"
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] px-3 py-1.5 rounded-[3px] border transition-colors ${STATUS_TONE[s] ?? STATUS_TONE.new}`}
              >
                {s}
                <span className="opacity-70">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </AdminCard>

      {/* Leads table */}
      <AdminCard eyebrow="Inbox" title={`${leads.length} leads`} flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
              <tr className="text-left">
                <Th>Lead</Th>
                <Th>Source</Th>
                <Th>Industry</Th>
                <Th>Service</Th>
                <Th>Status</Th>
                <Th className="text-right">Score</Th>
                <Th>Received</Th>
                <Th className="text-right">Open</Th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l: AdminLead) => (
                <tr key={l.id} className="border-b border-[#E5EDEB] hover:bg-[#F4F8F7]/60 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] font-serif text-[14px] text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
                        {initials(l.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-[15px] text-[#0F4C4C] leading-tight tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                          {l.name}
                        </p>
                        <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 truncate max-w-[260px]">
                          {l.company ?? '—'}
                        </p>
                        <div className="flex items-center gap-2.5 mt-1.5 font-mono text-[10.5px] text-[#5F6E6D]">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {l.email}
                          </span>
                          {l.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {l.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]">
                      {SOURCE_LABEL[l.source] ?? l.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">
                    {l.industry ? (INDUSTRY_LABEL[l.industry] ?? l.industry) : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-[12.5px] text-[#0F4C4C]">
                    {l.serviceInterest ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${STATUS_TONE[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <ScoreBar score={l.score} />
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[11px] text-[#5F6E6D]">
                    {formatRelative(l.receivedAt)}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F]"
                    >
                      Triage
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

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function ScoreBar({ score }: { score: number }) {
  const tone = score >= 80 ? 'bg-[#0F766E]' : score >= 60 ? 'bg-[#14B8A6]' : 'bg-[#C5933A]'
  return (
    <div className="inline-flex items-center gap-2 min-w-[80px] justify-end">
      <span className="font-serif text-[16px] text-[#0F4C4C] leading-none tracking-[-0.01em]" style={{ fontFamily: 'var(--font-serif)' }}>
        {score}
      </span>
      <div className="w-12 h-1 bg-[#E5EDEB] rounded-full overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}
