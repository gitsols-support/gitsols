'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Loader2, ArrowUpRight } from 'lucide-react'
import { SERVICE_CATEGORY_LABELS, type ServiceCategory } from '@gitsols/constants'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'

const CATEGORIES: ServiceCategory[] = ['managed', 'security', 'cloud', 'communications', 'build']

interface Capability {
  id: string
  title: string
  body: string
}

interface Form {
  slug: string
  name: string
  shortName: string
  category: ServiceCategory
  tagline: string
  summary: string
  intro: string
  capabilities: Capability[]
  whoItsFor: string[]
  metaTitle: string
  metaDescription: string
  billing: 'MRR' | 'Fixed' | 'T&M' | 'Hybrid'
  priceAnchor: string
  saveAsDraft: boolean
}

const empty: Form = {
  slug: '',
  name: '',
  shortName: '',
  category: 'managed',
  tagline: '',
  summary: '',
  intro: '',
  capabilities: [
    { id: 'c1', title: '', body: '' },
    { id: 'c2', title: '', body: '' },
  ],
  whoItsFor: ['', ''],
  metaTitle: '',
  metaDescription: '',
  billing: 'MRR',
  priceAnchor: '',
  saveAsDraft: true,
}

export default function NewServicePage() {
  const router = useRouter()
  const { push } = useToast()
  const [form, setForm] = useState<Form>(empty)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value }
      // auto-slug if user is typing name and hasn't customized slug
      if (key === 'name' && (f.slug === '' || f.slug === slugify(f.name))) {
        next.slug = slugify(value as string)
      }
      // mirror shortName from name if empty
      if (key === 'name' && f.shortName === '') {
        next.shortName = value as string
      }
      return next
    })
    if (errors[key as string]) {
      setErrors((e) => {
        const x = { ...e }
        delete x[key as string]
        return x
      })
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.slug.trim()) e.slug = 'Required'
    if (!form.tagline.trim()) e.tagline = 'Required'
    if (!form.summary.trim()) e.summary = 'Required'
    if (form.capabilities.some((c) => !c.title.trim())) e.capabilities = 'Each capability needs a title'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!validate()) {
      push('error', 'Check the form', 'A few required fields need attention.')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      push(
        'success',
        form.saveAsDraft ? 'Draft saved' : 'Service published',
        `${form.name} ${form.saveAsDraft ? 'queued for review' : 'is live on the public catalog'}.`,
      )
      router.push('/admin/services')
    }, 700)
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      <AdminPageHeader
        eyebrow="Library · New record"
        title="Create service line"
        description="Add a new offering to the GITSOLS catalog. The slug and copy flow straight to the public marketing site."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Services', href: '/admin/services' },
          { label: 'New' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <AdminCard eyebrow="Identity" title="What is this service?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Service name"
                value={form.name}
                onChange={(v) => update('name', v)}
                required
                error={errors.name}
              />
              <SelectField
                label="Category"
                value={form.category}
                onChange={(v) => update('category', v as ServiceCategory)}
                options={CATEGORIES.map((c) => ({ value: c, label: SERVICE_CATEGORY_LABELS[c] }))}
              />
              <Field
                label="Slug (URL)"
                value={form.slug}
                onChange={(v) => update('slug', v)}
                required
                error={errors.slug}
                hint={form.slug ? `/services/${form.slug}` : 'Auto-generated from name'}
              />
              <Field
                label="Short name (for nav)"
                value={form.shortName}
                onChange={(v) => update('shortName', v)}
              />
              <div className="md:col-span-2">
                <Field
                  label="Tagline"
                  value={form.tagline}
                  onChange={(v) => update('tagline', v)}
                  required
                  error={errors.tagline}
                />
              </div>
              <div className="md:col-span-2">
                <TextArea
                  label="Summary (2–3 sentences)"
                  value={form.summary}
                  rows={3}
                  onChange={(v) => update('summary', v)}
                  required
                  error={errors.summary}
                />
              </div>
              <div className="md:col-span-2">
                <TextArea
                  label="Intro (long form)"
                  value={form.intro}
                  rows={5}
                  onChange={(v) => update('intro', v)}
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            eyebrow="Deliverables"
            title="Capabilities"
            description="Each becomes a numbered article on the public page and a default milestone."
            action={
              <button
                type="button"
                onClick={() =>
                  update('capabilities', [
                    ...form.capabilities,
                    { id: `c-${Date.now()}`, title: '', body: '' },
                  ])
                }
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add capability
              </button>
            }
          >
            <ol className="space-y-3">
              {form.capabilities.map((c, i) => (
                <li
                  key={c.id}
                  className="relative bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] p-4 grid grid-cols-[28px_1fr_auto] gap-3 items-start overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
                  <span
                    className="font-serif text-[18px] text-[#0F4C4C] mt-1 tracking-[-0.005em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="space-y-2">
                    <input
                      placeholder="Capability title"
                      value={c.title}
                      onChange={(e) =>
                        update(
                          'capabilities',
                          form.capabilities.map((x) =>
                            x.id === c.id ? { ...x, title: e.target.value } : x,
                          ),
                        )
                      }
                      className="input"
                    />
                    <textarea
                      rows={2}
                      placeholder="What this delivers"
                      value={c.body}
                      onChange={(e) =>
                        update(
                          'capabilities',
                          form.capabilities.map((x) =>
                            x.id === c.id ? { ...x, body: e.target.value } : x,
                          ),
                        )
                      }
                      className="input text-[13px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        'capabilities',
                        form.capabilities.filter((x) => x.id !== c.id),
                      )
                    }
                    className="w-8 h-8 mt-1 rounded-[3px] text-[#5F6E6D] hover:bg-[#FBE6E1] hover:text-[#B53A2B] flex items-center justify-center transition-colors"
                    aria-label="Remove capability"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ol>
            {errors.capabilities && (
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#B53A2B]">
                {errors.capabilities}
              </p>
            )}
          </AdminCard>

          <AdminCard
            eyebrow="Audience"
            title="Buyer profiles"
            action={
              <button
                type="button"
                onClick={() => update('whoItsFor', [...form.whoItsFor, ''])}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add profile
              </button>
            }
          >
            <ul className="space-y-2">
              {form.whoItsFor.map((p, i) => (
                <li key={i} className="grid grid-cols-[36px_1fr_auto] gap-3 items-start">
                  <span
                    className="font-serif text-[18px] text-[#0F4C4C] mt-2 leading-none"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <textarea
                    rows={2}
                    value={p}
                    onChange={(e) => {
                      const next = [...form.whoItsFor]
                      next[i] = e.target.value
                      update('whoItsFor', next)
                    }}
                    placeholder="e.g. Multi-location medical practices with 50–200 employees…"
                    className="input text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        'whoItsFor',
                        form.whoItsFor.filter((_, idx) => idx !== i),
                      )
                    }
                    className="w-8 h-8 mt-1 rounded-[3px] text-[#5F6E6D] hover:bg-[#FBE6E1] hover:text-[#B53A2B] flex items-center justify-center transition-colors"
                    aria-label="Remove buyer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard eyebrow="SEO" title="Search engine snippet">
            <div className="space-y-4">
              <Field
                label="Meta title"
                value={form.metaTitle}
                onChange={(v) => update('metaTitle', v)}
              />
              <TextArea
                label="Meta description"
                value={form.metaDescription}
                rows={2}
                onChange={(v) => update('metaDescription', v)}
              />
            </div>
          </AdminCard>
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <AdminCard eyebrow="Commercial" title="Pricing">
            <div className="space-y-4">
              <SelectField
                label="Billing model"
                value={form.billing}
                onChange={(v) => update('billing', v as Form['billing'])}
                options={[
                  { value: 'MRR', label: 'MRR (recurring)' },
                  { value: 'Fixed', label: 'Fixed-price project' },
                  { value: 'T&M', label: 'Time & materials' },
                  { value: 'Hybrid', label: 'Hybrid' },
                ]}
              />
              <Field
                label="Price anchor"
                value={form.priceAnchor}
                onChange={(v) => update('priceAnchor', v)}
                hint="e.g. $120/seat/mo · Fixed $18k base"
              />
            </div>
          </AdminCard>

          <AdminCard eyebrow="State" title="Visibility">
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 cursor-pointer">
                <input
                  type="radio"
                  checked={form.saveAsDraft}
                  onChange={() => update('saveAsDraft', true)}
                  className="mt-0.5 w-4 h-4 accent-[#0F766E]"
                />
                <div>
                  <p className="text-[13px] font-semibold text-[#0F4C4C]">Save as draft</p>
                  <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                    Hidden from public, editable internally.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 cursor-pointer">
                <input
                  type="radio"
                  checked={!form.saveAsDraft}
                  onChange={() => update('saveAsDraft', false)}
                  className="mt-0.5 w-4 h-4 accent-[#0F766E]"
                />
                <div>
                  <p className="text-[13px] font-semibold text-[#0F4C4C]">Publish immediately</p>
                  <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">
                    Goes live on /services and the marketing site.
                  </p>
                </div>
              </label>
            </div>
          </AdminCard>

          <AdminCard eyebrow="Save" title="Finish">
            <div className="space-y-2">
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="w-full group inline-flex items-center justify-between gap-2 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[13px] font-semibold px-4 py-3 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {form.saveAsDraft ? 'Save draft' : 'Publish service'}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/services')}
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

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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
      {hint && !error && (
        <p className="mt-1 font-mono text-[10.5px] tracking-[0.06em] text-[#5F6E6D]">{hint}</p>
      )}
    </div>
  )
}

function TextArea({
  label,
  value,
  rows = 3,
  onChange,
  required,
  error,
}: {
  label: string
  value: string
  rows?: number
  onChange: (v: string) => void
  required?: boolean
  error?: string
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
        {required && <span className="text-[#B53A2B] ml-1">*</span>}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
