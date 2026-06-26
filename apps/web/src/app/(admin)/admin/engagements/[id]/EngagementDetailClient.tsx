'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Save,
  Loader2,
  Plus,
  Trash2,
  Send,
  Eye,
  EyeOff,
  MonitorPlay,
  Star,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToast } from '@/components/admin/Toast'
import { formatCurrency, formatRelative } from '@/server/admin-stubs'
import { updateEngagement } from '@/server/admin-actions'
import type { Engagement, Milestone as CrmMilestone, MilestoneStatus as CrmMilestoneStatus } from '@gitsols/types'

type MilestoneStatus = 'planned' | 'in-progress' | 'awaiting-client' | 'approved' | 'blocked'
type Visibility = 'private' | 'shared' | 'portal'

interface Milestone {
  id: string
  number: number
  title: string
  description: string
  status: MilestoneStatus
  visibility: Visibility
  dueDate: string
  approvedAt?: string
  approver?: string
  rating?: number
  comment?: string
  artifacts: string[]
}

type ActivityKind = 'stage' | 'milestone' | 'doc' | 'approval' | 'note'
interface Activity {
  id: string
  ts: string
  kind: ActivityKind
  actor: string
  text: string
}

// Map the live CRM milestone status enum onto the richer client UI enum.
function toLocalStatus(s: CrmMilestoneStatus): MilestoneStatus {
  switch (s) {
    case 'pending':
      return 'planned'
    case 'awaiting-approval':
      return 'awaiting-client'
    case 'in-progress':
      return 'in-progress'
    case 'approved':
      return 'approved'
    case 'blocked':
      return 'blocked'
    default:
      return 'planned'
  }
}

function seedMilestones(source: CrmMilestone[]): Milestone[] {
  return [...source]
    .sort((a, b) => a.order - b.order)
    .map((m, i) => ({
      id: m.id,
      number: m.order || i + 1,
      title: m.title,
      description: m.description ?? '',
      status: toLocalStatus(m.status),
      visibility: 'portal',
      dueDate: m.dueDate ?? '—',
      artifacts: [],
    }))
}

