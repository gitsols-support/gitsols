'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  Loader2,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Send,
  Star,
  Users as UsersIcon,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToast } from '@/components/admin/Toast'
import { formatCurrency, formatRelative } from '@/server/admin-stubs'
import { updateBespokeProject } from '@/server/admin-actions'
import type {
  BespokeProject,
  ProjectStage,
  Milestone as CrmMilestone,
  MilestoneStatus as CrmMilestoneStatus,
} from '@gitsols/types'

const STAGES: { id: ProjectStage; label: string; desc: string }[] = [
  { id: 'discovery', label: 'Discovery', desc: '2-week sprint to scope, architect, and price' },
  { id: 'design', label: 'Design', desc: 'UX, system design, technical decisions' },
  { id: 'build', label: 'Build', desc: 'Engineering sprints with demo at each end' },
  { id: 'uat', label: 'UAT', desc: 'Client acceptance testing and bug fix' },
  { id: 'launch', label: 'Launch', desc: 'Production cutover and go-live' },
  { id: 'hypercare', label: 'Hypercare', desc: '30/60/90-day post-launch white glove' },
  { id: 'closed', label: 'Closed', desc: 'Engagement complete, handed to managed retainer' },
]

type MilestoneStatus = 'planned' | 'in-progress' | 'awaiting-approval' | 'approved' | 'blocked'

interface Milestone {
  id: string
  title: string
  description: string
  stage: ProjectStage
  status: MilestoneStatus
  dueDate: string
  approvedAt?: string
  rating?: number
  comment?: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  capacity: number
}

interface Sprint {
  id: string
  number: number
  startDate: string
  endDate: string
  summary: string
}

type ActivityKind = 'stage' | 'milestone' | 'team' | 'note' | 'demo' | 'feedback'
interface Activity {
  id: string
  ts: string
  kind: ActivityKind
  actor: string
  text: string
}

// Map the live CRM milestone status enum onto the client UI enum.
function toLocalStatus(s: CrmMilestoneStatus): MilestoneStatus {
  switch (s) {
    case 'pending':
      return 'planned'
    case 'in-progress':
      return 'in-progress'
    case 'awaiting-approval':
      return 'awaiting-approval'
    case 'approved':
      return 'approved'
    case 'blocked':
      return 'blocked'
    default:
      return 'planned'
  }
}

// The live Milestone has no `stage`; attach the project's current stage so the
// stage-scoped milestone view still renders the records.
function seedMilestones(source: CrmMilestone[], stage: ProjectStage): Milestone[] {
  return [...source]
    .sort((a, b) => a.order - b.order)
    .map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description ?? '',
      stage,
      status: toLocalStatus(m.status),
      dueDate: m.dueDate ?? '—',
    }))
}

