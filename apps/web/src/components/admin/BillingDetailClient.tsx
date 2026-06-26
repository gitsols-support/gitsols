'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, Pencil, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import {
  updateInvoice,
  updateProposal,
  deleteInvoice,
  deleteProposal,
  convertProposalToInvoice,
} from '@/server/admin-actions'
import type { Invoice, Proposal } from '@gitsols/types'

const money = (n: number) => `$${n.toLocaleString('en-US')}`
function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export default function BillingDetailClient({ kind, doc }: { kind: 'invoice' | 'proposal'; doc: Invoice | Proposal }) {
  const router = useRouter()
  const { push } = useToast()
  const [pending, start] = useTransition()
  const [status, setStatus] = useState(doc.status)
  const isInvoice = kind === 'invoice'
  const inv = doc as Invoice
  const prop = doc as Proposal
  const base = `/admin/${isInvoice ? 'invoices' : 'proposals'}`

  const statuses = isInvoice
    ? ['draft', 'sent', 'partial', 'paid', 'overdue', 'void']
    : ['draft', 'sent', 'accepted', 'declined', 'expired']

  function changeStatus(next: string) {
    setStatus(next as never)
    start(async () => {
      const res = isInvoice
        ? await updateInvoice(doc.id, { status: next as never })
        : await updateProposal(doc.id, { status: next as never })
      if (!res.ok) push('error', 'Update failed', res.error)
      else push('success', 'Status updated', next)
      router.refresh()
    })
  }

  function convert() {
    start(async () => {
      const res = await convertProposalToInvoice(doc.id)
      if (!res.ok) push('error', 'Convert failed', res.error)
      else {
        push('success', 'Invoice created', res.data.number)
        router.push(`/admin/invoices/${res.data.id}` as never)
      }
    })
  }

  function remove() {
    if (!confirm(`Delete ${doc.number}? This cannot be undone.`)) return
    start(async () => {
      const res = isInvoice ? await deleteInvoice(doc.id) : await deleteProposal(doc.id)
      if (!res.ok) push('error', 'Delete failed', res.error)
      else {
        push('success', 'Deleted', doc.number)
        router.push(base as never)
      }
    })
  }

  return (
    <div className="max-w-[1000px] space-y-6">
      <AdminPageHeader
        eyebrow={`Billing · ${isInvoice ? 'Invoice' : 'Proposal'}`}
        title={doc.number}
        description={doc.title}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: isInvoice ? 'Invoices' : 'Proposals', href: base },
          { label: doc.number },
        ]}
      />

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={`${base}/${doc.id}/pdf`}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2 rounded-[3px] border border-[#0F4C4C]"
        >
          <Download className="w-3.5 h-3.5" /> Download PDF
        </a>
        <Link
          href={`${base}/${doc.id}/edit`}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] bg-white hover:bg-[#F4F8F7] px-4 py-2 rounded-[3px] border border-[#D5E0DE]"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
        {!isInvoice && (prop.status === 'accepted' || prop.status === 'sent') && (
          <button
            type="button"
            onClick={convert}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0c7a52] bg-[#E9F7F0] hover:bg-[#d7f0e3] px-4 py-2 rounded-[3px] border border-[#C7ECD9] disabled:opacity-60"
          >
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            Convert to invoice
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D]">Status</label>
          <select
            value={status}
            onChange={(e) => changeStatus(e.target.value)}
            disabled={pending}
            className="input !w-auto py-1.5 text-[12px]"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center justify-center w-8 h-8 rounded-[3px] border border-[#F5C9C0] text-[#B53A2B] hover:bg-[#FBE6E1]"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AdminCard flush eyebrow="Line items" title="Billed items">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D] border-b border-[#D5E0DE]">
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                    <th className="px-4 py-3 font-medium text-right">Unit</th>
                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.lineItems.map((li) => (
                    <tr key={li.id} className="border-b border-[#EDF2F1]">
                      <td className="px-6 py-3 text-[#0F4C4C]">
                        {li.description}
                        {li.recurring && <span className="ml-2 font-mono text-[10px] text-[#5F6E6D]">recurring · {li.unit}</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#5F6E6D]">{li.qty}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#5F6E6D]">{money(li.unitPrice)}</td>
                      <td className="px-6 py-3 text-right font-mono tabular-nums text-[#0F4C4C]">{money(li.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          {(doc.notes || doc.terms) && (
            <AdminCard eyebrow="Notes & terms" title="Fine print">
              {doc.notes && <p className="text-[13px] text-[#0F4C4C] mb-3">{doc.notes}</p>}
              {doc.terms && <p className="text-[12px] text-[#5F6E6D]">{doc.terms}</p>}
            </AdminCard>
          )}
        </div>

        <div className="space-y-6">
          <AdminCard eyebrow="Summary" title="Totals">
            <dl className="space-y-2 font-mono text-[12.5px] tabular-nums">
              <Row label="Subtotal" value={money(doc.subtotal)} />
              {doc.discount > 0 && <Row label="Discount" value={`-${money(doc.discount)}`} />}
              <Row label={`Tax (${doc.taxRate}%)`} value={money(doc.taxAmount)} />
              <div className="h-px bg-[#D5E0DE] my-1" />
              <Row label="Total" value={money(doc.total)} strong />
              {isInvoice && inv.amountPaid > 0 && (
                <>
                  <Row label="Amount paid" value={`-${money(inv.amountPaid)}`} />
                  <Row label="Balance due" value={money(inv.balanceDue)} strong />
                </>
              )}
            </dl>
          </AdminCard>

          <AdminCard eyebrow="Details" title="Record">
            <dl className="space-y-2.5 text-[12.5px]">
              <Meta label="Client" value={doc.clientName || doc.accountName || '—'} />
              {doc.accountName && <Meta label="Account" value={doc.accountName} />}
              {doc.engagementName && <Meta label="Project" value={doc.engagementName} />}
              <Meta label="Issued" value={fmtDate(doc.issueDate)} />
              <Meta label={isInvoice ? 'Due' : 'Valid until'} value={fmtDate(isInvoice ? inv.dueDate : prop.validUntil)} />
              {isInvoice && inv.proposalNumber && <Meta label="From proposal" value={inv.proposalNumber} />}
              <Meta label="Owner" value={doc.owner} />
            </dl>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={strong ? 'text-[#0F4C4C] font-semibold' : 'text-[#5F6E6D]'}>{label}</dt>
      <dd className={strong ? 'text-[#0F4C4C] font-semibold text-[14px]' : 'text-[#0F4C4C]'}>{value}</dd>
    </div>
  )
}
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-dotted border-[#D5E0DE] last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5F6E6D]">{label}</span>
      <span className="text-[#0F4C4C] text-right">{value}</span>
    </div>
  )
}