export default function EngagementDetailClient({ initial }: { initial: Engagement }) {
  const router = useRouter()
  const { push } = useToast()

  const [eng, setEng] = useState<Engagement>(initial)

  // Milestones seeded from the live engagement record.
  const [milestones, setMilestones] = useState<Milestone[]>(() => seedMilestones(initial.milestones ?? []))

  const [activity, setActivity] = useState<Activity[]>(() => [
    {
      id: 'a-seed-1',
      ts: initial.startedAt ?? initial.createdAt,
      kind: 'stage',
      actor: 'System',
      text: `Engagement opened · stage ${initial.stage}.`,
    },
  ])

  const [milestoneDraft, setMilestoneDraft] = useState<{
    title: string
    description: string
    dueDate: string
    visibility: Visibility
  } | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [confirm, setConfirm] = useState<'pause' | 'close' | 'request-approval' | null>(null)
  const [pendingApprovalMid, setPendingApprovalMid] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  function logActivity(kind: ActivityKind, text: string) {
    setActivity((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        ts: new Date().toISOString(),
        kind,
        actor: 'Sohail Akram',
        text,
      },
      ...prev,
    ])
    setDirty(true)
  }

  function setStatus(mid: string, status: MilestoneStatus) {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === mid
          ? {
              ...m,
              status,
              approvedAt: status === 'approved' ? new Date().toISOString() : m.approvedAt,
              approver: status === 'approved' ? 'Client primary' : m.approver,
            }
          : m,
      ),
    )
    const m = milestones.find((x) => x.id === mid)
    if (m) {
      logActivity('milestone', `${m.title} → ${status}.`)
      push('success', 'Milestone updated', `${m.title} is now ${status}.`)
    }
  }

  function setVisibility(mid: string, v: Visibility) {
    setMilestones((prev) => prev.map((m) => (m.id === mid ? { ...m, visibility: v } : m)))
    setDirty(true)
  }

  function rateMilestone(mid: string, r: number, comment?: string) {
    setMilestones((prev) => prev.map((m) => (m.id === mid ? { ...m, rating: r, comment: comment ?? m.comment } : m)))
    logActivity('approval', `Client feedback received: ${r}/5.`)
  }

  function addArtifact(mid: string) {
    const name = prompt('Artifact name (e.g. "Site audit report.pdf")')
    if (!name) return
    setMilestones((prev) =>
      prev.map((m) => (m.id === mid ? { ...m, artifacts: [...m.artifacts, name] } : m)),
    )
    logActivity('doc', `Artifact added: ${name}.`)
    push('success', 'Artifact attached', name)
  }

  function removeArtifact(mid: string, name: string) {
    setMilestones((prev) =>
      prev.map((m) => (m.id === mid ? { ...m, artifacts: m.artifacts.filter((a) => a !== name) } : m)),
    )
  }

  function addMilestone() {
    if (!milestoneDraft || !milestoneDraft.title.trim()) {
      push('error', 'Need a title', 'Give the milestone a name.')
      return
    }
    const next = milestones.length + 1
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}`,
        number: next,
        title: milestoneDraft.title,
        description: milestoneDraft.description,
        status: 'planned',
        visibility: milestoneDraft.visibility,
        dueDate: milestoneDraft.dueDate,
        artifacts: [],
      },
    ])
    setMilestoneDraft(null)
    logActivity('milestone', `Added milestone "${milestoneDraft.title}".`)
    push('success', 'Milestone added', milestoneDraft.title)
  }

  function removeMilestone(mid: string) {
    const m = milestones.find((x) => x.id === mid)
    setMilestones((prev) => prev.filter((x) => x.id !== mid))
    if (m) logActivity('milestone', `Removed milestone "${m.title}".`)
  }

  function requestApproval() {
    if (!pendingApprovalMid) return
    const m = milestones.find((x) => x.id === pendingApprovalMid)
    if (!m) return
    setStatus(pendingApprovalMid, 'awaiting-client')
    logActivity('approval', `Approval requested from client on "${m.title}".`)
    push('success', 'Approval requested', `Email sent. Client portal updated.`)
    setPendingApprovalMid(null)
    setConfirm(null)
  }

  function addNote() {
    if (!noteDraft.trim()) return
    logActivity('note', noteDraft.trim())
    setNoteDraft('')
    push('success', 'Note added', '')
  }

  async function save() {
    setSaving(true)
    const res = await updateEngagement(eng.id, {
      name: eng.name,
      status: eng.status,
      stage: eng.stage,
      health: eng.health,
      type: eng.type,
      mrrOrValue: eng.mrrOrValue,
      startedAt: eng.startedAt,
      nextMilestone: eng.nextMilestone,
      nextMilestoneDue: eng.nextMilestoneDue,
      serviceSlug: eng.serviceSlug,
    })
    setSaving(false)
    if (res.ok) {
      setEng(res.data)
      setDirty(false)
      push('success', 'Saved', `${res.data.name} updated.`)
    } else {
      push('error', 'Save failed', res.error)
    }
  }

  async function pause() {
    setEng((e) => ({ ...e, status: 'paused' }))
    const res = await updateEngagement(eng.id, { status: 'paused' })
    if (res.ok) {
      setEng(res.data)
      logActivity('stage', 'Engagement paused.')
      push('info', 'Paused', `${res.data.name} on hold.`)
    } else {
      setEng((e) => ({ ...e, status: eng.status }))
      push('error', 'Update failed', res.error)
    }
    setConfirm(null)
  }

  async function close() {
    setEng((e) => ({ ...e, status: 'closed' }))
    const res = await updateEngagement(eng.id, { status: 'closed' })
    if (res.ok) {
      setEng(res.data)
      logActivity('stage', 'Engagement closed.')
      push('info', 'Closed', `${res.data.name} archived.`)
      setConfirm(null)
      router.push('/admin/engagements')
    } else {
      setEng((e) => ({ ...e, status: eng.status }))
      push('error', 'Update failed', res.error)
      setConfirm(null)
    }
  }

  const approved = milestones.filter((m) => m.status === 'approved').length
  const total = milestones.length
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow={`Engagement · ${eng.id}`}
        title={eng.name}
        description={`${eng.accountName} · ${eng.type} · ${eng.stage}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Engagements', href: '/admin/engagements' },
          { label: eng.id },
        ]}
        badge={
          eng.status === 'paused'
            ? { label: 'Paused', tone: 'warn' }
            : eng.status === 'closed'
              ? { label: 'Closed', tone: 'muted' }
              : { label: eng.status, tone: 'live' }
        }
        stats={[
          { label: 'Stage', value: eng.stage },
          { label: 'Milestones', value: `${approved}/${total}`, hint: `${pct}%` },
          { label: 'Value', value: formatCurrency(eng.mrrOrValue, { compact: true }), hint: eng.type === 'managed' ? '/mo' : 'total' },
          { label: 'Health', value: eng.health },
        ]}
      />

      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 -mx-6 -mt-1 px-6 py-3 bg-[#F4F8F7]/95 backdrop-blur border-b border-[#D5E0DE]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] ${dirty ? 'text-[#7A5A1F]' : 'text-[#0F766E]'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dirty ? 'bg-[#C5933A]' : 'bg-[#0F766E]'}`} />
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <div className="flex items-center gap-2">
            {eng.status === 'active' && (
              <button
                type="button"
                onClick={() => setConfirm('pause')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors"
              >
                Pause
              </button>
            )}
            {eng.status !== 'closed' && (
              <button
                type="button"
                onClick={() => setConfirm('close')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#B53A2B] border border-[#F5C9C0] bg-[#FBE6E1]/30 hover:bg-[#FBE6E1] px-3 py-2 rounded-[3px] transition-colors"
              >
                Close engagement
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-4 py-2 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <AdminCard eyebrow="Lifecycle" title="9-stage progress">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#F4F8F7] border border-[#D5E0DE] rounded-[2px] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0F766E] to-[#0F4C4C]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span
              className="font-serif text-[20px] text-[#0F4C4C] tracking-[-0.005em]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {pct}%
            </span>
          </div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
            {approved} of {total} milestones approved · next: {eng.nextMilestone ?? '—'} · due {eng.nextMilestoneDue ?? '—'}
          </p>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Milestones column */}
        <div className="lg:col-span-8 space-y-5">
          <AdminCard
            eyebrow="Milestones"
            title="All stages"
            description="Approve, request client sign-off, attach deliverables, set client portal visibility."
            action={
              <button
                type="button"
                onClick={() =>
                  setMilestoneDraft({
                    title: '',
                    description: '',
                    dueDate: new Date().toISOString().slice(0, 10),
                    visibility: 'portal',
                  })
                }
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add milestone
              </button>
            }
          >
            {milestoneDraft && (
              <div className="mb-4 p-4 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 space-y-2">
                <input
                  placeholder="Milestone title"
                  value={milestoneDraft.title}
                  onChange={(e) => setMilestoneDraft({ ...milestoneDraft, title: e.target.value })}
                  className="input"
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={milestoneDraft.description}
                  onChange={(e) => setMilestoneDraft({ ...milestoneDraft, description: e.target.value })}
                  className="input text-[13px]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={milestoneDraft.dueDate}
                    onChange={(e) => setMilestoneDraft({ ...milestoneDraft, dueDate: e.target.value })}
                    className="input"
                  />
                  <select
                    value={milestoneDraft.visibility}
                    onChange={(e) =>
                      setMilestoneDraft({ ...milestoneDraft, visibility: e.target.value as Visibility })
                    }
                    className="input"
                  >
                    <option value="private">Internal only</option>
                    <option value="shared">Shared by email</option>
                    <option value="portal">Live in client portal</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMilestoneDraft(null)}
                    className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="inline-flex items-center text-[12px] font-semibold text-white bg-[#0F4C4C] px-3 py-2 rounded-[3px] border border-[#082F2F]"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {milestones.length === 0 ? (
              <p className="text-[13px] text-[#5F6E6D] text-center py-6">
                No milestones yet. Add one to begin tracking delivery.
              </p>
            ) : (
              <ol className="space-y-3">
                {milestones.map((m) => (
                  <MilestoneCard
                    key={m.id}
                    m={m}
                    onStatusChange={(s) => setStatus(m.id, s)}
                    onVisibilityChange={(v) => setVisibility(m.id, v)}
                    onRequestApproval={() => {
                      setPendingApprovalMid(m.id)
                      setConfirm('request-approval')
                    }}
                    onRate={(r) => rateMilestone(m.id, r)}
                    onAddArtifact={() => addArtifact(m.id)}
                    onRemoveArtifact={(name) => removeArtifact(m.id, name)}
                    onRemove={() => removeMilestone(m.id)}
                  />
                ))}
              </ol>
            )}
          </AdminCard>

          <AdminCard eyebrow="Notes" title="Internal log">
            <div className="space-y-3">
              <textarea
                rows={2}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Add an internal note — not visible to client."
                className="input text-[13px]"
              />
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={addNote}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-3 py-2 rounded-[3px] border border-[#082F2F]"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save note
                </button>
              </div>
            </div>
          </AdminCard>

          <AdminCard eyebrow="Chronicle" title={`Activity (${activity.length})`} flush>
            <ol>
              {activity.map((a, i, arr) => (
                <li
                  key={a.id}
                  className={`flex items-start gap-4 px-6 py-4 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-[3px] flex-shrink-0 ${
                      a.kind === 'stage'
                        ? 'bg-[#0F4C4C] text-white'
                        : a.kind === 'milestone'
                          ? 'bg-[#ECFEFE] text-[#0F4C4C]'
                          : a.kind === 'approval'
                            ? 'bg-[#0F766E] text-white'
                            : a.kind === 'doc'
                              ? 'bg-[#CFFAFA] text-[#0F4C4C]'
                              : 'bg-[#F4F8F7] text-[#0F4C4C]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] text-[#062524]/85">
                      <span className="font-semibold text-[#0F4C4C]">{a.actor}</span> · {a.text}
                    </p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-1">
                      {formatRelative(a.ts)} · {a.kind}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </AdminCard>
        </div>

        {/* Right column */}
        <aside className="lg:col-span-4 space-y-5">
          <AdminCard eyebrow="Account" title="Linked client">
            <p
              className="font-serif text-[16px] text-[#0F4C4C] mb-3"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {eng.accountName}
            </p>
            <button
              type="button"
              onClick={() => router.push(`/admin/accounts/${eng.accountId}` as never)}
              className="w-full inline-flex items-center justify-between gap-2 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-2.5 rounded-[3px] transition-colors"
            >
              Open account
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </AdminCard>

          <AdminCard eyebrow="Approvals" title="Awaiting client">
            <ul className="space-y-2">
              {milestones.filter((m) => m.status === 'awaiting-client').length === 0 ? (
                <li className="text-[12.5px] text-[#5F6E6D]">Nothing waiting on client right now.</li>
              ) : (
                milestones
                  .filter((m) => m.status === 'awaiting-client')
                  .map((m) => (
                    <li
                      key={m.id}
                      className="px-3 py-2.5 rounded-[3px] border border-[#FAEFD4] bg-[#FAEFD4]/30"
                    >
                      <p className="text-[13px] text-[#0F4C4C]">{m.title}</p>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#7A5A1F] mt-0.5">
                        Due {m.dueDate}
                      </p>
                    </li>
                  ))
              )}
            </ul>
          </AdminCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm === 'request-approval'}
        title="Request client approval?"
        body="Sends an email and updates the client portal with a one-click approval CTA. Tracked in the audit log."
        confirmLabel="Send request"
        onConfirm={requestApproval}
        onCancel={() => {
          setConfirm(null)
          setPendingApprovalMid(null)
        }}
      />
      <ConfirmDialog
        open={confirm === 'pause'}
        title={`Pause ${eng.name}?`}
        body="The engagement freezes — no further billing on milestones, no client-facing motion. You can resume anytime."
        confirmLabel="Pause"
        onConfirm={pause}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'close'}
        title={`Close ${eng.name}?`}
        body="The engagement is archived. Outstanding milestones become read-only. Billing stops at end of cycle."
        confirmLabel="Close engagement"
        destructive
        onConfirm={close}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function MilestoneCard({
  m,
  onStatusChange,
  onVisibilityChange,
  onRequestApproval,
  onRate,
  onAddArtifact,
  onRemoveArtifact,
  onRemove,
}: {
  m: Milestone
  onStatusChange: (s: MilestoneStatus) => void
  onVisibilityChange: (v: Visibility) => void
  onRequestApproval: () => void
  onRate: (r: number) => void
  onAddArtifact: () => void
  onRemoveArtifact: (name: string) => void
  onRemove: () => void
}) {
  const statusIcon: Record<MilestoneStatus, React.ElementType> = {
    planned: Clock,
    'in-progress': Clock,
    'awaiting-client': AlertCircle,
    approved: CheckCircle2,
    blocked: AlertCircle,
  }
  const statusTone: Record<MilestoneStatus, string> = {
    planned: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
    'in-progress': 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
    'awaiting-client': 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
    approved: 'bg-[#0F4C4C] text-white border-[#0F766E]',
    blocked: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  }
  const visIcon: Record<Visibility, React.ElementType> = {
    private: EyeOff,
    shared: Eye,
    portal: MonitorPlay,
  }
  const Icon = statusIcon[m.status]
  const VisIcon = visIcon[m.visibility]

  return (
    <li className="bg-white border border-[#D5E0DE] rounded-[3px] p-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
      <div className="grid grid-cols-[40px_1fr_auto] gap-4 items-start mb-3">
        <span
          className="font-serif text-[26px] text-[#0F4C4C] leading-none tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {String(m.number).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p
            className="font-serif text-[17px] text-[#0F4C4C] tracking-[-0.005em]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {m.title}
          </p>
          <p className="text-[12.5px] text-[#5F6E6D] mt-1 leading-snug">{m.description}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 rounded-[3px] text-[#5F6E6D] hover:bg-[#FBE6E1] hover:text-[#B53A2B] flex items-center justify-center"
          aria-label="Remove milestone"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span
          className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${statusTone[m.status]}`}
        >
          <Icon className="w-3 h-3" />
          {m.status}
        </span>
        <span className="font-mono text-[10.5px] text-[#5F6E6D]">Due {m.dueDate}</span>
        <select
          value={m.visibility}
          onChange={(e) => onVisibilityChange(e.target.value as Visibility)}
          className="font-mono text-[10px] uppercase tracking-[0.14em] bg-white border border-[#D5E0DE] px-2 py-1 rounded-[3px] text-[#0F4C4C]"
        >
          <option value="private">Internal only</option>
          <option value="shared">Shared by email</option>
          <option value="portal">Live in portal</option>
        </select>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#5F6E6D]">
          <VisIcon className="w-3 h-3" />
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {(['planned', 'in-progress', 'awaiting-client', 'approved', 'blocked'] as MilestoneStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(s)}
            disabled={m.status === s}
            className={`font-mono text-[9.5px] uppercase tracking-[0.14em] px-2 py-1 rounded-[3px] border transition-colors ${
              m.status === s
                ? 'bg-[#0F4C4C] text-white border-[#0F4C4C] cursor-default'
                : 'bg-white text-[#0F4C4C] border-[#D5E0DE] hover:border-[#0F4C4C]/40'
            }`}
          >
            {s}
          </button>
        ))}
        {(m.status === 'in-progress' || m.status === 'blocked') && (
          <button
            type="button"
            onClick={onRequestApproval}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-2.5 py-1 rounded-[3px] border border-[#0F4C4C]"
          >
            <Send className="w-3 h-3" />
            Request approval
          </button>
        )}
      </div>

      {/* Artifacts */}
      <div className="pt-3 border-t border-[#E5EDEB]">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
            Artifacts ({m.artifacts.length})
          </p>
          <button
            type="button"
            onClick={onAddArtifact}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F4C4C] hover:text-[#082F2F]"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {m.artifacts.length === 0 && (
            <span className="font-mono text-[10.5px] text-[#5F6E6D]/70">No artifacts attached</span>
          )}
          {m.artifacts.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 font-mono text-[10.5px] tracking-[0.04em] text-[#0F4C4C] bg-[#ECFEFE] border border-[#CFFAFA] px-2 py-1 rounded-[3px]"
            >
              {a}
              <button
                type="button"
                onClick={() => onRemoveArtifact(a)}
                className="hover:text-[#B53A2B]"
                aria-label={`Remove ${a}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Client feedback */}
      {m.status === 'approved' && (
        <div className="mt-3 pt-3 border-t border-[#E5EDEB] flex items-center justify-between gap-3">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D]">
            Approved by {m.approver ?? 'client'}
            {m.approvedAt && <> · {formatRelative(m.approvedAt)}</>}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRate(r)}
                aria-label={`Rate ${r}/5`}
              >
                <Star
                  className={`w-4 h-4 ${m.rating && r <= m.rating ? 'fill-[#C5933A] text-[#C5933A]' : 'text-[#5F6E6D]'}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}
