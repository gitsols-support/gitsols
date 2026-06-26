'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Calendar,
  Archive,
  Building2,
  User as UserIcon,
  Star,
  Flag,
  Loader2,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { formatRelative } from '@/server/admin-stubs'
import { updateLead, convertLead } from '@/server/admin-actions'
import type { AdminLead, AdminLeadStatus } from '@gitsols/types'

type ActivityKind = 'note' | 'call' | 'email' | 'status' | 'owner' | 'score' | 'meeting' | 'system'

interface Activity {
  id: string
  ts: string
  kind: ActivityKind
  actor: string
  text: string
}

const STATUS_FLOW: { value: AdminLeadStatus; label: string; tone: string; icon: React.ElementType }[] = [
  { value: 'new', label: 'New', tone: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]', icon: Flag },
  { value: 'qualifying', label: 'Qualifying', tone: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]', icon: Loader2 },
  { value: 'qualified', label: 'Qualified', tone: 'bg-[#0F4C4C] text-white border-[#0F766E]', icon: CheckCircle2 },
  { value: 'disqualified', label: 'Disqualified', tone: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]', icon: XCircle },
  { value: 'converted', label: 'Converted', tone: 'bg-[#CFFAFA] text-[#0F4C4C] border-[#0F766E]', icon: Star },
]

const OWNERS = ['Sohail Akram', 'Mira Devereaux', 'Jonas Pell', 'Aoife Quinn']

