import type { Metadata } from 'next'
import Link from 'next/link'
import { FileSignature, Plus, ArrowUpRight } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getProposals, formatCurrency } from '@/server/admin-data'
import type { ProposalStatus } from '@gitsols/types'

export const metadata: Metadata = { title: 'Proposals · Admin' }

const STATUS_TONE: Record<ProposalStatus, string> = {
  draft: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
  sent: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  accepted: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  declined: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  expired: 'bg-[#F4F8F7] text-[#9aa6a4] border-[#D5E0DE]',
  converted: 'bg-[#E9F7F0] text-[#0c7a52] border-[#C7ECD9]',
}

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export default async function AdminProposalsPage() {
  const proposals = await getProposals()
  const open = proposals.filter((p) => p.status === 'sent').length
  const accepted = proposals.filter((p) => p.status === 'accepted').length
  const openValue = proposals.filter((p) => p.status === 'sent' || p.status === 'draft').reduce((s, p) => s + p.total, 0)

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Billing · Proposals"
        title="Proposals"
        description="Quote scope and price for prospects and clients. Accepted proposals convert to invoices in one click."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Billing' }, { label: 'Proposals' }]}
        stats={[
          { label: 'Proposals', value: proposals.length },
          { label: 'Out for signature', value: open },
          { label: 'Accepted', value: accepted },
          { label: 'Open value', value: formatCurrency(openValue) },
        ]}
        primaryAction={{ label: 'New proposal', href: '/admin/proposals/new', icon: Plus }}
      />

      <AdminCard flush eyebrow="All proposals" title={`${proposals.length} record${proposals.length === 1 ? '' : 's'}`}>
        {proposals.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D] border-b border-[#D5E0DE]">
                  <th className="px-6 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Valid until</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id} className="border-b border-[#EDF2F1] hover:bg-[#F8FAFA] transition-colors">
                    <td className="px-6 py-3 font-mono text-[12px] text-[#0F4C4C] font-medium">{p.number}</td>
                    <td className="px-4 py-3 text-[#0F4C4C]">{p.title}</td>
                    <td className="px-4 py-3 text-[#5F6E6D]">{p.clientName || p.accountName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-[3px] border text-[10.5px] font-mono uppercase tracking-[0.1em] ${STATUS_TONE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5F6E6D] font-mono text-[12px]">{fmtDate(p.validUntil)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#0F4C4C] tabular-nums">{formatCurrency(p.total)}</td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/admin/proposals/${p.id}`} className="inline-flex items-center gap-1 text-[#0F766E] hover:text-[#0F4C4C] font-mono text-[11px] uppercase tracking-[0.12em]">
                        Open <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}

function Empty() {
  return (
    <div className="px-6 py-16 text-center">
      <FileSignature className="w-8 h-8 mx-auto text-[#9aa6a4] mb-3" />
      <p className="text-[14px] text-[#0F4C4C] font-semibold">No proposals yet</p>
      <p className="text-[12.5px] text-[#5F6E6D] mt-1 mb-4">Draft your first proposal to quote a client.</p>
      <Link href="/admin/proposals/new" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2 rounded-[3px] border border-[#0F4C4C]">
        <Plus className="w-3.5 h-3.5" /> New proposal
      </Link>
    </div>
  )
}
