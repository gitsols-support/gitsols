'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { createAccount } from '@/server/admin-actions'
import type { CreateAccountRequest } from '@gitsols/types'

const TIERS = [
  { value: 'enterprise', label: 'Enterprise', hint: '500+ seats · dedicated team' },
  { value: 'mid-market', label: 'Mid-market', hint: '100–500 seats · named PM' },
  { value: 'smb', label: 'SMB', hint: 'Under 100 seats · pooled support' },
] as const

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'financial-services', label: 'Financial services' },
  { value: 'professional-services', label: 'Professional services' },
] as const

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

const STEPS = [
  { id: 1, label: 'Firm' },
  { id: 2, label: 'Primary contact' },
  { id: 3, label: 'Services' },
  { id: 4, label: 'Engagement' },
] as const

interface Form {
  // Step 1
  legalName: string
  tradingAs: string
  industry: string
  tier: typeof TIERS[number]['value']
  seats: number
  // Step 2
  contactName: string
  contactEmail: string
  contactPhone: string
  contactRole: string
  invitePortal: boolean
  // Step 3
  servicesSubscribed: string[]
  estMrr: number
  // Step 4
  startEngagement: boolean
  engagementName: string
  engagementType: 'managed' | 'project' | 'discovery'
  startDate: string
}

const empty: Form = {
  legalName: '',
  tradingAs: '',
  industry: 'healthcare',
  tier: 'mid-market',
  seats: 0,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactRole: 'Primary contact',
  invitePortal: true,
  servicesSubscribed: [],
  estMrr: 0,
  startEngagement: true,
  engagementName: 'Onboarding sprint',
  engagementType: 'managed',
  startDate: new Date().toISOString().slice(0, 10),
}

