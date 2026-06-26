'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ExternalLink,
  Plus,
  GripVertical,
  Trash2,
  Save,
  Loader2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  SERVICE_CATEGORY_LABELS,
  getServiceBySlug,
  type ServiceCategory,
} from '@gitsols/constants'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { getServiceIcon } from '@/components/marketing/service-icons'

interface Props {
  params: Promise<{ slug: string }>
}

interface Capability {
  id: string
  title: string
  body: string
}

interface DraftService {
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
  published: boolean
  acceptingNewClients: boolean
}

const CATEGORIES: ServiceCategory[] = ['managed', 'security', 'cloud', 'communications', 'build']

export default function AdminServiceDetailPage({ params }: Props) {
  const { slug } = use(params)
  const router = useRouter()
  const { push } = useToast()
  const seed = getServiceBySlug(slug)

  const [draft, setDraft] = useState<DraftService | null>(
    seed
      ? {
          name: seed.name,
          shortName: seed.shortName ?? seed.name,
          category: seed.category,
          tagline: seed.tagline,
          summary: seed.summary,
          intro: seed.intro,
          capabilities: seed.capabilities.map((c, i) => ({
            id: `cap-${i}`,
            title: c.title,
            body: c.body,
          })),
          whoItsFor: [...seed.whoItsFor],
          metaTitle: seed.metaTitle,
          metaDescription: seed.metaDescription,
          billing: 'MRR',
          priceAnchor: '$120/seat/mo',
          published: true,
          acceptingNewClients: true,
        }
      : null,
  )
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<'unpublish' | 'delete' | null>(null)

  if (!seed || !draft) {
    return (
      <div className="max-w-3xl">
        <AdminPageHeader
          eyebrow="Not found"
          title="Service not found"
          breadcrumbs={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Services', href: '/admin/services' },
            { label: slug },
          ]}
        />
      </div>
    )
  }

  const Icon = getServiceIcon(slug)

  function update<K extends keyof DraftService>(key: K, value: DraftService[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d))
    setDirty(true)
  }

  function setCap(id: string, key: 'title' | 'body', value: string) {
    update(
      'capabilities',
      draft!.capabilities.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
    )
  }

  function moveCap(id: string, dir: -1 | 1) {
    const idx = draft!.capabilities.findIndex((c) => c.id === id)
    const next = idx + dir
    if (next < 0 || next >= draft!.capabilities.length) return
    const arr = [...draft!.capabilities]
    const tmp = arr[idx]!
    arr[idx] = arr[next]!
    arr[next] = tmp
    update('capabilities', arr)
  }

  function addCap() {
    update('capabilities', [
      ...draft!.capabilities,
      { id: `cap-${Date.now()}`, title: 'New capability', body: 'Describe what this covers.' },
    ])
  }

  function removeCap(id: string) {
    update(
      'capabilities',
      draft!.capabilities.filter((c) => c.id !== id),
    )
  }

  function setBuyer(idx: number, value: string) {
    const arr = [...draft!.whoItsFor]
    arr[idx] = value
    update('whoItsFor', arr)
  }

  function addBuyer() {
    update('whoItsFor', [...draft!.whoItsFor, 'New buyer profile'])
  }

  function removeBuyer(idx: number) {
    update(
      'whoItsFor',
      draft!.whoItsFor.filter((_, i) => i !== idx),
    )
  }

  function save() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setDirty(false)
      push('success', 'Saved', `${draft!.name} updated.`)
    }, 600)
  }

  function togglePublish() {
    if (!draft) return
    if (draft.published) {
      setConfirm('unpublish')
    } else {
      update('published', true)
      push('success', 'Published', `${draft.name} is now live.`)
    }
  }

  function unpublishConfirmed() {
    if (!draft) return
    setConfirm(null)
    update('published', false)
    push('info', 'Unpublished', `${draft.name} removed from the public catalog.`)
  }

  function toggleEnable() {
    if (!draft) return
    const wasAccepting = draft.acceptingNewClients
    update('acceptingNewClients', !wasAccepting)
    push(
      wasAccepting ? 'info' : 'success',
      wasAccepting ? 'Disabled' : 'Enabled',
      wasAccepting
        ? 'No new clients can be added against this line.'
        : 'New clients can be added against this line.',
    )
  }

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Service line"
        title={
          <span className="inline-flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE]">
              <Icon className="w-5 h-5 text-[#0F4C4C]" />
            </span>
            {draft.name}
          </span>
        }
        description={draft.tagline}
        badge={
          draft.published
            ? { label: 'Live · published', tone: 'live' }
            : { label: 'Draft · hidden', tone: 'muted' }
        }
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Service catalog', href: '/admin/services' },
          { label: draft.shortName },
        ]}
      />

      {/* Sticky action bar */}
      <div className="sticky top-0 z-20 -mx-6 -mt-1 px-6 py-3 bg-[#F4F8F7]/95 backdrop-blur border-b border-[#D5E0DE]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] ${dirty ? 'text-[#7A5A1F]' : 'text-[#0F766E]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dirty ? 'bg-[#C5933A]' : 'bg-[#0F766E]'}`} />
              {dirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <Link
              href={`/services/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F4C4C] hover:text-[#082F2F]"
            >
              View public page <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleEnable}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors"
            >
              {draft.acceptingNewClients ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Accepting clients
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Closed to new clients
                </>
              )}
            </button>
            <button
              type="button"
              onClick={togglePublish}
              className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-[3px] transition-colors border ${
                draft.published
                  ? 'bg-white text-[#0F4C4C] border-[#D5E0DE] hover:border-[#0F4C4C]/40'
                  : 'bg-[#0F766E] text-white border-[#0F4C4C] hover:bg-[#0F4C4C]'
              }`}
            >
              {draft.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-4 py-2 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save changes
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main editor */}
        <div className="lg:col-span-8 space-y-5">
          <AdminCard eyebrow="Copy" title="Headline & narrative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Service name" value={draft.name} onChange={(v) => update('name', v)} />
              <Field
                label="Short name (for nav)"
                value={draft.shortName}
                onChange={(v) => update('shortName', v)}
              />
              <SelectField
                label="Category"
                value={draft.category}
                onChange={(v) => update('category', v as ServiceCategory)}
                options={CATEGORIES.map((c) => ({ value: c, label: SERVICE_CATEGORY_LABELS[c] }))}
              />
              <Field
                label="Tagline (one line)"
                value={draft.tagline}
                onChange={(v) => update('tagline', v)}
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Summary (2–3 sentences for cards)"
                  value={draft.summary}
                  rows={3}
                  onChange={(v) => update('summary', v)}
                />
              </div>
              <div className="md:col-span-2">
                <TextArea
                  label="Intro (long form for detail page)"
                  value={draft.intro}
                  rows={5}
                  onChange={(v) => update('intro', v)}
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            eyebrow="Deliverables"
            title={`Capabilities (${draft.capabilities.length})`}
            description="Each capability shows up as a numbered article on the public page and a default milestone entry."
            action={
              <button
                type="button"
                onClick={addCap}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            }
          >
            <ol className="space-y-3">
              {draft.capabilities.map((c, i) => (
                <li
                  key={c.id}
                  className="relative bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] p-4 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
                  <div className="grid grid-cols-[24px_1fr_auto] gap-3 items-start">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <GripVertical className="w-3.5 h-3.5 text-[#5F6E6D]/60" />
                      <span
                        className="font-serif text-[14px] text-[#0F4C4C]"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <input
                        value={c.title}
                        onChange={(e) => setCap(c.id, 'title', e.target.value)}
                        className="input"
                        placeholder="Capability title"
                      />
                      <textarea
                        value={c.body}
                        onChange={(e) => setCap(c.id, 'body', e.target.value)}
                        rows={2}
                        className="input text-[13px]"
                        placeholder="What this delivers"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveCap(c.id, -1)}
                        disabled={i === 0}
                        className="w-7 h-7 rounded-[3px] text-[#5F6E6D] hover:bg-white hover:text-[#0F4C4C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCap(c.id, 1)}
                        disabled={i === draft.capabilities.length - 1}
                        className="w-7 h-7 rounded-[3px] text-[#5F6E6D] hover:bg-white hover:text-[#0F4C4C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        aria-label="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCap(c.id)}
                        className="w-7 h-7 rounded-[3px] text-[#5F6E6D] hover:bg-[#FBE6E1] hover:text-[#B53A2B] flex items-center justify-center transition-colors"
                        aria-label="Remove capability"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </AdminCard>

          <AdminCard
            eyebrow="Audience"
            title={`Buyer profiles (${draft.whoItsFor.length})`}
            action={
              <button
                type="button"
                onClick={addBuyer}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            }
          >
            <ul className="space-y-2">
              {draft.whoItsFor.map((p, i) => (
                <li key={i} className="grid grid-cols-[36px_1fr_auto] gap-3 items-start">
                  <span
                    className="font-serif text-[18px] text-[#0F4C4C] leading-none tracking-[-0.015em] mt-2"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <textarea
                    value={p}
                    onChange={(e) => setBuyer(i, e.target.value)}
                    rows={2}
                    className="input text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => removeBuyer(i)}
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
                value={draft.metaTitle}
                onChange={(v) => update('metaTitle', v)}
              />
              <TextArea
                label="Meta description"
                value={draft.metaDescription}
                rows={2}
                onChange={(v) => update('metaDescription', v)}
              />
            </div>
          </AdminCard>
        </div>

        {/* Right rail */}
        <aside className="lg:col-span-4 space-y-5">
          <AdminCard eyebrow="Commercial" title="Pricing">
            <div className="space-y-4">
              <SelectField
                label="Billing model"
                value={draft.billing}
                onChange={(v) => update('billing', v as DraftService['billing'])}
                options={[
                  { value: 'MRR', label: 'MRR (recurring)' },
                  { value: 'Fixed', label: 'Fixed-price project' },
                  { value: 'T&M', label: 'Time & materials' },
                  { value: 'Hybrid', label: 'Hybrid' },
                ]}
              />
              <Field
                label="Price anchor"
                value={draft.priceAnchor}
                onChange={(v) => update('priceAnchor', v)}
              />
            </div>
          </AdminCard>

          <AdminCard eyebrow="State" title="Availability">
            <div className="space-y-3">
              <Toggle
                label="Published"
                value={draft.published}
                onChange={(v) => update('published', v)}
                hint={
                  draft.published
                    ? 'Visible on /services and the marketing site.'
                    : 'Hidden from public — internal only.'
                }
              />
              <Toggle
                label="Accepting new clients"
                value={draft.acceptingNewClients}
                onChange={(v) => update('acceptingNewClients', v)}
                hint={
                  draft.acceptingNewClients
                    ? 'New engagements can be created on this line.'
                    : 'Existing engagements unaffected; new ones blocked.'
                }
              />
            </div>
          </AdminCard>

          <AdminCard eyebrow="Danger zone" title="Permanent">
            <p className="text-[12.5px] text-[#5F6E6D] leading-relaxed mb-3">
              Deletes the service permanently. Existing engagements stay in the system but lose the
              link to this catalog entry.
            </p>
            <button
              type="button"
              onClick={() => setConfirm('delete')}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#B53A2B] border border-[#F5C9C0] bg-[#FBE6E1]/40 hover:bg-[#FBE6E1] px-3 py-2 rounded-[3px] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete service line
            </button>
          </AdminCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm === 'unpublish'}
        title="Unpublish this service?"
        body="The page will disappear from the public site immediately. The internal record stays editable."
        confirmLabel="Unpublish"
        destructive
        onConfirm={unpublishConfirmed}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title={`Delete ${draft.name}?`}
        body="This cannot be undone. Active engagements will lose their catalog reference."
        confirmLabel="Delete permanently"
        destructive
        onConfirm={() => {
          setConfirm(null)
          push('error', 'Deleted', `${draft.name} was removed.`)
          router.push('/admin/services')
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="input"
      />
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

function Toggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  hint?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60">
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-[#0F4C4C]">{label}</p>
        {hint && <p className="text-[11.5px] text-[#5F6E6D] mt-0.5 leading-snug">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${value ? 'bg-[#0F766E]' : 'bg-[#D5E0DE]'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}
        />
      </button>
    </div>
  )
}

// Note: generateStaticParams removed because this is now a client page.
// In Phase 2 we'll split static metadata into a parent route segment.
