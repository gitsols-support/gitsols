'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Code2,
  Smartphone,
  LayoutDashboard,
  Database,
  Sparkles,
  Cable,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { createBespokeProject } from '@/server/admin-actions'
import type { CreateBespokeProjectRequest } from '@gitsols/types'

const TYPES = [
  { value: 'web-app', label: 'Web App', icon: LayoutDashboard, desc: 'Customer portals, internal tools, SaaS MVPs' },
  { value: 'mobile-app', label: 'Mobile App', icon: Smartphone, desc: 'React Native, iOS + Android from one codebase' },
  { value: 'crm', label: 'Custom CRM', icon: Database, desc: 'Vertical-specific operational software' },
  { value: 'ai-tool', label: 'AI Tool', icon: Sparkles, desc: 'RAG, agents, triage automation, voice/SMS bots' },
  { value: 'integration', label: 'Integration', icon: Cable, desc: 'Wire existing tools (EHR ↔ billing, M365 ↔ CRM)' },
] as const

const STEPS = [
  { id: 1, label: 'Client' },
  { id: 2, label: 'Project' },
  { id: 3, label: 'Commercial' },
  { id: 4, label: 'Team & dates' },
] as const

interface Form {
  accountId: string
  type: typeof TYPES[number]['value']
  name: string
  description: string
  billing: 'fixed' | 't-and-m' | 'hybrid'
  contractValue: number
  startDate: string
  targetGoLive: string
  lead: string
  teamSize: number
  startWithDiscovery: boolean
  notifyClient: boolean
}

const empty: Form = {
  accountId: '',
  type: 'web-app',
  name: '',
  description: '',
  billing: 'fixed',
  contractValue: 0,
  startDate: new Date().toISOString().slice(0, 10),
  targetGoLive: '',
  lead: 'Sohail Akram',
  teamSize: 3,
  startWithDiscovery: true,
  notifyClient: true,
}

