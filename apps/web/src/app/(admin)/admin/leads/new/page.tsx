'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Loader2, X } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { createLead } from '@/server/admin-actions'
import type { CreateLeadRequest } from '@gitsols/types'

const SOURCES = [
  { value: 'contact_form', label: 'Contact form' },
  { value: 'free_it_audit', label: 'Free IT audit intake' },
  { value: 'service_inquiry', label: 'Service inquiry' },
  { value: 'bespoke_scope_request', label: 'Bespoke scope request' },
  { value: 'phone', label: 'Phone call' },
  { value: 'referral', label: 'Referral' },
] as const

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'financial-services', label: 'Financial services' },
  { value: 'professional-services', label: 'Professional services' },
] as const

const SERVICE_INTERESTS = [
  'managed-it',
  'cybersecurity',
  'compliance',
  'cloud',
  'business-phone',
  'communications',
  'network',
  'bespoke-software',
]

interface FormState {
  name: string
  email: string
  phone: string
  company: string
  industry: string
  source: string
  serviceInterest: string
  message: string
  initialScore: number
  assignToMe: boolean
  notifyOwner: boolean
  tags: string[]
}

const empty: FormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  industry: 'healthcare',
  source: 'contact_form',
  serviceInterest: '',
  message: '',
  initialScore: 50,
  assignToMe: true,
  notifyOwner: true,
  tags: [],
}

export default function NewLeadPage() {
  const router = useRouter()
  const { push } = useToast()
  const [form, setForm] = useState<FormState>(empty)
  const [tagDraft, setTagDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key as string]) {
      setErrors((e) => {
        const next = { ...e }
        delete next[key as string]
        return next
      })
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.company.trim()) e.company = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(_mode: 'save' | 'save-and-open') {
    if (!validate()) {
      push('error', 'Check the form', 'A few required fields need attention.')
      return
    }
    setSaving(true)
    const payload: CreateLeadRequest = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      message: form.message.trim() || undefined,
      serviceInterest: form.serviceInterest || undefined,
      industry: form.industry || undefined,
      source: form.source as CreateLeadRequest['source'],
    }
    const res = await createLead(payload)
    if (!res.ok) {
      setSaving(false)
      push('error', 'Could not create lead', res.error)
      return
    }
    push('success', 'Lead created', `${form.name} from ${form.company} added.`)
    // The lead create response is { id, status } with no detail route, so both
    // actions return to the queue.
    router.push('/admin/leads')
  }

  function addTag() {
    const t = tagDraft.trim()
    if (!t) return
    if (form.tags.includes(t)) {
      push('info', 'Tag exists', `"${t}" is already attached.`)
      setTagDraft('')
      return
    }
    update('tags', [...form.tags, t])
    setTagDraft('')
  }

  function removeTag(t: string) {
    update(
      'tags',
      form.tags.filter((x) => x !== t),
    )
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      <AdminPageHeader
        eyebrow="CRM · New record"
        title="Create lead"
        description="Capture an inbound inquiry manually. Triggers the same scoring + routing as form-submitted leads."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Leads', href: '/admin/leads' },
          { label: 'New' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <AdminCard eyebrow="Person" title="Who is reaching out">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full name"
                value={form.name}
                onChange={(v) => update('name', v)}
                required
                error={errors.name}
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => update('email', v)}
                required
                error={errors.email}
              />
              <Field
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) => update('phone', v)}
              />
              <Field
                label="Company"
                value={form.company}
                onChange={(v) => update('company', v)}
                required
                error={errors.company}
              />
            </div>
          </AdminCard>

          <AdminCard eyebrow="Inquiry" title="Context">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField
                  label="Industry"
                  value={form.industry}
                  onChange={(v) => update('industry', v)}
                  options={INDUSTRIES}
                />
                <SelectField
                  label="Source"
                  value={form.source}
                  onChange={(v) => update('source', v)}
                  options={SOURCES}
                />
                <SelectField
                  label="Service interest"
                  value={form.serviceInterest}
                  onChange={(v) => update('serviceInterest', v)}
                  options={[
                    { value: '', label: '— none —' },
                    ...SERVICE_INTERESTS.map((s) => ({ value: s, label: s })),
                  ]}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="Anything they wrote, or your notes from the call…"
                  className="input"
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard eyebrow="Triage" title="Tags & priority">
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
                  {form.tags.length === 0 && (
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]/70">
                      No tags yet
                    </span>
                  )}
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-[#B53A2B]"
                        aria-label={`Remove ${t}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="Add a tag, press Enter…"
                    className="input"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="inline-flex items-center text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-2 rounded-[3px] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                  Initial score · {form.initialScore}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={form.initialScore}
                  onChange={(e) => update('initialScore', Number(e.target.value))}
                  className="w-full accent-[#0F766E]"
                />
                <div className="flex justify-between font-mono text-[10px] text-[#5F6E6D] mt-1">
                  <span>Cold (0)</span>
                  <span>Hot (100)</span>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <AdminCard eyebrow="Routing" title="On save">
            <div className="space-y-3">
              <Checkbox
                checked={form.assignToMe}
                onChange={(v) => update('assignToMe', v)}
                label="Assign to me"
                hint="Otherwise enters the unassigned queue."
              />
              <Checkbox
                checked={form.notifyOwner}
                onChange={(v) => update('notifyOwner', v)}
                label="Notify owner via email"
                hint="Sends a digest with score + message."
              />
            </div>
          </AdminCard>

          <AdminCard eyebrow="Save" title="Finish">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => submit('save-and-open')}
                disabled={saving}
                className="w-full group inline-flex items-center justify-between gap-2 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[13px] font-semibold px-4 py-3 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save & open lead
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => submit('save')}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-3 rounded-[3px] transition-colors disabled:opacity-60"
              >
                Save & return to queue
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/leads')}
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
  required = false,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
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
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input ${error ? 'border-[#B53A2B]' : ''}`}
      />
      {error && <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#B53A2B]">{error}</p>}
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
  options: readonly { value: string; label: string }[]
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

function Checkbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 hover:border-[#0F4C4C]/40 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#0F766E]"
      />
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-[#0F4C4C] leading-tight">{label}</p>
        {hint && <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">{hint}</p>}
      </div>
    </label>
  )
}
