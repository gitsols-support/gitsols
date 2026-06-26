import type { Metadata } from 'next'
import Link from 'next/link'
import { ReceiptText, Plus, ArrowUpRight } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getInvoices, formatCurrency } from '@/server/admin-data'
import type { InvoiceStatus } from '@gitsols/types'

export const metadata: Metadata = { title: 'Invoices · Admin' }

const STATUS_TONE: Record<InvoiceStatus, string> = {
  draft: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
  sent: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  partial: 'bg-[#FEF6E6] text-[#8a6516] border-[#F5E4BD]',
  paid: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  overdue: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  void: 'bg-[#F4F8F7] text-[#9aa6a4] border-[#D5E0DE] line-through',
}

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices()
  const outstanding = invoices.filter((i) => i.status !== 'paid' && i.status !== 'void').reduce((s, i) => s + i.balanceDue, 0)
  const overdue = invoices.filter((i) => i.status === 'overdue').length
  const paidYtd = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0)

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Billing · Invoices"
        title="Invoices"
        description="Bill clients for delivered work. Each invoice links to an account and project, prices from the service catalog, and exports to PDF."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Billing' }, { label: 'Invoices' }]}
        stats={[
          { label: 'Invoices', value: invoices.length },
          { label: 'Outstanding', value: formatCurrency(outstanding), hint: 'balance due' },
          { label: 'Overdue', value: overdue },
          { label: 'Collected', value: formatCurrency(paidYtd), hint: 'paid' },
        ]}
        primaryAction={{ label: 'New invoice', href: '/admin/invoices/new', icon: Plus }}
      />

      <AdminCard flush eyebrow="All invoices" title={`${invoices.length} record${invoices.length === 1 ? '' : 's'}`}>
        {invoices.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D] border-b border-[#D5E0DE]">
                  <th className="px-6 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Balance</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#EDF2F1] hover:bg-[#F8FAFA] transition-colors">
                    <td className="px-6 py-3 font-mono text-[12px] text-[#0F4C4C] font-medium">{inv.number}</td>
                    <td className="px-4 py-3 text-[#0F4C4C]">{inv.clientName || inv.accountName || '—'}</td>
                    <td className="px-4 py-3 text-[#5F6E6D]">{inv.engagementName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-[3px] border text-[10.5px] font-mono uppercase tracking-[0.1em] ${STATUS_TONE[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5F6E6D] font-mono text-[12px]">{fmtDate(inv.issueDate)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#0F4C4C] tabular-nums">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#0F4C4C]">{formatCurrency(inv.balanceDue)}</td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/admin/invoices/${inv.id}`} className="inline-flex items-center gap-1 text-[#0F766E] hover:text-[#0F4C4C] font-mono text-[11px] uppercase tracking-[0.12em]">
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
      <ReceiptText className="w-8 h-8 mx-auto text-[#9aa6a4] mb-3" />
      <p className="text-[14px] text-[#0F4C4C] font-semibold">No invoices yet</p>
      <p className="text-[12.5px] text-[#5F6E6D] mt-1 mb-4">Create your first invoice to bill a client.</p>
      <Link href="/admin/invoices/new" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2 rounded-[3px] border border-[#0F4C4C]">
        <Plus className="w-3.5 h-3.5" /> New invoice
      </Link>
    </div>
  )
}