export default function BespokeFormClient({
  accounts,
}: {
  accounts: { id: string; name: string }[]
}) {
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
    if (s === 1 && !form.accountId) e.accountId = 'Pick a client'
    if (s === 2) {
      if (!form.name.trim()) e.name = 'Required'
    }
    if (s === 3 && form.contractValue <= 0) e.contractValue = 'Must be positive'
    if (s === 4 && !form.targetGoLive) e.targetGoLive = 'Required'
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
    const payload: CreateBespokeProjectRequest = {
      name: form.name.trim(),
      accountId: form.accountId || undefined,
      type: form.type,
      // "Start with a discovery sprint" maps onto the discovery stage; otherwise
      // let the API apply its default starting stage.
      stage: form.startWithDiscovery ? 'discovery' : undefined,
      billing: form.billing,
      contractValue: form.contractValue,
      startedAt: form.startDate || undefined,
      targetGoLive: form.targetGoLive || undefined,
      lead: form.lead.trim() || undefined,
      team: form.teamSize,
    }
    const res = await createBespokeProject(payload)
    if (!res.ok) {
      setSaving(false)
      push('error', 'Could not create project', res.error)
      return
    }
    push(
      'success',
      'Project created',
      `${form.name} kicked off${form.startWithDiscovery ? ' in discovery' : ''}.`,
    )
    router.push(`/admin/bespoke/${res.data.id}` as never)
  }

  return (
    <div className="max-w-[1100px] space-y-6">
      <AdminPageHeader
        eyebrow="Delivery · New project"
        title="Create bespoke project"
        description="Spin up a new build engagement. Start at discovery or jump straight into the build."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Bespoke', href: '/admin/bespoke' },
          { label: 'New' },
        ]}
      />

      <div className="bg-white border border-[#D5E0DE] rounded-[4px] p-5 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
        <ol className="grid grid-cols-4 gap-0">
          {STEPS.map((s) => {
            const done = step > s.id
            const active = step === s.id
            return (
              <li key={s.id} className="flex items-center gap-3">
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
                <p
                  className={`font-mono text-[10.5px] uppercase tracking-[0.18em] ${active || done ? 'text-[#0F4C4C]' : 'text-[#5F6E6D]'}`}
                >
                  {s.label}
                </p>
              </li>
            )
          })}
        </ol>
      </div>

      {step === 1 && (
        <AdminCard eyebrow="Step 1" title="Which client?">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[460px] overflow-y-auto">
            {accounts.map((a) => {
              const selected = form.accountId === a.id
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => update('accountId', a.id)}
                  className={`text-left p-4 rounded-[3px] border transition-colors ${
                    selected
                      ? 'bg-[#0F4C4C] text-white border-[#0F766E]'
                      : 'bg-white text-[#0F4C4C] border-[#D5E0DE] hover:border-[#0F4C4C]/40'
                  }`}
                >
                  <p
                    className="font-serif text-[16px] tracking-[-0.005em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {a.name}
                  </p>
                </button>
              )
            })}
          </div>
          {accounts.length === 0 && (
            <p className="mt-3 text-[12.5px] text-[#5F6E6D]">
              No accounts yet — create an account first to attach a project.
            </p>
          )}
          {errors.accountId && (
            <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#B53A2B]">
              {errors.accountId}
            </p>
          )}
        </AdminCard>
      )}

      {step === 2 && (
        <AdminCard eyebrow="Step 2" title="What are we building?">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                Project type
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon
                  const selected = form.type === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update('type', t.value)}
                      className={`text-left p-3 rounded-[3px] border transition-colors ${
                        selected
                          ? 'bg-[#0F4C4C] text-white border-[#0F766E]'
                          : 'bg-white text-[#0F4C4C] border-[#D5E0DE] hover:border-[#0F4C4C]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[13px] font-semibold">{t.label}</span>
                      </div>
                      <p className={`text-[11.5px] leading-snug ${selected ? 'text-[#CFFAFA]' : 'text-[#5F6E6D]'}`}>
                        {t.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
            <Field
              label="Project name"
              value={form.name}
              onChange={(v) => update('name', v)}
              required
              error={errors.name}
              hint="e.g. Lakeside Patient Intake Portal"
            />
            <TextArea
              label="One-paragraph description"
              value={form.description}
              rows={3}
              onChange={(v) => update('description', v)}
            />
          </div>
        </AdminCard>
      )}

      {step === 3 && (
        <AdminCard eyebrow="Step 3" title="Commercial structure">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Billing model"
              value={form.billing}
              onChange={(v) => update('billing', v as Form['billing'])}
              options={[
                { value: 'fixed', label: 'Fixed-price' },
                { value: 't-and-m', label: 'Time & materials' },
                { value: 'hybrid', label: 'Hybrid (discovery fixed, build T&M)' },
              ]}
            />
            <NumberField
              label="Contract value ($)"
              value={form.contractValue}
              onChange={(v) => update('contractValue', v)}
              required
              error={errors.contractValue}
            />
          </div>
        </AdminCard>
      )}

      {step === 4 && (
        <AdminCard eyebrow="Step 4" title="Team & dates">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Engineering lead"
                value={form.lead}
                onChange={(v) => update('lead', v)}
              />
              <NumberField
                label="Initial team size"
                value={form.teamSize}
                onChange={(v) => update('teamSize', v)}
              />
              <Field
                label="Start date"
                value={form.startDate}
                onChange={(v) => update('startDate', v)}
                hint="YYYY-MM-DD"
              />
              <Field
                label="Target go-live"
                value={form.targetGoLive}
                onChange={(v) => update('targetGoLive', v)}
                hint="YYYY-MM-DD"
                required
                error={errors.targetGoLive}
              />
            </div>
            <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 cursor-pointer">
              <input
                type="checkbox"
                checked={form.startWithDiscovery}
                onChange={(e) => update('startWithDiscovery', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0F766E]"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#0F4C4C]">
                  Start with a 2-week discovery sprint
                </p>
                <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                  Recommended for new clients or scope &gt; 8 weeks.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notifyClient}
                onChange={(e) => update('notifyClient', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0F766E]"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#0F4C4C]">
                  Notify client primary contact
                </p>
                <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                  Sends kickoff email and opens client portal access.
                </p>
              </div>
            </label>
          </div>
        </AdminCard>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => router.push('/admin/bespoke')}
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
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Code2 className="w-3.5 h-3.5" />}
              Create project
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

function TextArea({
  label,
  value,
  rows = 3,
  onChange,
}: {
  label: string
  value: string
  rows?: number
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  )
}