export default function LeadDetailClient({ initial }: { initial: AdminLead }) {
  const router = useRouter()
  const { push } = useToast()

  // Local state — seeded from the live record; mutations flow through server actions.
  const [lead, setLead] = useState<AdminLead>(initial)
  const [activity, setActivity] = useState<Activity[]>(() => [
    {
      id: 'a-seed-1',
      ts: initial.receivedAt,
      kind: 'system',
      actor: 'System',
      text: `Lead received via ${initial.source.replace(/_/g, ' ')}.`,
    },
  ])
  const [noteDraft, setNoteDraft] = useState('')
  const [composer, setComposer] = useState<'note' | 'call' | 'email' | 'meeting'>('note')
  const [confirm, setConfirm] = useState<
    | { kind: 'archive' }
    | { kind: 'convert' }
    | { kind: 'disqualify' }
    | null
  >(null)

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
  }

  async function changeStatus(next: AdminLeadStatus) {
    if (lead.status === next) return
    const from = STATUS_FLOW.find((s) => s.value === lead.status)?.label ?? lead.status
    const to = STATUS_FLOW.find((s) => s.value === next)?.label ?? next
    // Optimistic UI; the action result is the source of truth.
    setLead((l) => ({ ...l, status: next }))
    const res = await updateLead(lead.id, { status: next })
    if (res.ok) {
      setLead(res.data)
      logActivity('status', `Status changed: ${from} → ${to}.`)
      push('success', `Status → ${to}`, `${lead.name} marked ${to.toLowerCase()}.`)
    } else {
      // Revert optimistic change on failure.
      setLead((l) => ({ ...l, status: lead.status }))
      push('error', 'Update failed', res.error)
    }
  }

  async function changeOwner(name: string) {
    if (lead.owner === name) return
    const next = name || undefined
    setLead((l) => ({ ...l, owner: next }))
    const res = await updateLead(lead.id, { owner: name })
    if (res.ok) {
      setLead(res.data)
      logActivity('owner', name ? `Assigned to ${name}.` : 'Owner cleared.')
      push('info', 'Owner updated', name ? `${name} now owns this lead.` : 'Unassigned.')
    } else {
      setLead((l) => ({ ...l, owner: lead.owner }))
      push('error', 'Update failed', res.error)
    }
  }

  async function adjustScore(delta: number) {
    const next = Math.max(0, Math.min(100, lead.score + delta))
    setLead((l) => ({ ...l, score: next }))
    const res = await updateLead(lead.id, { score: next })
    if (res.ok) {
      setLead(res.data)
      logActivity('score', `Score adjusted to ${next}.`)
    } else {
      setLead((l) => ({ ...l, score: lead.score }))
      push('error', 'Update failed', res.error)
    }
  }

  function submitNote() {
    const text = noteDraft.trim()
    if (!text) {
      push('error', 'Empty note', 'Add some text before saving.')
      return
    }
    logActivity(composer, text)
    setNoteDraft('')
    const label =
      composer === 'note' ? 'Note added'
      : composer === 'call' ? 'Call logged'
      : composer === 'meeting' ? 'Meeting logged'
      : 'Email logged'
    push('success', label, '')
  }

  function archive() {
    setConfirm(null)
    logActivity('system', 'Lead archived.')
    push('info', 'Archived', `${lead.name} moved to archive.`)
    router.push('/admin/leads')
  }

  async function convertToAccount() {
    setConfirm(null)
    const res = await convertLead(lead.id)
    if (res.ok) {
      setLead((l) => ({ ...l, status: 'converted' }))
      logActivity('status', 'Converted to Account — passed to onboarding.')
      push('success', 'Converted to account', `${lead.company ?? lead.name} is now in onboarding.`)
      router.push(`/admin/pipeline/${res.data.opportunityId}` as never)
    } else {
      push('error', 'Convert failed', res.error)
    }
  }

  const isClosed = lead.status === 'converted' || lead.status === 'disqualified'

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow={`Lead · ${lead.id}`}
        title={lead.name}
        description={`${lead.company ?? '—'} · ${(lead.industry ?? 'other').replace('-', ' ')}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Leads', href: '/admin/leads' },
          { label: lead.id },
        ]}
        badge={
          lead.status === 'converted'
            ? { label: 'Converted', tone: 'live' }
            : lead.status === 'disqualified'
              ? { label: 'Disqualified', tone: 'muted' }
              : { label: lead.status, tone: 'warn' }
        }
        stats={[
          { label: 'Score', value: lead.score, hint: '/100' },
          { label: 'Status', value: lead.status },
          { label: 'Owner', value: lead.owner ? lead.owner.split(' ')[0]! : '—' },
          { label: 'Age', value: formatRelative(lead.receivedAt) },
        ]}
      />

      {/* Workflow toolbar */}
      <AdminCard eyebrow="Triage" title="Workflow actions">
        <div className="space-y-4">
          {/* Status pipeline */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
              Move through pipeline
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => {
                const Icon = s.icon
                const active = s.value === lead.status
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      if (s.value === 'disqualified') setConfirm({ kind: 'disqualify' })
                      else if (s.value === 'converted') setConfirm({ kind: 'convert' })
                      else void changeStatus(s.value)
                    }}
                    disabled={active}
                    className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] px-3 py-1.5 rounded-[3px] border transition-colors ${s.tone} ${
                      active ? 'opacity-60 cursor-default' : 'hover:opacity-90 cursor-pointer'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${s.value === 'qualifying' && active ? 'animate-spin' : ''}`} />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          <hr className="rule-hair" />

          {/* Owner + score + actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                Owner
              </p>
              <select
                value={lead.owner ?? ''}
                onChange={(e) => void changeOwner(e.target.value)}
                className="input"
              >
                <option value="">Unassigned</option>
                {OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                Score adjustment
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void adjustScore(-5)}
                  className="inline-flex items-center text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors"
                >
                  −5
                </button>
                <div className="flex-1 h-9 bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] flex items-center justify-center">
                  <span
                    className="font-serif text-[18px] text-[#0F4C4C] tracking-[-0.005em]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {lead.score}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void adjustScore(5)}
                  className="inline-flex items-center text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors"
                >
                  +5
                </button>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                Quick actions
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors flex-1 justify-center"
                  onClick={() => logActivity('email', `Composed email to ${lead.email}.`)}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px] transition-colors flex-1 justify-center"
                    onClick={() => logActivity('call', `Dialed ${lead.phone}.`)}
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main column */}
        <div className="lg:col-span-8 space-y-5">
          <AdminCard eyebrow="Inquiry" title="Original message">
            <div className="space-y-3">
              <p className="text-[14.5px] text-[#062524]/85 leading-relaxed">
                {lead.message ?? 'No message provided with the inquiry.'}
              </p>
              <hr className="rule-hair" />
              <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-[#5F6E6D]">
                <span>
                  Received <span className="text-[#0F4C4C]">{formatRelative(lead.receivedAt)}</span>
                </span>
                <span>
                  Source <span className="text-[#0F4C4C]">{lead.source.replace(/_/g, ' ')}</span>
                </span>
                {lead.serviceInterest && (
                  <span>
                    Interest <span className="text-[#0F4C4C]">{lead.serviceInterest}</span>
                  </span>
                )}
              </div>
            </div>
          </AdminCard>

          {/* Composer */}
          <AdminCard eyebrow="Log activity" title="Add note or interaction">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { v: 'note', label: 'Note', icon: MessageSquare },
                    { v: 'call', label: 'Call', icon: Phone },
                    { v: 'email', label: 'Email', icon: Mail },
                    { v: 'meeting', label: 'Meeting', icon: Calendar },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon
                  const active = composer === opt.v
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setComposer(opt.v)}
                      className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-[3px] border transition-colors ${
                        active
                          ? 'bg-[#0F4C4C] text-white border-[#0F4C4C]'
                          : 'bg-white text-[#0F4C4C] border-[#D5E0DE] hover:border-[#0F4C4C]/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <textarea
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder={
                  composer === 'note'
                    ? 'Add a note about this lead…'
                    : composer === 'call'
                      ? 'Summary of the call…'
                      : composer === 'email'
                        ? 'What you emailed (or paste the email)…'
                        : 'Meeting outcome and next steps…'
                }
                className="input"
              />
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                  Ctrl+Enter to save
                </p>
                <button
                  type="button"
                  onClick={submitNote}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-4 py-2 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save activity
                </button>
              </div>
            </div>
          </AdminCard>

          {/* Activity feed */}
          <AdminCard eyebrow="Chronicle" title={`Activity (${activity.length})`} flush>
            <ol>
              {activity.map((a, i, arr) => (
                <li
                  key={a.id}
                  className={`flex items-start gap-4 px-6 py-4 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <ActivityDot kind={a.kind} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] text-[#062524]/85 leading-snug">
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

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-5">
          <AdminCard eyebrow="Contact" title="Reach out">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <UserIcon className="w-3.5 h-3.5 text-[#0F766E] mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">Name</p>
                  <p
                    className="font-serif text-[16px] text-[#0F4C4C]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {lead.name}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Building2 className="w-3.5 h-3.5 text-[#0F766E] mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">Firm</p>
                  <p
                    className="font-serif text-[16px] text-[#0F4C4C]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {lead.company ?? '—'}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-3.5 h-3.5 text-[#0F766E] mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">Email</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="font-mono text-[12.5px] text-[#0F4C4C] hover:text-[#082F2F] break-all"
                  >
                    {lead.email}
                  </a>
                </div>
              </li>
              {lead.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-3.5 h-3.5 text-[#0F766E] mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">Phone</p>
                    <a
                      href={`tel:${lead.phone}`}
                      className="font-mono text-[12.5px] text-[#0F4C4C] hover:text-[#082F2F]"
                    >
                      {lead.phone}
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </AdminCard>

          {/* Convert / archive */}
          <AdminCard
            eyebrow={isClosed ? 'Closed' : 'Next step'}
            title={isClosed ? 'Lead closed' : 'Move forward'}
          >
            <div className="space-y-3">
              {!isClosed && lead.status === 'qualified' && (
                <button
                  type="button"
                  onClick={() => setConfirm({ kind: 'convert' })}
                  className="w-full group inline-flex items-center justify-between gap-2 bg-[#0F766E] hover:bg-[#0F4C4C] text-white text-[13px] font-semibold px-4 py-3 rounded-[3px] transition-colors border border-[#0F4C4C] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                >
                  <span>Convert to account</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              )}
              {!isClosed && lead.status !== 'qualified' && (
                <p className="text-[12.5px] text-[#5F6E6D] leading-relaxed">
                  Move the lead to <span className="font-semibold text-[#0F4C4C]">Qualified</span>{' '}
                  before converting to an account.
                </p>
              )}
              <button
                type="button"
                onClick={() => setConfirm({ kind: 'archive' })}
                className="w-full inline-flex items-center justify-between gap-2 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-3 rounded-[3px] transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5" />
                  Archive lead
                </span>
              </button>
            </div>
          </AdminCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm?.kind === 'archive'}
        title="Archive this lead?"
        body={
          <>
            The lead will be removed from the active queue. You can restore it later from{' '}
            <span className="font-semibold">Leads → Archive</span>.
          </>
        }
        confirmLabel="Archive"
        destructive
        onConfirm={archive}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'convert'}
        title="Convert lead to account?"
        body={
          <>
            This will create an Account record for{' '}
            <span className="font-semibold">{lead.company ?? lead.name}</span> and open an onboarding engagement.
            A copy of the original inquiry stays linked to the account.
          </>
        }
        confirmLabel="Convert"
        onConfirm={() => void convertToAccount()}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'disqualify'}
        title="Mark as disqualified?"
        body="The lead stays in the system for reporting, but won't appear in the active queue."
        confirmLabel="Disqualify"
        destructive
        onConfirm={() => {
          setConfirm(null)
          void changeStatus('disqualified')
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function ActivityDot({ kind }: { kind: ActivityKind }) {
  const map: Record<ActivityKind, { icon: React.ElementType; tone: string }> = {
    note: { icon: MessageSquare, tone: 'bg-[#F4F8F7] text-[#0F4C4C]' },
    call: { icon: Phone, tone: 'bg-[#ECFEFE] text-[#0F4C4C]' },
    email: { icon: Mail, tone: 'bg-[#CFFAFA] text-[#0F4C4C]' },
    status: { icon: Flag, tone: 'bg-[#FAEFD4] text-[#7A5A1F]' },
    owner: { icon: UserIcon, tone: 'bg-[#F4F8F7] text-[#5F6E6D]' },
    score: { icon: Star, tone: 'bg-[#FAEFD4] text-[#7A5A1F]' },
    meeting: { icon: Calendar, tone: 'bg-[#CFFAFA] text-[#0F4C4C]' },
    system: { icon: CheckCircle2, tone: 'bg-[#0F4C4C] text-white' },
  }
  const cfg = map[kind]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-[3px] flex-shrink-0 ${cfg.tone}`}>
      <Icon className="w-3.5 h-3.5" />
    </span>
  )
}
