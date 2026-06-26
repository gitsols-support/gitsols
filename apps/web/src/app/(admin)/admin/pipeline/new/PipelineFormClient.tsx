'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Loader2, GitBranch, Plus, Trash2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { createOpportunity } from '@/server/admin-actions'
import type { CreateOpportunityRequest } from '@gitsols/types'

const SERVICES = [
  'managed-it',
  'cybersecurity',
  'compliance',
  'cloud',
  'business-phone',
  'communications',
  'network',
  'bespoke-software',
]

interface LineDraft {
  id: string
  service: string
  qty: number
  rate: number
  recurring: boolean
}

interface Form {
  linkExisting: boolean
  accountId: string
  prospectName: string
  industry: string
  contactName: string
  contactEmail: string
  contactPhone: string
  type: 'new-business' | 'expansion' | 'renewal'
  source: 'contact_form' | 'free_it_audit' | 'service_inquiry' | 'phone' | 'referral' | 'rfp'
  name: string
  value: number
  probability: number
  expectedClose: string
  servicesInScope: string[]
  lineItems: LineDraft[]
  notes: string
  owner: string
}

const empty: Form = {
  linkExisting: true,
  accountId: '',
  prospectName: '',
  industry: 'healthcare',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  type: 'new-business',
  source: 'contact_form',
  name: '',
  value: 0,
  probability: 20,
  expectedClose: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  servicesInScope: [],
  lineItems: [],
  notes: '',
  owner: 'Sohail Akram',
}

