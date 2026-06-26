import type { Metadata } from 'next'
import Link from 'next/link'
import { Ticket as TicketIcon, Plus, Filter, ArrowUpRight } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getTickets, formatRelative } from '@/server/admin-data'
import type { Ticket } from '@gitsols/types'

export const metadata: Metadata = { title: 'Tickets · Admin' }

const STATUS_TONE: Record<Ticket['status'], string> = {
  open: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  'in-progress': 'bg-[#0F4C4C] text-white border-[#0F766E]',
  'awaiting-client': 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  resolved: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const PRIORITY_TONE: Record<Ticket['priority'], string> = {
  p1: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  p2: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  p3: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  p4: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const CATEGORY_LABEL: Record<Ticket['category'], string> = {
  incident: 'Incident',
  request: 'Request',
  change: 'Change',
  project: 'Project',
}

export default async function AdminTicketsPage() {
  const tickets = await getTickets()
  const open = tickets.filter((t) => t.status !== 'resolved')
  const p1 = tickets.filter((t) => t.priority === 'p1' && t.status !== 'resolved').length
  const awaitingClient = tickets.filter((t) => t.status === 'awaiting-client').length

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Delivery · Support"
        title="Tickets"
        description="Live ticket queue, mirrored from connected PSAs and native intake. P1 first, SLA-aware sorting, single source per account."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Delivery' }, { label: 'Tickets' }]}
        badge={p1 > 0 ? { label: `${p1} P1 open`, tone: 'warn' } : { label: 'Queue nominal', tone: 'live' }}
        stats={[
          { label: 'Open', value: open.length },
          { label: 'P1 open', value: p1, hint: p1 > 0 ? 'attention' : 'clear' },
          { label: 'Awaiting client', value: awaitingClient },
          { label: 'SLA · 30d', value: '94%', hint: 'on target' },
        ]}
        primaryAction={{ label: 'New ticket', href: '/admin/tickets', icon: Plus }}
      />

      <AdminCard eyebrow="Queue" title="All tickets" flush>
        <div className="px-6 py-4 border-b border-[#D5E0DE] flex flex-wrap items-center gap-2">
          {(['p1', 'p2', 'p3', 'p4'] as Ticket['priority'][]).map((p) => (
            <button
              key={p}
              type="button"
              className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] px-3 py-1.5 rounded-[3px] border ${PRIORITY_TONE[p]}`}
            >
              {p.toUpperCase()}
              <span className="opacity-70">{tickets.filter((t) => t.priority === p).length}</span>
            </button>
          ))}
          <span className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white px-3 py-2 rounded-[3px]">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#F4F8F7] border-b border-[#D5E0DE]">
              <tr className="text-left">
                <Th>ID</Th>
                <Th>Subject</Th>
                <Th>Account</Th>
                <Th>Priority</Th>
                <Th>Category</Th>
                <Th>Assignee</Th>
                <Th>Opened</Th>
                <Th>Status</Th>
                <Th className="text-right">Open</Th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-[#E5EDEB] hover:bg-[#F4F8F7]/60 transition-colors">
                  <td className="px-4 py-3 align-top font-mono text-[11px] uppercase tracking-[0.14em] text-[#0F766E]">{t.id}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex-shrink-0">
                        <TicketIcon className="w-3.5 h-3.5 text-[#0F4C4C]" />
                      </span>
                      <p className="text-[13px] text-[#0F4C4C] leading-snug">{t.subject}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-[12.5px] text-[#0F4C4C]">{t.accountName ?? '—'}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${PRIORITY_TONE[t.priority]}`}>
                      {t.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[11.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">
                    {CATEGORY_LABEL[t.category]}
                  </td>
                  <td className="px-4 py-3 align-top text-[12.5px] text-[#0F4C4C]">{t.assignee ?? '—'}</td>
                  <td className="px-4 py-3 align-top font-mono text-[11px] text-[#5F6E6D]">{formatRelative(t.openedAt)}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${STATUS_TONE[t.status]}`}>
                      {t.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link
                      href={`/admin/tickets/${t.id}` as never}
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
