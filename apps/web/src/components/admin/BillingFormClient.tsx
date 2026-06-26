'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Loader2, Plus, Trash2, FileSignature, ReceiptText } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import {
  createInvoice,
  updateInvoice,
  createProposal,
  updateProposal,
} from '@/server/admin-actions'
import type {
  Invoice,
  Proposal,
  ServiceCatalogItem,
  BillingLineItemInput,
} from '@gitsols/types'

type Kind = 'invoice' | 'proposal'

interface Row {
  serviceSlug?: string
  description: string
  qty: number
  unitPrice: number
  unit: string
  recurring: boolean
}

interface Props {
  kind: Kind
  accounts: { id: string; name: string }[]
  engagements: { id: string; name: string; accountId: string }[]
  services: ServiceCatalogItem[]
  initial?: Invoice | Proposal
}

const PROPOSAL_STATUSES = ['draft', 'sent', 'accepted', 'declined', 'expired'] as const
const INVOICE_STATUSES = ['draft', 'sent', 'partial', 'paid', 'overdue', 'void'] as const

export default function BillingFormClient({ kind, accounts, engagements, services, initial }: Props) {
  const router = useRouter()
  const { push } = useToast()
  const isInvoice = kind === 'invoice'
  const editing = Boolean(initial)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [accountId, setAccountId] = useState(initial?.accountId ?? '')
  const [engagementId, setEngagementId] = useState(initial?.engagementId ?? '')
  const [clientName, setClientName] = useState(initial?.clientName ?? '')
  const [clientEmail, setClientEmail] = useState(initial?.clientEmail ?? '')
  const [status, setStatus] = useState<string>(initial?.status ?? 'draft')
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? new Date().toISOString().slice(0, 10))
  const [secondDate, setSecondDate] = useState(
    (isInvoice ? (initial as Invoice)?.dueDate : (initial as Proposal)?.validUntil) ?? '',
  )
  const [taxRate, setTaxRate] = useState(initial?.taxRate ?? 0)
  const [discount, setDiscount] = useState(initial?.discount ?? 0)
  const [amountPaid, setAmountPaid] = useState(isInvoice ? (initial as Invoice)?.amountPaid ?? 0 : 0)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [terms, setTerms] = useState(initial?.terms ?? 'Net 30. Late payments accrue 1.5% monthly.')
  const [rows, setRows] = useState<Row[]>(
    initial?.lineItems.map((li) => ({
      serviceSlug: li.serviceSlug,
      description: li.description,
      qty: li.qty,
      unitPrice: li.unitPrice,
      unit: li.unit,
      recurring: li.recurring,
    })) ?? [{ description: '', qty: 1, unitPrice: 0, unit: 'fixed', recurring: false }],
  )
  const [saving, setSaving] = useState(false)

  // Projects are filtered to the chosen client.
  const projectOptions = useMemo(
    () => (accountId ? engagements.filter((e) => e.accountId === accountId) : engagements),
    [accountId, engagements],
  )

  const subtotal = rows.reduce((s, r) => s + Math.max(0, r.qty) * Math.max(0, r.unitPrice), 0)
  const taxable = Math.max(0, subtotal - Math.max(0, discount))
  const taxAmount = Math.round((taxable * Math.max(0, taxRate)) / 100)
  const total = taxable + taxAmount
  const balance = total - Math.max(0, amountPaid)

  function setRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function addRow() {
    setRows((rs) => [...rs, { description: '', qty: 1, unitPrice: 0, unit: 'fixed', recurring: false }])
  }
  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, idx) => idx !== i))
  }
  function addFromCatalog(slug: string) {
    const svc = services.find((s) => s.slug === slug)
    if (!svc) return
    setRows((rs) => [
      ...rs.filter((r) => r.description.trim() || r.unitPrice),
      {
        serviceSlug: svc.slug,
        description: svc.name,
        qty: 1,
        unitPrice: svc.defaultRate,
        unit: svc.billingUnit,
        recurring: svc.billingUnit !== 'fixed' && svc.billingUnit !== 'hourly',
      },
    ])
  }

  function onAccountChange(id: string) {
    setAccountId(id)
    setEngagementId('')
    if (id && !clientName.trim()) {
      const acc = accounts.find((a) => a.id === id)
      if (acc) setClientName(acc.name)
    }
  }

  async function submit() {
    if (!isInvoice && !title.trim()) {
      push('error', 'Title required', 'Give the proposal a title.')
      return
    }
    if (!clientName.trim() && !accountId) {
      push('error', 'Client required', 'Pick an account or enter a client name.')
      return
    }
    const lineItems: BillingLineItemInput[] = rows
      .filter((r) => r.description.trim())
      .map((r) => ({
        serviceSlug: r.serviceSlug,
        description: r.description.trim(),
        qty: r.qty,
        unitPrice: r.unitPrice,
        unit: r.unit,
        recurring: r.recurring,
      }))
    if (lineItems.length === 0) {
      push('error', 'No line items', 'Add at least one line.')
      return
    }

    setSaving(true)
    const common = {
      title: title.trim() || `${isInvoice ? 'Invoice' : 'Proposal'} — ${clientName.trim()}`,
      accountId: accountId || undefined,
      engagementId: engagementId || undefined,
      clientName: clientName.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      status: status as never,
      issueDate: issueDate || undefined,
      taxRate,
      discount,
      notes: notes.trim() || undefined,
      terms: terms.trim() || undefined,
      lineItems,
    }

    let res
    if (isInvoice) {
      const body = { ...common, dueDate: secondDate || undefined, amountPaid }
      res = editing ? await updateInvoice(initial!.id, body) : await createInvoice(body)
    } else {
      const body = { ...common, validUntil: secondDate || undefined }
      res = editing ? await updateProposal(initial!.id, body) : await createProposal(body)
    }

    if (!res.ok) {
      setSaving(false)
      push('error', `Could not save ${kind}`, res.error)
      return
    }
    push('success', `${isInvoice ? 'Invoice' : 'Proposal'} saved`, res.data.number)
    router.push(`/admin/${isInvoice ? 'invoices' : 'proposals'}/${res.data.id}` as never)
  }

  const Icon = isInvoice ? ReceiptText : FileSignature
  const label = isInvoice ? 'invoice' : 'proposal'

  return (
    <div className="max-w-[1100px] space-y-6">
      <AdminPageHeader
        eyebrow={`Billing · ${editing ? 'Edit' : 'New'} ${label}`}
        title={editing ? `Edit ${initial!.number}` : `Create ${label}`}
        description={
          isInvoice
            ? 'Bill a client for delivered work. Link an account and project, price from the catalog, and download a PDF.'
            : 'Quote scope and price for a client. Once accepted, convert it to an invoice in one click.'
        }
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: isInvoice ? 'Invoices' : 'Proposals', href: `/admin/${isInvoice ? 'invoices' : 'proposals'}` },
          { label: editing ? 'Edit' : 'New' },
        ]}
      />

      <AdminCard eyebrow="Client & project" title="Who is this for?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Account (client)"
            value={accountId}
            onChange={onAccountChange}
            options={[{ value: '', label: '— No account / prospect —' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
          />
          <SelectField
            label="Project (engagement)"
            value={engagementId}
            onChange={setEngagementId}
            options={[{ value: '', label: '— None —' }, ...projectOptions.map((e) => ({ value: e.id, label: e.name }))]}
          />
          <Field label="Client name (on document)" value={clientName} onChange={setClientName} />
          <Field label="Client email" value={clientEmail} onChange={setClientEmail} />
        </div>
      </AdminCard>

      <AdminCard eyebrow="Details" title={`${isInvoice ? 'Invoice' : 'Proposal'} details`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title" value={title} onChange={setTitle} />
          <SelectField
            label="Status"
            value={status}
            onChange={setStatus}
            options={(isInvoice ? INVOICE_STATUSES : PROPOSAL_STATUSES).map((s) => ({ value: s, label: s }))}
          />
          <Field label="Issue date" value={issueDate} onChange={setIssueDate} hint="YYYY-MM-DD" />
          <Field
            label={isInvoice ? 'Due date' : 'Valid until'}
            value={secondDate}
            onChange={setSecondDate}
            hint="YYYY-MM-DD"
          />
        </div>
      </AdminCard>

      <AdminCard
        eyebrow="Line items"
        title="What's being billed"
        action={
          <select
            value=""
            onChange={(e) => e.target.value && addFromCatalog(e.target.value)}
            className="input !w-auto text-[12px] py-1.5"
          >
            <option value="">+ Add from catalog…</option>
            {services
              .filter((s) => s.active)
              .map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name} (${s.defaultRate}/{s.billingUnit})
                </option>
              ))}
          </select>
        }
      >
        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-[1fr_72px_110px_90px_36px] gap-2 px-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5F6E6D]">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-[1fr_72px_110px_90px_36px] gap-2 items-center">
              <input
                className="input"
                placeholder="Service or item"
                value={r.description}
                onChange={(e) => setRow(i, { description: e.target.value })}
              />
              <input
                className="input text-right"
                type="number"
                min={0}
                value={r.qty}
                onChange={(e) => setRow(i, { qty: Number(e.target.value) })}
              />
              <input
                className="input text-right"
                type="number"
                min={0}
                value={r.unitPrice}
                onChange={(e) => setRow(i, { unitPrice: Number(e.target.value) })}
              />
              <span className="text-right font-mono text-[12.5px] text-[#0F4C4C] tabular-nums">
                ${(Math.max(0, r.qty) * Math.max(0, r.unitPrice)).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-[#B53A2B] hover:text-[#8f2e22] flex justify-center"
                aria-label="Remove line"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#0F766E] hover:text-[#0F4C4C] pt-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add line
          </button>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard eyebrow="Adjustments" title="Tax & discount">
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Discount ($)" value={discount} onChange={setDiscount} />
            <NumberField label="Tax rate (%)" value={taxRate} onChange={setTaxRate} />
            {isInvoice && <NumberField label="Amount paid ($)" value={amountPaid} onChange={setAmountPaid} />}
          </div>
        </AdminCard>

        <AdminCard eyebrow="Totals" title="Summary">
          <dl className="space-y-2 font-mono text-[12.5px] tabular-nums">
            <Row2 label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
            {discount > 0 && <Row2 label="Discount" value={`-$${discount.toLocaleString()}`} />}
            <Row2 label={`Tax (${taxRate}%)`} value={`$${taxAmount.toLocaleString()}`} />
            <div className="h-px bg-[#D5E0DE] my-1" />
            <Row2 label="Total" value={`$${total.toLocaleString()}`} strong />
            {isInvoice && amountPaid > 0 && (
              <>
                <Row2 label="Amount paid" value={`-$${amountPaid.toLocaleString()}`} />
                <Row2 label="Balance due" value={`$${balance.toLocaleString()}`} strong />
              </>
            )}
          </dl>
        </AdminCard>
      </div>

      <AdminCard eyebrow="Notes" title="Notes & terms">
        <div className="space-y-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">Notes</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">Terms</label>
            <textarea rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} className="input" />
          </div>
        </div>
      </AdminCard>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => router.push(`/admin/${isInvoice ? 'invoices' : 'proposals'}` as never)}
          className="inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-3 py-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2.5 rounded-[3px] transition-colors border border-[#0F4C4C] disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
          {editing ? 'Save changes' : `Create ${label}`}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function Row2({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={strong ? 'text-[#0F4C4C] font-semibold' : 'text-[#5F6E6D]'}>{label}</dt>
      <dd className={strong ? 'text-[#0F4C4C] font-semibold text-[14px]' : 'text-[#0F4C4C]'}>{value}</dd>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="input" />
      {hint && <p className="mt-1 font-mono text-[10.5px] text-[#5F6E6D]">{hint}</p>}
    </div>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">{label}</label>
      <input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className="input" />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