export default function PipelineFormClient({
  accounts,
}: {
  accounts: { id: string; name: string }[]
}) {
  const router = useRouter()
  const { push } = useToast()
  const [form, setForm] = useState<Form>(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key as string]) {
      setErrors((e) => {
        const x = { ...e }
        delete x[key as string]
        return x
      })
    }
  }

  function toggleService(s: string) {
    update(
      'servicesInScope',
      form.servicesInScope.includes(s)
        ? form.servicesInScope.filter((x) => x !== s)
        : [...form.servicesInScope, s],
    )
  }

  function addLine() {
    const id = `li-${Date.now()}`
    update('lineItems', [
      ...form.lineItems,
      {
        id,
        service: form.servicesInScope[0] ?? 'managed-it',
        qty: 1,
        rate: 120,
        recurring: true,
      },
    ])
  }

  function updateLine(id: string, patch: Partial<LineDraft>) {
    update(
      'lineItems',
      form.lineItems.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    )
  }

  function removeLine(id: string) {
    update('lineItems', form.lineItems.filter((l) => l.id !== id))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (form.linkExisting && !form.accountId) e.accountId = 'Pick an account'
    if (!form.linkExisting && !form.prospectName.trim()) e.prospectName = 'Required'
    if (!form.name.trim()) e.name = 'Required'
    if (form.value <= 0) e.value = 'Must be positive'
    if (!form.expectedClose) e.expectedClose = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Auto-calculate suggested value from line items
  const recurringMo = form.lineItems.filter((l) => l.recurring).reduce((s, l) => s + l.qty * l.rate, 0)
  const oneTime = form.lineItems.filter((l) => !l.recurring).reduce((s, l) => s + l.qty * l.rate, 0)
  const suggestedYear1 = recurringMo * 12 + oneTime

  function applySuggested() {
    update('value', suggestedYear1)
  }

  async function submit() {
    if (!validate()) {
      push('error', 'Check the form', 'A few required fields need attention.')
      return
    }
    setSaving(true)
    // prospectName is required by the API. When linking an existing account we
    // derive it from the selected account's name; for a fresh prospect we use
    // the typed-in value.
    const selectedAccount = form.linkExisting
      ? accounts.find((a) => a.id === form.accountId)
      : undefined
    const prospectName = form.linkExisting
      ? selectedAccount?.name ?? form.name.trim()
      : form.prospectName.trim()
    const payload: CreateOpportunityRequest = {
      name: form.name.trim(),
      prospectName,
      accountId: form.linkExisting ? form.accountId : undefined,
      industry: form.linkExisting
        ? undefined
        : (form.industry || undefined) as CreateOpportunityRequest['industry'],
      type: form.type,
      value: form.value,
      probability: form.probability,
      expectedClose: form.expectedClose || undefined,
      owner: form.owner.trim() || undefined,
      source: form.source,
      servicesInScope: form.servicesInScope.length ? form.servicesInScope : undefined,
      primaryContact: form.linkExisting ? undefined : form.contactName.trim() || undefined,
      primaryEmail: form.linkExisting ? undefined : form.contactEmail.trim() || undefined,
      lineItems: form.lineItems.length
        ? form.lineItems.map(({ service, qty, rate, recurring }) => ({
            service,
            qty,
            rate,
            recurring,
          }))
        : undefined,
    }
    const res = await createOpportunity(payload)
    if (!res.ok) {
      setSaving(false)
      push('error', 'Could not create opportunity', res.error)
      return
    }
    push('success', 'Opportunity created', `${form.name} is in the pipeline.`)
    router.push(`/admin/pipeline/${res.data.id}` as never)
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      <AdminPageHeader
        eyebrow="CRM · New opportunity"
        title="Create opportunity"
        description="Open a deal in the pipeline. Link to an existing account or capture a fresh prospect."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Pipeline', href: '/admin/pipeline' },
          { label: 'New' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <AdminCard eyebrow="Buyer" title="Who's this opportunity for?">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label
                  className={`flex items-start gap-3 p-3 rounded-[3px] border cursor-pointer transition-colors ${
                    form.linkExisting
                      ? 'bg-[#ECFEFE] border-[#0F766E]'
                      : 'bg-white border-[#D5E0DE] hover:border-[#0F4C4C]/40'
                  }`}
                >
                  <input
                    type="radio"
                    checked={form.linkExisting}
                    onChange={() => update('linkExisting', true)}
                    className="mt-0.5 w-4 h-4 accent-[#0F766E]"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-[#0F4C4C]">Existing account</p>
                    <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                      Expansion or renewal of a current client.
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-3 p-3 rounded-[3px] border cursor-pointer transition-colors ${
                    !form.linkExisting
                      ? 'bg-[#ECFEFE] border-[#0F766E]'
                      : 'bg-white border-[#D5E0DE] hover:border-[#0F4C4C]/40'
                  }`}
                >
                  <input
                    type="radio"
                    checked={!form.linkExisting}
                    onChange={() => update('linkExisting', false)}
                    className="mt-0.5 w-4 h-4 accent-[#0F766E]"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-[#0F4C4C]">New prospect</p>
                    <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                      No account yet — converts on Close Won.
                    </p>
                  </div>
                </label>
              </div>

              {form.linkExisting ? (
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                    Account <span className="text-[#B53A2B]">*</span>
                  </label>
                  <select
                    value={form.accountId}
                    onChange={(e) => update('accountId', e.target.value)}
                    className={`input ${errors.accountId ? 'border-[#B53A2B]' : ''}`}
                  >
                    <option value="">— Pick an account —</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {errors.accountId && (
                    <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#B53A2B]">
                      {errors.accountId}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Prospect name"
                    value={form.prospectName}
                    onChange={(v) => update('prospectName', v)}
                    required
                    error={errors.prospectName}
                  />
                  <SelectField
                    label="Industry"
                    value={form.industry}
                    onChange={(v) => update('industry', v)}
                    options={[
                      { value: 'healthcare', label: 'Healthcare' },
                      { value: 'financial-services', label: 'Financial services' },
                      { value: 'professional-services', label: 'Professional services' },
                    ]}
                  />
                  <Field
                    label="Primary contact"
                    value={form.contactName}
                    onChange={(v) => update('contactName', v)}
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(v) => update('contactEmail', v)}
                  />
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard eyebrow="Deal" title="Scope">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Deal name"
                  value={form.name}
                  onChange={(v) => update('name', v)}
                  required
                  error={errors.name}
                  hint='e.g. "Lakeside · HIPAA program rebuild"'
                />
                <SelectField
                  label="Type"
                  value={form.type}
                  onChange={(v) => update('type', v as Form['type'])}
                  options={[
                    { value: 'new-business', label: 'New business' },
                    { value: 'expansion', label: 'Expansion' },
                    { value: 'renewal', label: 'Renewal' },
                  ]}
                />
                <SelectField
                  label="Source"
                  value={form.source}
                  onChange={(v) => update('source', v as Form['source'])}
                  options={[
                    { value: 'contact_form', label: 'Contact form' },
                    { value: 'free_it_audit', label: 'Free IT audit' },
                    { value: 'service_inquiry', label: 'Service inquiry' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'referral', label: 'Referral' },
                    { value: 'rfp', label: 'RFP' },
                  ]}
                />
                <Field
                  label="Expected close"
                  value={form.expectedClose}
                  onChange={(v) => update('expectedClose', v)}
                  type="date"
                  required
                  error={errors.expectedClose}
                />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                  Services in scope ({form.servicesInScope.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SERVICES.map((s) => {
                    const selected = form.servicesInScope.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleService(s)}
                        className={`text-left p-2.5 rounded-[3px] border transition-colors ${
                          selected
                            ? 'bg-[#0F4C4C] text-white border-[#0F766E]'
                            : 'bg-white text-[#0F4C4C] border-[#D5E0DE] hover:border-[#0F4C4C]/40'
                        }`}
                      >
                        <p className="text-[12.5px] font-semibold">{s}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard
            eyebrow="Commercial"
            title="Line items"
            description="Build the quote line by line. Total feeds into deal value."
            action={
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add line
              </button>
            }
          >
            {form.lineItems.length === 0 ? (
              <p className="text-[12.5px] text-[#5F6E6D] text-center py-4">
                No line items yet — add one or just enter a deal value below.
              </p>
            ) : (
              <ul className="space-y-2 mb-3">
                {form.lineItems.map((l) => (
                  <li
                    key={l.id}
                    className="grid grid-cols-[1fr_70px_100px_90px_28px] gap-2 items-center p-2.5 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60"
                  >
                    <select
                      value={l.service}
                      onChange={(e) => updateLine(l.id, { service: e.target.value })}
                      className="input text-[12.5px]"
                    >
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => updateLine(l.id, { qty: Number(e.target.value) })}
                      className="input text-[12.5px]"
                    />
                    <input
                      type="number"
                      min={0}
                      value={l.rate}
                      onChange={(e) => updateLine(l.id, { rate: Number(e.target.value) })}
                      className="input text-[12.5px]"
                    />
                    <label className="inline-flex items-center gap-1.5 text-[11.5px] text-[#0F4C4C]">
                      <input
                        type="checkbox"
                        checked={l.recurring}
                        onChange={(e) => updateLine(l.id, { recurring: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#0F766E]"
                      />
                      MRR
                    </label>
                    <button
                      type="button"
                      onClick={() => removeLine(l.id)}
                      className="w-7 h-7 rounded-[3px] text-[#5F6E6D] hover:bg-[#FBE6E1] hover:text-[#B53A2B] flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {form.lineItems.length > 0 && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-[3px] border border-[#0F766E]/30 bg-[#ECFEFE]">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0F766E]">
                    Suggested year-1 value
                  </p>
                  <p
                    className="font-serif text-[24px] text-[#0F4C4C] tracking-[-0.01em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    ${suggestedYear1.toLocaleString()}
                  </p>
                  <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5">
                    ${recurringMo.toLocaleString()}/mo recurring + ${oneTime.toLocaleString()} one-time
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applySuggested}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-3 py-2 rounded-[3px] border border-[#082F2F]"
                >
                  Apply
                </button>
              </div>
            )}
          </AdminCard>

          <AdminCard eyebrow="Notes" title="Internal context">
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="What's driving this deal, internal commentary…"
              className="input"
            />
          </AdminCard>
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <AdminCard eyebrow="Forecast" title="Deal value">
            <div className="space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                  Value ($)
                  <span className="text-[#B53A2B] ml-1">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(e) => update('value', Number(e.target.value))}
                  className={`input ${errors.value ? 'border-[#B53A2B]' : ''}`}
                />
                {errors.value && (
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#B53A2B]">
                    {errors.value}
                  </p>
                )}
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                  Probability · {form.probability}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.probability}
                  onChange={(e) => update('probability', Number(e.target.value))}
                  className="w-full accent-[#0F766E]"
                />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F766E] mt-2">
                  Weighted · ${Math.round((form.value * form.probability) / 100).toLocaleString()}
                </p>
              </div>
              <Field
                label="Owner"
                value={form.owner}
                onChange={(v) => update('owner', v)}
              />
            </div>
          </AdminCard>

          <AdminCard eyebrow="Save" title="Finish">
            <div className="space-y-2">
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="w-full group inline-flex items-center justify-between gap-2 bg-[#0F766E] hover:bg-[#0F4C4C] text-white text-[13px] font-semibold px-4 py-3 rounded-[3px] transition-colors border border-[#0F4C4C] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
                  Create opportunity
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/pipeline')}
                className="w-full inline-flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </AdminCard>
        </aside>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  error,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  error?: string
  hint?: string
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
        {required && <span className="text-[#B53A2B] ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input ${error ? 'border-[#B53A2B]' : ''}`}
      />
      {error && (
        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#B53A2B]">
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1 font-mono text-[10.5px] text-[#5F6E6D]">{hint}</p>}
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
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
      </label>
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