export default function NewAccountPage() {
  const router = useRouter()
  const { push } = useToast()
  const [step, setStep] = useState(1)
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

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!form.legalName.trim()) e.legalName = 'Required'
      if (form.seats < 1) e.seats = 'Must be at least 1'
    }
    if (s === 2) {
      if (!form.contactName.trim()) e.contactName = 'Required'
      if (!form.contactEmail.trim()) e.contactEmail = 'Required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Invalid email'
    }
    if (s === 3 && form.servicesSubscribed.length === 0) {
      e.servicesSubscribed = 'Pick at least one service'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validateStep(step)) {
      push('error', 'Check the form', 'Required fields are missing.')
      return
    }
    if (step < STEPS.length) setStep(step + 1)
  }
  function prev() {
    if (step > 1) setStep(step - 1)
  }

  async function submit() {
    if (!validateStep(step)) {
      push('error', 'Check the form', 'Required fields are missing.')
      return
    }
    setSaving(true)
    const payload: CreateAccountRequest = {
      name: form.legalName.trim(),
      industry: (form.industry || undefined) as CreateAccountRequest['industry'],
      tier: form.tier,
      primaryContact: form.contactName.trim() || undefined,
      primaryEmail: form.contactEmail.trim() || undefined,
      mrr: form.estMrr,
      seats: form.seats,
      status: 'onboarding',
      since: form.startDate || undefined,
      servicesUsed: form.servicesSubscribed.length ? form.servicesSubscribed : undefined,
    }
    const res = await createAccount(payload)
    if (!res.ok) {
      setSaving(false)
      push('error', 'Could not create account', res.error)
      return
    }
    push(
      'success',
      'Account created',
      `${form.legalName} is now in onboarding${form.startEngagement ? ' with an engagement open' : ''}.`,
    )
    router.push(`/admin/accounts/${res.data.id}` as never)
  }

  function toggleService(s: string) {
    update(
      'servicesSubscribed',
      form.servicesSubscribed.includes(s)
        ? form.servicesSubscribed.filter((x) => x !== s)
        : [...form.servicesSubscribed, s],
    )
  }

  return (
    <div className="max-w-[1100px] space-y-6">
      <AdminPageHeader
        eyebrow="CRM · New account"
        title="Create account"
        description="Convert a signed deal into an active client. Each step pre-populates the next."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Accounts', href: '/admin/accounts' },
          { label: 'New' },
        ]}
      />

      {/* Stepper */}
      <div className="bg-white border border-[#D5E0DE] rounded-[4px] p-5 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
        <ol className="grid grid-cols-4 gap-0">
          {STEPS.map((s, i) => {
            const done = step > s.id
            const active = step === s.id
            return (
              <li key={s.id} className="relative">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-serif text-[14px] flex-shrink-0 ${
                      done
                        ? 'bg-[#0F766E] text-white'
                        : active
                          ? 'bg-[#0F4C4C] text-white border-2 border-[#0F766E]'
                          : 'bg-[#F4F8F7] text-[#5F6E6D] border border-[#D5E0DE]'
                    }`}
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`font-mono text-[10px] uppercase tracking-[0.18em] ${active ? 'text-[#0F4C4C]' : 'text-[#5F6E6D]'}`}
                    >
                      Step {s.id}
                    </p>
                    <p
                      className={`font-serif text-[15px] tracking-[-0.005em] ${active || done ? 'text-[#0F4C4C]' : 'text-[#5F6E6D]'}`}
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {s.label}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={`hidden md:block absolute top-4 left-[calc(100%-1rem)] right-0 h-px ${done ? 'bg-[#0F766E]' : 'bg-[#D5E0DE]'}`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>

      {/* Step content */}
      {step === 1 && (
        <AdminCard eyebrow="Step 1" title="Firm details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Legal name"
              value={form.legalName}
              onChange={(v) => update('legalName', v)}
              required
              error={errors.legalName}
            />
            <Field label="Trading as" value={form.tradingAs} onChange={(v) => update('tradingAs', v)} />
            <SelectField
              label="Industry"
              value={form.industry}
              onChange={(v) => update('industry', v)}
              options={[...INDUSTRIES]}
            />
            <NumberField
              label="Seats"
              value={form.seats}
              onChange={(v) => update('seats', v)}
              required
              error={errors.seats}
            />
            <div className="md:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                Tier
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {TIERS.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-3 p-3 rounded-[3px] border cursor-pointer transition-colors ${
                      form.tier === t.value
                        ? 'border-[#0F766E] bg-[#ECFEFE]'
                        : 'border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={form.tier === t.value}
                      onChange={() => update('tier', t.value)}
                      className="mt-0.5 w-4 h-4 accent-[#0F766E]"
                    />
                    <div>
                      <p className="text-[13px] font-semibold text-[#0F4C4C]">{t.label}</p>
                      <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">{t.hint}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {step === 2 && (
        <AdminCard eyebrow="Step 2" title="Primary contact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Name"
              value={form.contactName}
              onChange={(v) => update('contactName', v)}
              required
              error={errors.contactName}
            />
            <Field
              label="Email"
              type="email"
              value={form.contactEmail}
              onChange={(v) => update('contactEmail', v)}
              required
              error={errors.contactEmail}
            />
            <Field
              label="Phone"
              type="tel"
              value={form.contactPhone}
              onChange={(v) => update('contactPhone', v)}
            />
            <Field
              label="Role"
              value={form.contactRole}
              onChange={(v) => update('contactRole', v)}
            />
            <div className="md:col-span-2">
              <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.invitePortal}
                  onChange={(e) => update('invitePortal', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#0F766E]"
                />
                <div>
                  <p className="text-[13px] font-semibold text-[#0F4C4C]">Invite to client portal</p>
                  <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                    Sends a magic-link sign-up email immediately after the account is created.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </AdminCard>
      )}

      {step === 3 && (
        <AdminCard eyebrow="Step 3" title="Services subscribed">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                Pick all that apply ({form.servicesSubscribed.length} selected)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SERVICES.map((s) => {
                  const selected = form.servicesSubscribed.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={`text-left p-3 rounded-[3px] border transition-colors ${
                        selected
                          ? 'bg-[#0F4C4C] text-white border-[#0F766E]'
                          : 'bg-white text-[#0F4C4C] border-[#D5E0DE] hover:border-[#0F4C4C]/40'
                      }`}
                    >
                      <p className="text-[13px] font-semibold">{s}</p>
                      <p className={`font-mono text-[10px] uppercase tracking-[0.14em] mt-1 ${selected ? 'text-[#CFFAFA]' : 'text-[#5F6E6D]'}`}>
                        {selected ? '✓ subscribed' : 'click to add'}
                      </p>
                    </button>
                  )
                })}
              </div>
              {errors.servicesSubscribed && (
                <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#B53A2B]">
                  {errors.servicesSubscribed}
                </p>
              )}
            </div>
            <NumberField
              label="Estimated MRR ($)"
              value={form.estMrr}
              onChange={(v) => update('estMrr', v)}
            />
          </div>
        </AdminCard>
      )}

      {step === 4 && (
        <AdminCard eyebrow="Step 4" title="Initial engagement">
          <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={form.startEngagement}
              onChange={(e) => update('startEngagement', e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#0F766E]"
            />
            <div>
              <p className="text-[13px] font-semibold text-[#0F4C4C]">
                Open an engagement on account creation
              </p>
              <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                Pre-populates milestones from the service catalog template. You can edit afterward.
              </p>
            </div>
          </label>

          {form.startEngagement && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Engagement name"
                value={form.engagementName}
                onChange={(v) => update('engagementName', v)}
              />
              <SelectField
                label="Type"
                value={form.engagementType}
                onChange={(v) => update('engagementType', v as Form['engagementType'])}
                options={[
                  { value: 'managed', label: 'Managed retainer' },
                  { value: 'project', label: 'Fixed project' },
                  { value: 'discovery', label: 'Discovery sprint' },
                ]}
              />
              <Field
                label="Start date"
                value={form.startDate}
                onChange={(v) => update('startDate', v)}
                hint="YYYY-MM-DD"
              />
            </div>
          )}
        </AdminCard>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => router.push('/admin/accounts')}
          className="inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-3 py-2 transition-colors"
        >
          Cancel
        </button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={prev}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-2.5 rounded-[3px] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-4 py-2.5 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              Continue
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2.5 rounded-[3px] transition-colors border border-[#0F4C4C] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Create account
            </button>
          )}
        </div>
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
      {hint && !error && (
        <p className="mt-1 font-mono text-[10.5px] text-[#5F6E6D]">{hint}</p>
      )}
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
