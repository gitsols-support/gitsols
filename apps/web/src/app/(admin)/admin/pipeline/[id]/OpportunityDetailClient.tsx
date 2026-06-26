'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  Plus,
  Trash2,
  Save,
  Loader2,
  FileSignature,
  ScrollText,
  Shield,
  FileText,
  Paperclip,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles,
  Star,
  AlertCircle,
  Trophy,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToast } from '@/components/admin/Toast'
import { STAGE_GATES, formatCurrency, formatRelative } from '@/server/admin-stubs'
import { updateOpportunityStage, addOpportunityNote } from '@/server/admin-actions'
import type {
  Opportunity,
  OpportunityActivity,
  OpportunityAttachment,
  OpportunityLineItem,
  OpportunityStage,
  LossReason,
} from '@gitsols/types'

const STAGES: { id: OpportunityStage; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'sow-sent', label: 'SoW sent' },
  { id: 'closed-won', label: 'Closed won' },
]

const ATTACHMENT_KINDS: { value: OpportunityAttachment['kind']; label: string; icon: React.ElementType }[] = [
  { value: 'quote', label: 'Quote', icon: ScrollText },
  { value: 'proposal', label: 'Proposal', icon: FileSignature },
  { value: 'sow', label: 'SoW', icon: FileText },
  { value: 'msa', label: 'MSA', icon: Shield },
  { value: 'other', label: 'Other', icon: Paperclip },
]

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

