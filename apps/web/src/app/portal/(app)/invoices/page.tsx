import { Download } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getPortalInvoices } from '@/server/portal-data'
import { formatCurrency } from '@/server/admin-data'
import type { InvoiceStatus } from '@gitsols/types'

export const metadata = { title: 'Invoices · Client portal' }

const TONE: Record<InvoiceStatus, string> = {
  draft: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
  sent: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  partial: 'bg-[#FEF6E6] text-[#8a6516] border-[#F5E4BD]',
  paid: 'bg-[#0F4C4C] text-white border-[#0F766E]',
  overdue: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  void: 'bg-[#F4F8F7] text-[#9aa6a4] border-[#D5E0DE] line-through',
}

export default async function Page() {
  const invoices = (await getPortalInvoices()).filter((i) => i.status !== 'draft')
  const due = invoices.filter((i) => i.status !== 'paid' && i.status !== 'void').reduce((s, i) => s + i.balanceDue, 0)
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Billing" title="Invoices" description="Your invoices and balances." stats={[{ label: 'Invoices', value: invoices.length }, { label: 'Balance due', value: formatCurrency(due) }]} />
      <AdminCard flush title={`${invoices.length} invoice${invoices.length === 1 ? '' : 's'}`}>
        {invoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-[13px] text-[#5F6E6D]">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D] border-b border-[#D5E0DE]">
                <th className="px-6 py-3">Number</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Balance</th><th className="px-6 py-3" />
              </tr></thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-b border-[#EDF2F1]">
                    <td className="px-6 py-3 font-mono text-[12px] text-[#0F4C4C]">{i.number}</td>
                    <td className="px-4 py-3 text-[#5F6E6D] font-mono text-[12px]">{i.issueDate ?? '—'}</td>
                    <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-[3px] border text-[10.5px] font-mono uppercase ${TONE[i.status]}`}>{i.status}</span></td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#0F4C4C]">{formatCurrency(i.total)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#0F4C4C]">{formatCurrency(i.balanceDue)}</td>
                    <td className="px-6 py-3 text-right">
                      <a href={`/portal/invoices/${i.id}/pdf`} className="inline-flex items-center gap-1 text-[#0F766E] hover:text-[#0F4C4C] font-mono text-[11px] uppercase tracking-[0.1em]"><Download className="w-3.5 h-3.5" /> PDF</a>
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
