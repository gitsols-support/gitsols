'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Loader2, Briefcase } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { createEngagement } from '@/server/admin-actions'
import type { CreateEngagementRequest } from '@gitsols/types'

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

interface Form {
  accountId: string
  name: string
  type: 'managed' | 'project' | 'discovery'
  service: string
  value: number
  startDate: string
  notes: string
  applyTemplate: boolean
  openPortal: boolean
}

const empty: Form = {
  accountId: '',
  name: '',
  type: 'managed',
  service: 'managed-it',
  value: 0,
  startDate: new Date().toISOString().slice(0, 10),
  notes: '',
  applyTemplate: true,
  openPortal: true,
}

export default function EngagementFormClient({
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

  async function submit() {
    const e: Record<string, string> = {}
    if (!form.accountId) e.accountId = 'Pick a client'
    if (!form.name.trim()) e.name = 'Required'
    if (form.value <= 0) e.value = 'Must be positive'
    setErrors(e)
    if (Object.keys(e).length) {
      push('error', 'Check the form', 'Required fields are missing.')
      return
    }
    setSaving(true)
    const payload: CreateEngagementRequest = {
      name: form.name.trim(),
      accountId: form.accountId,
      type: form.type,
      startedAt: form.startDate || undefined,
      mrrOrValue: form.value,
      serviceSlug: form.service || undefined,
    }
    const res = await createEngagement(payload)
    if (!res.ok) {
      setSaving(false)
      push('error', 'Could not create engagement', res.error)
      return
    }
    push('success', 'Engagement created', `${form.name} kicked off.`)
    router.push(`/admin/engagements/${res.data.id}` as never)
  }

  return (
    <div className="max-w-[1000px] space-y-6">
      <AdminPageHeader
        eyebrow="Delivery · New record"
        title="Create engagement"
        description="Open a new project or managed retainer. Applies the matching service-catalog template by default."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Engagements', href: '/admin/engagements' },
          { label: 'New' },
        ]}
      />

      <AdminCard eyebrow="Client" title="Pick the account">
        <select
          value={form.accountId}
          onChange={(e) => update('accountId', e.target.value)}
          className={`input ${errors.accountId ? 'border-[#B53A2B]' : ''}`}
        >
          <option value="">— Select an account —</option>
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
      </AdminCard>

      <AdminCard eyebrow="Scope" title="What kind of engagement?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Engagement name"
            value={form.name}
            onChange={(v) => update('name', v)}
            required
            error={errors.name}
          />
          <SelectField
            label="Type"
            value={form.type}
            onChange={(v) => update('type', v as Form['type'])}
            options={[
              { value: 'managed', label: 'Managed retainer (MRR)' },
              { value: 'project', label: 'Fixed-scope project' },
              { value: 'discovery', label: 'Discovery sprint' },
            ]}
          />
          <SelectField
            label="Primary service"
            value={form.service}
            onChange={(v) => update('service', v)}
            options={SERVICES.map((s) => ({ value: s, label: s }))}
          />
          <NumberField
            label={form.type === 'managed' ? 'MRR ($)' : 'Total value ($)'}
            value={form.value}
            onChange={(v) => update('value', v)}
            required
            error={errors.value}
          />
          <Field
            label="Start date"
            value={form.startDate}
            onChange={(v) => update('startDate', v)}
            hint="YYYY-MM-DD"
          />
        </div>
      </AdminCard>

      <AdminCard eyebrow="Options" title="On creation">
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 cursor-pointer">
            <input
              type="checkbox"
              checked={form.applyTemplate}
              onChange={(e) => update('applyTemplate', e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#0F766E]"
            />
            <div>
              <p className="text-[13px] font-semibold text-[#0F4C4C]">
                Apply default milestone template
              </p>
              <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                Pre-populates the 9-stage lifecycle plus service-specific deliverables.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 cursor-pointer">
            <input
              type="checkbox"
              checked={form.openPortal}
              onChange={(e) => update('openPortal', e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#0F766E]"
            />
            <div>
              <p className="text-[13px] font-semibold text-[#0F4C4C]">Open client portal access</p>
              <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                Sends invite to primary contact. Portal-visibility milestones become live.
              </p>
            </div>
          </label>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
              Internal notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Context for the team — not shared with the client."
              className="input"
            />
          </div>
        </div>
      </AdminCard>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => router.push('/admin/engagements')}
          className="inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-3 py-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2.5 rounded-[3px] transition-colors border border-[#0F4C4C] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
          Create engagement
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  error,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
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
        type="text"
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

function NumberField({
  label,
  value,
  onChange,
  required,
  error,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  required?: boolean
  error?: string
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
        {required && <span className="text-[#B53A2B] ml-1">*</span>}
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`input ${error ? 'border-[#B53A2B]' : ''}`}
      />
      {error && (
        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#B53A2B]">
          {error}
        </p>
      )}
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