export default function OpportunityDetailClient({ initial }: { initial: Opportunity }) {
  const router = useRouter()
  const { push } = useToast()

  const [opp, setOpp] = useState<Opportunity>(initial)

  const [composer, setComposer] = useState<'note' | 'call' | 'email' | 'meeting'>('note')
  const [noteDraft, setNoteDraft] = useState('')
  const [attachmentDraft, setAttachmentDraft] = useState<{ kind: OpportunityAttachment['kind']; name: string } | null>(null)
  const [lineItemDraft, setLineItemDraft] = useState<Omit<OpportunityLineItem, 'id'> | null>(null)
  const [confirm, setConfirm] = useState<
    | { kind: 'advance'; to: OpportunityStage; gates: string[] }
    | { kind: 'win' }
    | { kind: 'lose' }
    | null
  >(null)
  const [lossDraft, setLossDraft] = useState<{ reason: LossReason; note: string }>({
    reason: 'price',
    note: '',
  })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  function logActivity(kind: OpportunityActivity['kind'], text: string) {
    setOpp((o) => ({
      ...o,
      activity: [
        {
          id: Math.random().toString(36).slice(2),
          ts: new Date().toISOString(),
          kind,
          actor: 'Sohail Akram',
          text,
        },
        ...o.activity,
      ],
    }))
    setDirty(true)
  }

  function checkGates(to: OpportunityStage): string[] {
    const gates = STAGE_GATES[to] ?? []
    return gates.filter((g) => !opp.attachments.some((a) => a.kind === g.kind)).map((g) => g.label)
  }

  function tryAdvance() {
    const idx = STAGES.findIndex((s) => s.id === opp.stage)
    const next = STAGES[idx + 1]
    if (!next) return
    if (next.id === 'closed-won') {
      setConfirm({ kind: 'win' })
      return
    }
    const missing = checkGates(next.id)
    if (missing.length > 0) {
      setConfirm({ kind: 'advance', to: next.id, gates: missing })
      return
    }
    void moveStage(next.id)
  }

  async function moveStage(to: OpportunityStage, force = false) {
    const was = STAGES.find((s) => s.id === opp.stage)?.label ?? opp.stage
    const now = STAGES.find((s) => s.id === to)?.label ?? to
    const probMap: Partial<Record<OpportunityStage, number>> = {
      new: 20,
      qualified: 45,
      proposal: 60,
      'sow-sent': 80,
      'closed-won': 100,
      'closed-lost': 0,
    }
    // Optimistic update; action result is the source of truth.
    setOpp((o) => ({ ...o, stage: to, probability: probMap[to] ?? o.probability }))
    const res = await updateOpportunityStage(opp.id, to)
    if (res.ok) {
      setOpp(res.data)
      logActivity('stage', `${force ? 'Force-advanced' : 'Stage advanced'}: ${was} → ${now}.`)
      push('success', `Moved to ${now}`, force ? 'Audited override.' : '')
    } else {
      setOpp((o) => ({ ...o, stage: opp.stage, probability: opp.probability }))
      push('error', 'Stage change failed', res.error)
    }
  }

  async function closeWon() {
    setConfirm(null)
    await moveStage('closed-won')
    push('success', 'Closed won', 'Account creation triggered. Engagement opening.')
  }

  async function closeLost() {
    setConfirm(null)
    setOpp((o) => ({ ...o, stage: 'closed-lost', probability: 0, lostReason: lossDraft.reason, lostNote: lossDraft.note }))
    const res = await updateOpportunityStage(opp.id, 'closed-lost')
    if (res.ok) {
      // Action persists the stage; keep the locally-captured loss reason/note.
      setOpp({ ...res.data, lostReason: lossDraft.reason, lostNote: lossDraft.note })
      logActivity('stage', `Closed lost · reason: ${lossDraft.reason}.${lossDraft.note ? ` Note: ${lossDraft.note}` : ''}`)
      push('info', 'Closed lost', 'Recorded for win-rate reporting.')
    } else {
      setOpp((o) => ({ ...o, stage: opp.stage, probability: opp.probability }))
      push('error', 'Close failed', res.error)
    }
  }

  function attachFile() {
    if (!attachmentDraft || !attachmentDraft.name.trim()) {
      push('error', 'Need a filename', 'Drop the artifact name first.')
      return
    }
    const a: OpportunityAttachment = {
      id: Math.random().toString(36).slice(2),
      kind: attachmentDraft.kind,
      name: attachmentDraft.name,
      addedAt: new Date().toISOString(),
      addedBy: 'Sohail Akram',
    }
    setOpp((o) => ({ ...o, attachments: [...o.attachments, a] }))
    logActivity('attachment', `${attachmentDraft.kind.toUpperCase()} attached: ${attachmentDraft.name}.`)
    push('success', 'Attached', attachmentDraft.name)
    setAttachmentDraft(null)
  }

  function removeAttachment(aid: string) {
    const a = opp.attachments.find((x) => x.id === aid)
    setOpp((o) => ({ ...o, attachments: o.attachments.filter((x) => x.id !== aid) }))
    if (a) logActivity('attachment', `Removed ${a.kind}: ${a.name}.`)
  }

  function addLineItem() {
    if (!lineItemDraft) return
    const li: OpportunityLineItem = { id: Math.random().toString(36).slice(2), ...lineItemDraft }
    setOpp((o) => ({ ...o, lineItems: [...o.lineItems, li] }))
    setDirty(true)
    setLineItemDraft(null)
    push('success', 'Line item added', `${li.service} × ${li.qty}`)
  }

  function removeLineItem(lid: string) {
    setOpp((o) => ({ ...o, lineItems: o.lineItems.filter((x) => x.id !== lid) }))
    setDirty(true)
  }

  async function submitNote() {
    const text = noteDraft.trim()
    if (!text) return
    setNoteDraft('')
    const res = await addOpportunityNote(opp.id, text)
    if (res.ok) {
      // Action returns the full updated Opportunity incl. activity.
      setOpp(res.data)
      push('success', `${composer === 'note' ? 'Note' : composer === 'call' ? 'Call' : composer === 'meeting' ? 'Meeting' : 'Email'} logged`, '')
    } else {
      setNoteDraft(text)
      push('error', 'Save failed', res.error)
    }
  }

  function adjustValue(delta: number) {
    const next = Math.max(0, opp.value + delta)
    setOpp((o) => ({ ...o, value: next }))
    logActivity('value', `Value adjusted to ${formatCurrency(next, { compact: true })}.`)
  }

  function updateProb(p: number) {
    setOpp((o) => ({ ...o, probability: Math.max(0, Math.min(100, p)) }))
    setDirty(true)
  }

  function save() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setDirty(false)
      push('success', 'Saved', `${opp.name} updated.`)
    }, 500)
  }

  // Totals
  const recurringMo = opp.lineItems.filter((l) => l.recurring).reduce((s, l) => s + l.qty * l.rate, 0)
  const oneTime = opp.lineItems.filter((l) => !l.recurring).reduce((s, l) => s + l.qty * l.rate, 0)
  const arr = recurringMo * 12 + oneTime
  const isClosed = opp.stage === 'closed-won' || opp.stage === 'closed-lost'
  const stageIdx = STAGES.findIndex((s) => s.id === opp.stage)
  const closeLabel = opp.expectedClose
    ? new Date(opp.expectedClose).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—'

  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow={`Opportunity · ${opp.id}`}
        title={opp.name}
        description={`${opp.prospectName} · ${(opp.industry ?? 'other').replace('-', ' ')} · ${opp.type}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Pipeline', href: '/admin/pipeline' },
          { label: opp.id },
        ]}
        badge={
          opp.stage === 'closed-won'
            ? { label: 'Closed won', tone: 'live' }
            : opp.stage === 'closed-lost'
              ? { label: 'Closed lost', tone: 'muted' }
              : { label: STAGES.find((s) => s.id === opp.stage)?.label ?? opp.stage, tone: 'warn' }
        }
        stats={[
          { label: 'Value', value: formatCurrency(opp.value, { compact: true }) },
          { label: 'Probability', value: `${opp.probability}%` },
          { label: 'Weighted', value: formatCurrency((opp.value * opp.probability) / 100, { compact: true }) },
          { label: 'Close', value: closeLabel },
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
            {!isClosed && (
              <>
                <button
                  type="button"
                  onClick={tryAdvance}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-3 py-2 rounded-[3px] border border-[#0F4C4C] transition-colors"
                >
                  Advance stage
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm({ kind: 'lose' })}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#B53A2B] border border-[#F5C9C0] bg-[#FBE6E1]/30 hover:bg-[#FBE6E1] px-3 py-2 rounded-[3px] transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Closed lost
                </button>
              </>
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

      {/* Stage progress */}
      <AdminCard eyebrow="Pipeline" title="Stage progression">
        <ol className="grid grid-cols-5 gap-0 relative">
          <span className="absolute top-4 left-4 right-4 h-px bg-[#D5E0DE]" aria-hidden />
          <span
            className="absolute top-4 left-4 h-px bg-[#0F766E] transition-all"
            style={{ width: `calc((100% - 2rem) * ${Math.max(0, stageIdx) / (STAGES.length - 1)})` }}
            aria-hidden
          />
          {STAGES.map((s, i) => {
            const done = i < stageIdx
            const active = i === stageIdx
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
                  className={`mt-2 font-mono text-[10px] uppercase tracking-[0.18em] ${active || done ? 'text-[#0F4C4C]' : 'text-[#5F6E6D]'}`}
                >
                  {s.label}
                </p>
              </li>
            )
          })}
        </ol>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main */}
        <div className="lg:col-span-8 space-y-5">
          {/* Attachments */}
          <AdminCard
            eyebrow="Gating artifacts"
            title={`Attachments (${opp.attachments.length})`}
            description="Each stage gate requires a specific artifact. Quotes unlock Proposal · SoW unlocks Closed Won."
            action={
              !isClosed && (
                <button
                  type="button"
                  onClick={() => setAttachmentDraft({ kind: 'quote', name: '' })}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Attach
                </button>
              )
            }
          >
            {attachmentDraft && (
              <div className="mb-4 p-4 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                      Kind
                    </label>
                    <select
                      value={attachmentDraft.kind}
                      onChange={(e) =>
                        setAttachmentDraft({
                          ...attachmentDraft,
                          kind: e.target.value as OpportunityAttachment['kind'],
                        })
                      }
                      className="input"
                    >
                      {ATTACHMENT_KINDS.map((k) => (
                        <option key={k.value} value={k.value}>
                          {k.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                      Filename
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bridge Capital · Quote v2.pdf"
                      value={attachmentDraft.name}
                      onChange={(e) => setAttachmentDraft({ ...attachmentDraft, name: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAttachmentDraft(null)}
                    className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={attachFile}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-3 py-2 rounded-[3px] border border-[#082F2F]"
                  >
                    Attach
                  </button>
                </div>
              </div>
            )}

            {/* Gate status */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              {Object.entries(STAGE_GATES).map(([stage, gates]) => {
                const allPresent =
                  gates && gates.every((g) => opp.attachments.some((a) => a.kind === g.kind))
                return (
                  <div
                    key={stage}
                    className={`p-3 rounded-[3px] border text-[12px] ${
                      allPresent
                        ? 'bg-[#ECFEFE] border-[#0F766E] text-[#0F4C4C]'
                        : 'bg-[#F4F8F7] border-[#D5E0DE] text-[#5F6E6D]'
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5 flex items-center gap-1.5">
                      {allPresent ? (
                        <CheckCircle2 className="w-3 h-3 text-[#0F766E]" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-[#C5933A]" />
                      )}
                      {stage} gate
                    </p>
                    <ul className="space-y-0.5">
                      {gates?.map((g) => (
                        <li key={g.label}>· {g.label}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {opp.attachments.length === 0 ? (
              <p className="text-[13px] text-[#5F6E6D] text-center py-6">No artifacts attached yet.</p>
            ) : (
              <ul className="space-y-2">
                {opp.attachments.map((a) => {
                  const meta = ATTACHMENT_KINDS.find((k) => k.value === a.kind)
                  const Icon = meta?.icon ?? Paperclip
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60"
                    >
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-[3px] bg-white border border-[#D5E0DE] flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#0F4C4C]" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] text-[#0F4C4C] truncate">{a.name}</p>
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-0.5">
                          {a.kind} · {a.addedBy} · {formatRelative(a.addedAt)}
                        </p>
                      </div>
                      {!isClosed && (
                        <button
                          type="button"
                          onClick={() => removeAttachment(a.id)}
                          className="w-7 h-7 rounded-[3px] text-[#5F6E6D] hover:bg-[#FBE6E1] hover:text-[#B53A2B] flex items-center justify-center"
                          aria-label="Remove attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </AdminCard>

          {/* Line items */}
          <AdminCard
            eyebrow="Commercial"
            title={`Line items (${opp.lineItems.length})`}
            description={`MRR ${formatCurrency(recurringMo, { compact: true })} · One-time ${formatCurrency(oneTime, { compact: true })} · Year-1 ${formatCurrency(arr, { compact: true })}`}
            action={
              !isClosed && (
                <button
                  type="button"
                  onClick={() =>
                    setLineItemDraft({ service: SERVICES[0]!, qty: 1, rate: 0, recurring: true })
                  }
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-1.5 rounded-[3px] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add line
                </button>
              )
            }
          >
            {lineItemDraft && (
              <div className="mb-4 p-4 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                    Service
                  </label>
                  <select
                    value={lineItemDraft.service}
                    onChange={(e) => setLineItemDraft({ ...lineItemDraft, service: e.target.value })}
                    className="input"
                  >
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                    Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lineItemDraft.qty}
                    onChange={(e) => setLineItemDraft({ ...lineItemDraft, qty: Number(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                    Rate $
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={lineItemDraft.rate}
                    onChange={(e) => setLineItemDraft({ ...lineItemDraft, rate: Number(e.target.value) })}
                    className="input"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-[12.5px] text-[#0F4C4C]">
                    <input
                      type="checkbox"
                      checked={lineItemDraft.recurring}
                      onChange={(e) =>
                        setLineItemDraft({ ...lineItemDraft, recurring: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#0F766E]"
                    />
                    MRR
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setLineItemDraft(null)}
                      className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] hover:text-[#0F4C4C] px-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="inline-flex items-center text-[12px] font-semibold text-white bg-[#0F4C4C] px-3 py-2 rounded-[3px] border border-[#082F2F]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {opp.lineItems.length === 0 ? (
              <p className="text-[13px] text-[#5F6E6D] text-center py-6">No line items yet.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left border-b border-[#D5E0DE]">
                    <th className="py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium">Service</th>
                    <th className="py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium text-right">Qty</th>
                    <th className="py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium text-right">Rate</th>
                    <th className="py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium">Cadence</th>
                    <th className="py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] font-medium text-right">Subtotal</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {opp.lineItems.map((l) => (
                    <tr key={l.id} className="border-b border-[#E5EDEB]">
                      <td className="py-2.5 text-[#0F4C4C]">{l.service}</td>
                      <td className="py-2.5 text-right text-[#0F4C4C] font-mono">{l.qty}</td>
                      <td className="py-2.5 text-right text-[#0F4C4C] font-mono">{formatCurrency(l.rate)}</td>
                      <td className="py-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D]">
                        {l.recurring ? '/mo' : 'one-time'}
                      </td>
                      <td
                        className="py-2.5 text-right font-serif text-[15px] text-[#0F4C4C] tracking-[-0.005em]"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {formatCurrency(l.qty * l.rate, { compact: true })}
                      </td>
                      <td className="py-2.5 text-right">
                        {!isClosed && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(l.id)}
                            className="w-7 h-7 rounded-[3px] text-[#5F6E6D] hover:bg-[#FBE6E1] hover:text-[#B53A2B] flex items-center justify-center inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AdminCard>

          {/* Composer */}
          {!isClosed && (
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
                  rows={2}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add a note, call summary, or meeting outcome…"
                  className="input text-[13px]"
                />
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => void submitNote()}
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F4C4C] hover:bg-[#082F2F] px-4 py-2 rounded-[3px] transition-colors border border-[#082F2F]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Save activity
                  </button>
                </div>
              </div>
            </AdminCard>
          )}

          {/* Activity */}
          <AdminCard eyebrow="Chronicle" title={`Activity (${opp.activity.length})`} flush>
            <ol>
              {opp.activity.map((a, i, arr) => (
                <li
                  key={a.id}
                  className={`flex items-start gap-4 px-6 py-4 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-[3px] flex-shrink-0 ${
                      a.kind === 'stage'
                        ? 'bg-[#0F4C4C] text-white'
                        : a.kind === 'attachment'
                          ? 'bg-[#ECFEFE] text-[#0F4C4C]'
                          : a.kind === 'value'
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

        {/* Right rail */}
        <aside className="lg:col-span-4 space-y-5">
          <AdminCard eyebrow="Value" title="Adjust commercials">
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                  Deal value
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustValue(-5000)}
                    className="inline-flex items-center text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px]"
                  >
                    −5k
                  </button>
                  <div className="flex-1 h-9 bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] flex items-center justify-center">
                    <span
                      className="font-serif text-[18px] text-[#0F4C4C] tracking-[-0.005em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {formatCurrency(opp.value, { compact: true })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustValue(5000)}
                    className="inline-flex items-center text-[12px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-3 py-2 rounded-[3px]"
                  >
                    +5k
                  </button>
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                  Probability · {opp.probability}%
                </p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={opp.probability}
                  onChange={(e) => updateProb(Number(e.target.value))}
                  className="w-full accent-[#0F766E]"
                  disabled={isClosed}
                />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0F766E] mt-2">
                  Weighted · {formatCurrency((opp.value * opp.probability) / 100, { compact: true })}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-2">
                  Expected close
                </p>
                <input
                  type="date"
                  value={opp.expectedClose ?? ''}
                  onChange={(e) => {
                    setOpp((o) => ({ ...o, expectedClose: e.target.value }))
                    setDirty(true)
                  }}
                  className="input"
                  disabled={isClosed}
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard eyebrow="Contact" title="Primary stakeholder">
            <p
              className="font-serif text-[16px] text-[#0F4C4C]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {opp.primaryContact ?? '—'}
            </p>
            <a
              href={`mailto:${opp.primaryEmail ?? ''}`}
              className="block font-mono text-[12px] text-[#0F4C4C] hover:text-[#082F2F] mt-1 break-all"
            >
              {opp.primaryEmail ?? '—'}
            </a>
            {opp.accountId && (
              <button
                type="button"
                onClick={() => router.push(`/admin/accounts/${opp.accountId}` as never)}
                className="mt-4 w-full inline-flex items-center justify-between gap-2 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-2.5 rounded-[3px] transition-colors"
              >
                Open linked account
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </AdminCard>

          {opp.stage === 'closed-lost' && opp.lostReason && (
            <AdminCard eyebrow="Outcome" title="Closed lost">
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">Reason</p>
                <p
                  className="font-serif text-[18px] text-[#0F4C4C]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {opp.lostReason}
                </p>
                {opp.lostNote && <p className="text-[12.5px] text-[#5F6E6D] mt-2">{opp.lostNote}</p>}
              </div>
            </AdminCard>
          )}

          <AdminCard eyebrow="Heat" title="Deal signals">
            <ul className="space-y-2">
              <Signal label="Quote attached" ok={opp.attachments.some((a) => a.kind === 'quote')} />
              <Signal label="Proposal attached" ok={opp.attachments.some((a) => a.kind === 'proposal')} />
              <Signal label="SoW attached" ok={opp.attachments.some((a) => a.kind === 'sow')} />
              <Signal label="Activity last 7 days" ok={true} />
              <Signal
                label="Owner assigned"
                ok={!!opp.owner}
              />
            </ul>
          </AdminCard>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm?.kind === 'advance'}
        title={`Missing artifact${confirm?.kind === 'advance' && confirm.gates.length > 1 ? 's' : ''} for next stage`}
        body={
          confirm?.kind === 'advance' ? (
            <>
              <p className="mb-3">Attach before advancing:</p>
              <ul className="space-y-1.5">
                {confirm.gates.map((g) => (
                  <li key={g} className="flex items-center gap-2 text-[13px] text-[#0F4C4C]">
                    <AlertCircle className="w-3.5 h-3.5 text-[#B53A2B]" />
                    {g}
                  </li>
                ))}
              </ul>
            </>
          ) : null
        }
        confirmLabel="Force advance (audited)"
        cancelLabel="Stay & attach"
        destructive
        onConfirm={() => {
          if (confirm?.kind === 'advance') void moveStage(confirm.to, true)
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm?.kind === 'win'}
        title={
          <span className="inline-flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#0F766E]" />
            Close as Won?
          </span> as unknown as string
        }
        body={
          <>
            <p>
              This will create an <span className="font-semibold">Account</span> for{' '}
              <span className="font-semibold">{opp.prospectName}</span>, open the first engagement,
              and start onboarding. SoW {opp.attachments.some((a) => a.kind === 'sow') ? '✓' : '✗ MISSING'}.
            </p>
            {!opp.attachments.some((a) => a.kind === 'sow') && (
              <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#B53A2B]">
                <AlertCircle className="w-3.5 h-3.5" />
                Audited override required
              </p>
            )}
          </>
        }
        confirmLabel="Close won"
        onConfirm={() => void closeWon()}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm?.kind === 'lose'}
        title="Close as Lost?"
        body={
          <div className="space-y-3">
            <p>Recorded for win-rate reporting. You can still reopen later.</p>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                Reason
              </label>
              <select
                value={lossDraft.reason}
                onChange={(e) => setLossDraft({ ...lossDraft, reason: e.target.value as LossReason })}
                className="input"
              >
                <option value="price">Price</option>
                <option value="incumbent">Stayed with incumbent</option>
                <option value="no-decision">No decision</option>
                <option value="wrong-fit">Wrong fit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">
                Note
              </label>
              <textarea
                rows={2}
                value={lossDraft.note}
                onChange={(e) => setLossDraft({ ...lossDraft, note: e.target.value })}
                className="input text-[13px]"
                placeholder="What happened, in one or two sentences."
              />
            </div>
          </div>
        }
        confirmLabel="Close lost"
        destructive
        onConfirm={() => void closeLost()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function Signal({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-2 text-[12.5px]">
      {ok ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-[#5F6E6D]" />
      )}
      <span className={ok ? 'text-[#0F4C4C]' : 'text-[#5F6E6D]'}>{label}</span>
    </li>
  )
}

// silence unused imports (used in JSX above conditionally)
void Sparkles
void Star