export default function BespokeDetailClient({ initial }: { initial: BespokeProject }) {
  const router = useRouter()
  const { push } = useToast()

  const [project, setProject] = useState<BespokeProject>(initial)

  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    seedMilestones(initial.milestones ?? [], initial.stage),
  )

  const [team, setTeam] = useState<TeamMember[]>([
    { id: 'tm-1', name: 'Sohail Akram', role: 'Engineering lead', capacity: 60 },
    { id: 'tm-2', name: 'Aoife Quinn', role: 'Senior engineer', capacity: 100 },
    { id: 'tm-3', name: 'Caleb Hwang', role: 'Engineer', capacity: 100 },
    { id: 'tm-4', name: 'Mira Devereaux', role: 'PM', capacity: 40 },
  ])

  const [sprints, setSprints] = useState<Sprint[]>(() =>
    initial.stage !== 'discovery'
      ? [
          { id: 's-1', number: 1, startDate: '2026-03-01', endDate: '2026-03-14', summary: 'Sprint 1 — scaffolding, auth, base entities.' },
          { id: 's-2', number: 2, startDate: '2026-03-15', endDate: '2026-03-28', summary: 'Sprint 2 — patient list, intake form skeleton.' },
        ]
      : [],
  )

  const [activity, setActivity] = useState<Activity[]>(() => [
    {
      id: 'a-seed-1',
      ts: initial.startedAt ?? initial.createdAt,
      kind: 'stage',
      actor: 'System',
      text: `Project created · stage set to ${initial.stage}.`,
    },
  ])

  const [milestoneDraft, setMilestoneDraft] = useState<{ title: string; description: string; dueDate: string; stage: ProjectStage } | null>(null)
  const [sprintDraft, setSprintDraft] = useState<string>('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberDraft, setMemberDraft] = useState({ name: '', role: '', capacity: 100 })
  const [confirm, setConfirm] = useState<'close' | 'advance-stage' | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  function logActivity(kind: ActivityKind, text: string) {
    setActivity((prev) => [
      { id: Math.random().toString(36).slice(2), ts: new Date().toISOString(), kind, actor: 'Sohail Akram', text },
      ...prev,
    ])
    setDirty(true)
  }

  async function advanceStage() {
    const idx = STAGES.findIndex((s) => s.id === project.stage)
    const next = STAGES[idx + 1]
    const current = STAGES[idx]
    if (!next) return
    setProject((p) => ({ ...p, stage: next.id }))
    const res = await updateBespokeProject(project.id, { stage: next.id })
    if (res.ok) {
      setProject(res.data)
      logActivity('stage', `Stage advanced: ${current?.label ?? '—'} → ${next.label}.`)
      push('success', `Stage → ${next.label}`, next.desc)
    } else {
      setProject((p) => ({ ...p, stage: project.stage }))
      push('error', 'Update failed', res.error)
    }
    setConfirm(null)
  }

  function setMilestoneStatus(mid: string, status: MilestoneStatus) {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === mid
          ? { ...m, status, approvedAt: status === 'approved' ? new Date().toISOString() : m.approvedAt }
          : m,
      ),
    )
    const m = milestones.find((x) => x.id === mid)
    if (m) {
      logActivity('milestone', `${m.title} → ${status}.`)
      // Optimistic local roll-up of the done count (no milestone action available).
      const doneNext = milestones.filter((x) => (x.id === mid ? status === 'approved' : x.status === 'approved')).length
      setProject((p) => ({ ...p, milestonesDone: doneNext }))
      push('success', 'Milestone updated', `${m.title} is now ${status}.`)
    }
  }

  function rateMilestone(mid: string, rating: number) {
    setMilestones((prev) => prev.map((m) => (m.id === mid ? { ...m, rating } : m)))
    logActivity('feedback', `Rated ${rating}/5 on milestone.`)
  }

  function addMilestone() {
    if (!milestoneDraft || !milestoneDraft.title.trim()) {
      push('error', 'Need a title', 'Give the milestone a name first.')
      return
    }
    const m: Milestone = {
      id: `m-${Date.now()}`,
      title: milestoneDraft.title,
      description: milestoneDraft.description,
      stage: milestoneDraft.stage,
      status: 'planned',
      dueDate: milestoneDraft.dueDate,
    }
    setMilestones([...milestones, m])
    setProject((p) => ({ ...p, milestonesTotal: p.milestonesTotal + 1 }))
    setMilestoneDraft(null)
    logActivity('milestone', `Milestone added: ${m.title}.`)
    push('success', 'Milestone added', m.title)
  }

  function removeMilestone(mid: string) {
    const m = milestones.find((x) => x.id === mid)
    setMilestones((prev) => prev.filter((x) => x.id !== mid))
    setProject((p) => ({ ...p, milestonesTotal: Math.max(0, p.milestonesTotal - 1) }))
    if (m) logActivity('milestone', `Milestone removed: ${m.title}.`)
  }

  function addTeamMember() {
    if (!memberDraft.name.trim()) return
    setTeam([...team, { id: `tm-${Date.now()}`, ...memberDraft }])
    logActivity('team', `Added ${memberDraft.name} (${memberDraft.role}).`)
    push('success', 'Team updated', `${memberDraft.name} joined the project.`)
    setMemberDraft({ name: '', role: '', capacity: 100 })
    setShowAddMember(false)
  }

  function removeTeamMember(id: string) {
    const m = team.find((x) => x.id === id)
    setTeam((t) => t.filter((x) => x.id !== id))
    if (m) logActivity('team', `Removed ${m.name} from team.`)
  }

  function logSprint() {
    if (!sprintDraft.trim()) return
    const num = sprints.length + 1
    const today = new Date().toISOString().slice(0, 10)
    setSprints([
      ...sprints,
      {
        id: `s-${Date.now()}`,
        number: num,
        startDate: today,
        endDate: today,
        summary: sprintDraft,
      },
    ])
    logActivity('demo', `Sprint ${num} logged.`)
    push('success', `Sprint ${num} logged`, '')
    setSprintDraft('')
  }

  async function save() {
    setSaving(true)
    const res = await updateBespokeProject(project.id, {
      name: project.name,
      stage: project.stage,
      health: project.health,
      billing: project.billing,
      type: project.type,
      contractValue: project.contractValue,
      burned: project.burned,
      startedAt: project.startedAt,
      targetGoLive: project.targetGoLive,
      lead: project.lead,
      team: project.team,
    })
    setSaving(false)
    if (res.ok) {
      setProject(res.data)
      setDirty(false)
      push('success', 'Saved', `${res.data.name} updated.`)
    } else {
      push('error', 'Save failed', res.error)
    }
  }

  const stageIndex = STAGES.findIndex((s) => s.id === project.stage)
  const stagedMilestones = milestones.filter((m) => m.stage === project.stage)
  const pct = project.milestonesTotal > 0 ? Math.round((project.milestonesDone / project.milestonesTotal) * 100) : 0
  const burnPct = project.contractValue > 0 ? Math.round((project.burned / project.contractValue) * 100) : 0

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow={`Bespoke · ${project.id}`}
        title={project.name}
        description={`${project.accountName ?? '—'} · ${project.type.replace('-', ' ')} · ${project.billing}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Bespoke', href: '/admin/bespoke' },
          { label: project.id },
        ]}
        badge={
          project.health === 'red'
            ? { label: 'Red · attention', tone: 'warn' }
            : project.health === 'amber'
              ? { label: 'Amber · watch', tone: 'warn' }
              : { label: 'Green · on track', tone: 'live' }
        }
        stats={[
          { label: 'Stage', value: STAGES[stageIndex]?.label ?? '—' },
          { label: 'Milestones', value: `${project.milestonesDone}/${project.milestonesTotal}`, hint: `${pct}%` },
          { label: 'Burned', value: formatCurrency(project.burned, { compact: true }), hint: `${burnPct}%` },
          { label: 'Contract', value: formatCurrency(project.contractValue, { compact: true }) },
        ]}
      />

      {/* Action bar */}
      <div className="sticky top-0 z-20 -mx-6 -mt-1 px-6 py-3 bg-[#F4F8F7]/95 backdrop-blur border-b border-[#D5E0DE]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] ${dirty ? 'text-[#7A5A1F]' : 'text-[#0F766E]'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dirty ? 'bg-[#C5933A]' : 'bg-[#0F766E]'}`} />
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <div className="flex items-center gap-2">
            {project.stage !== 'closed' && stageIndex < STAGES.length - 1 && (
              <button
                type="button"
                onClick={() => setConfirm('advance-stage')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-3 py-2 rounded-[3px] transition-colors border border-[#0F4C4C]"
              >
                Advance to {STAGES[stageIndex + 1]?.label}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {project.stage !== 'closed' && (
              <button
                type="button"
                onClick={() => setConfirm('close')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors"
              >
                Close project
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

      {/* Stage tracker */}
      <AdminCard eyebrow="Lifecycle" title="Engagement stage">
        <ol className="grid grid-cols-7 gap-0 relative">
          <span className="absolute top-4 left-4 right-4 h-px bg-[#D5E0DE]" aria-hidden />
          <span
            className="absolute top-4 left-4 h-px bg-[#0F766E] transition-all"
            style={{ width: `calc((100% - 2rem) * ${stageIndex / (STAGES.length - 1)})` }}
            aria-hidden
          />
          {STAGES.map((s, i) => {
            const done = i < stageIndex
            const active = i === stageIndex
            return (
              <li key={s.id} className="relative flex flex-col items-center text-center">
                <span
                  className={`relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full font-serif text-[12px] ${
                    done
                      ? 'bg-[#0F766E] text-white'
                      : active
                        ? 'bg-[#0F4C4C] text-white border-2 border-[#0F766E]'
                        : 'bg-white text-[#5F6E6D] border border-[#D5E0DE]'
                  }`}
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </span>
                <p
                  className={`mt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] ${active || done ? 'text-[#0F4C4C]' : 'text-[#5F6E6D]'}`}
                >
                  {s.label}
                </p>
              </li>
            )
          })}
        </ol>
        <p
          className="mt-6 font-serif italic text-[15px] text-[#5F6E6D] tracking-[-0.005em] text-center"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {STAGES[stageIndex]?.desc}
        </p>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main column */}
        <div className="lg:col-span-8 space-y-5">
          <AdminCard
            eyebrow="Stage milestones"
            title={`${STAGES[stageIndex]?.label ?? 'Stage'} milestones (${stagedMilestones.length})`}
            description="Approve, mark blocked, or update status. Approvals roll up to the project burn rate."
            action={
              <button
                type="button"
                onClick={() =>
                  setMilestoneDraft({
                    title: '',
                    description: '',
                    dueDate: new Date().toISOString().slice(0, 10),
                    stage: project.stage,
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
              <div className="mb-3 p-4 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 space-y-2">
                <input
                  placeholder="Milestone title"
                  value={milestoneDraft.title}
                  onChange={(e) => setMilestoneDraft({ ...milestoneDraft, title: e.target.value })}
                  className="input"
                />
                <textarea
                  rows={2}
                  placeholder="What ships when this is approved"
                  value={milestoneDraft.description}
                  onChange={(e) => setMilestoneDraft({ ...milestoneDraft, description: e.target.value })}
                  className="input text-[13px]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={milestoneDraft.dueDate}
                    onChange={(e) => setMilestoneDraft({ ...milestoneDraft, dueDate: e.target.value })}
                    className="input"
                  />
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-3 py-2 rounded-[3px] border border-[#082F2F]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setMilestoneDraft(null)}
                    className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {stagedMilestones.length === 0 ? (
              <p className="text-[13px] text-[#5F6E6D] text-center py-6">
                No milestones for this stage yet. Add one to get started.
              </p>
            ) : (
              <ul className="space-y-2">
                {stagedMilestones.map((m) => (
                  <MilestoneRow
                    key={m.id}
                    m={m}
                    onStatusChange={(s) => setMilestoneStatus(m.id, s)}
                    onRate={(r) => rateMilestone(m.id, r)}
                    onRemove={() => removeMilestone(m.id)}
                  />
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard
            eyebrow="Sprints"
            title="Sprint demos & logs"
            description="Two-week cadence with a demo at the end of each sprint."
          >
            <div className="space-y-3">
              <div className="bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] p-3 space-y-2">
                <textarea
                  rows={2}
                  value={sprintDraft}
                  onChange={(e) => setSprintDraft(e.target.value)}
                  placeholder="Log a sprint summary — what shipped, demo notes, blockers…"
                  className="input text-[13px]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={logSprint}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-3 py-2 rounded-[3px] border border-[#082F2F]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Log sprint
                  </button>
                </div>
              </div>
              <ul className="space-y-2">
                {sprints.length === 0 && (
                  <li className="text-[12.5px] text-[#5F6E6D]">No sprints logged yet.</li>
                )}
                {[...sprints].reverse().map((s) => (
                  <li
                    key={s.id}
                    className="bg-white border border-[#D5E0DE] rounded-[3px] p-3 flex items-start gap-3"
                  >
                    <span
                      className="font-serif text-[18px] text-[#0F4C4C] leading-none tracking-[-0.005em] mt-1"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      S{String(s.number).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#0F4C4C] leading-relaxed">{s.summary}</p>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-1">
                        {s.startDate}{s.endDate !== s.startDate ? ` → ${s.endDate}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
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
                          : a.kind === 'feedback'
                            ? 'bg-[#FAEFD4] text-[#7A5A1F]'
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
          <AdminCard eyebrow="Burn" title="Contract progress">
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                    Burned
                  </span>
                  <span className="font-mono text-[11px] text-[#0F766E]">{burnPct}%</span>
                </div>
                <div className="h-2 bg-[#F4F8F7] border border-[#D5E0DE] rounded-[2px] overflow-hidden">
                  <div className="h-full bg-[#0F766E]" style={{ width: `${burnPct}%` }} />
                </div>
                <div className="flex items-baseline justify-between mt-1.5 font-mono text-[10.5px] text-[#5F6E6D]">
                  <span>{formatCurrency(project.burned, { compact: true })}</span>
                  <span>{formatCurrency(project.contractValue, { compact: true })}</span>
                </div>
              </div>
              <hr className="rule-hair" />
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                    Milestones
                  </span>
                  <span className="font-mono text-[11px] text-[#0F766E]">{pct}%</span>
                </div>
                <div className="h-2 bg-[#F4F8F7] border border-[#D5E0DE] rounded-[2px] overflow-hidden">
                  <div className="h-full bg-[#0F4C4C]" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 font-mono text-[10.5px] text-[#5F6E6D]">
                  {project.milestonesDone} of {project.milestonesTotal} approved
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminCard
            eyebrow="Team"
            title={`Assigned (${team.length})`}
            action={
              <button
                type="button"
                onClick={() => setShowAddMember((v) => !v)}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            }
          >
            {showAddMember && (
              <div className="mb-3 p-3 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 space-y-2">
                <input
                  placeholder="Name"
                  value={memberDraft.name}
                  onChange={(e) => setMemberDraft({ ...memberDraft, name: e.target.value })}
                  className="input"
                />
                <input
                  placeholder="Role"
                  value={memberDraft.role}
                  onChange={(e) => setMemberDraft({ ...memberDraft, role: e.target.value })}
                  className="input"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={memberDraft.capacity}
                    onChange={(e) => setMemberDraft({ ...memberDraft, capacity: Number(e.target.value) })}
                    className="input"
                    placeholder="Capacity %"
                  />
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="inline-flex items-center text-[12px] font-semibold text-white bg-[#0F4C4C] px-3 py-2 rounded-[3px] border border-[#082F2F]"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            <ul className="space-y-1.5">
              {team.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60"
                >
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-[3px] bg-white border border-[#D5E0DE] font-serif text-[12px] text-[#0F4C4C]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {m.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#0F4C4C] truncate">{m.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5F6E6D]">
                      {m.role} · {m.capacity}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(m.id)}
                    className="text-[#5F6E6D] hover:text-[#B53A2B]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard eyebrow="Account" title="Linked client">
            <div className="flex items-center gap-3 mb-3">
              <UsersIcon className="w-3.5 h-3.5 text-[#0F766E]" />
              <p
                className="font-serif text-[16px] text-[#0F4C4C]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {project.accountName ?? '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/admin/accounts/${project.accountId}` as never)}
              disabled={!project.accountId}
              className="w-full inline-flex items-center justify-between gap-2 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-2.5 rounded-[3px] transition-colors disabled:opacity-50"
            >
              Open account record
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </AdminCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm === 'advance-stage'}
        title={`Advance to ${STAGES[stageIndex + 1]?.label}?`}
        body={
          <>
            All open milestones in <span className="font-semibold">{STAGES[stageIndex]?.label}</span>{' '}
            stay attached. The client portal flips to the new stage view.
          </>
        }
        confirmLabel={`Advance to ${STAGES[stageIndex + 1]?.label}`}
        onConfirm={advanceStage}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'close'}
        title="Close this project?"
        body="The project moves to the Closed state and rolls into the managed retainer (if applicable). Outstanding milestones become read-only."
        confirmLabel="Close project"
        destructive
        onConfirm={async () => {
          setConfirm(null)
          setProject((p) => ({ ...p, stage: 'closed' }))
          const res = await updateBespokeProject(project.id, { stage: 'closed' })
          if (res.ok) {
            setProject(res.data)
            logActivity('stage', 'Project closed.')
            push('info', 'Project closed', res.data.name)
            router.push('/admin/bespoke')
          } else {
            setProject((p) => ({ ...p, stage: project.stage }))
            push('error', 'Update failed', res.error)
          }
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function MilestoneRow({
  m,
  onStatusChange,
  onRate,
  onRemove,
}: {
  m: Milestone
  onStatusChange: (s: MilestoneStatus) => void
  onRate: (r: number) => void
  onRemove: () => void
}) {
  const icon: Record<MilestoneStatus, React.ElementType> = {
    planned: Circle,
    'in-progress': Clock,
    'awaiting-approval': AlertCircle,
    approved: CheckCircle2,
    blocked: AlertCircle,
  }
  const tone: Record<MilestoneStatus, string> = {
    planned: 'text-[#5F6E6D] bg-[#F4F8F7] border-[#D5E0DE]',
    'in-progress': 'text-[#0F4C4C] bg-[#ECFEFE] border-[#CFFAFA]',
    'awaiting-approval': 'text-[#7A5A1F] bg-[#FAEFD4] border-[#E8D4A0]',
    approved: 'text-white bg-[#0F4C4C] border-[#0F766E]',
    blocked: 'text-[#B53A2B] bg-[#FBE6E1] border-[#F5C9C0]',
  }
  const Icon = icon[m.status]

  return (
    <li className="bg-white border border-[#D5E0DE] rounded-[3px] p-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p
            className="font-serif text-[16px] text-[#0F4C4C] tracking-[-0.005em]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {m.title}
          </p>
          <p className="text-[12.5px] text-[#5F6E6D] mt-0.5 leading-snug">{m.description}</p>
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-[3px] border ${tone[m.status]}`}
          >
            <Icon className="w-3 h-3" />
            {m.status}
          </span>
          <span className="font-mono text-[10.5px] text-[#5F6E6D]">Due {m.dueDate}</span>
        </div>
        <div className="flex items-center gap-1">
          {(['planned', 'in-progress', 'awaiting-approval', 'approved', 'blocked'] as MilestoneStatus[]).map(
            (s) => (
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
            ),
          )}
        </div>
      </div>
      {m.status === 'approved' && (
        <div className="mt-3 pt-3 border-t border-[#E5EDEB] flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
            Client rating
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRate(r)}
                className={`text-[#5F6E6D] hover:text-[#C5933A]`}
                aria-label={`Rate ${r}/5`}
              >
                <Star className={`w-4 h-4 ${m.rating && r <= m.rating ? 'fill-[#C5933A] text-[#C5933A]' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  )
}
