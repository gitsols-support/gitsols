'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  GitBranch,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { updateOpportunityStage } from '@/server/admin-actions'
import { formatCurrency } from '@/server/admin-stubs'
import type { Opportunity, OpportunityStage } from '@gitsols/types'

type Col = { id: OpportunityStage; label: string; tone: string }

const STAGES: Col[] = [
  { id: 'new', label: 'New', tone: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]' },
  { id: 'qualified', label: 'Qualified', tone: 'bg-[#CFFAFA] text-[#0F4C4C] border-[#0F766E]' },
  { id: 'proposal', label: 'Proposal', tone: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]' },
  { id: 'sow-sent', label: 'SoW sent', tone: 'bg-[#0F766E] text-white border-[#0F4C4C]' },
  { id: 'closed-won', label: 'Closed won', tone: 'bg-[#0F4C4C] text-white border-[#0F766E]' },
]
const LOST_COL: Col = {
  id: 'closed-lost',
  label: 'Closed lost',
  tone: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
}

const ALL_STAGES: { id: OpportunityStage; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'sow-sent', label: 'SoW sent' },
  { id: 'closed-won', label: 'Closed won' },
  { id: 'closed-lost', label: 'Closed lost' },
]

export default function PipelineBoard({
  initial,
  owners,
}: {
  initial: Opportunity[]
  owners: string[]
}) {
  const { push } = useToast()
  const [opps, setOpps] = useState<Opportunity[]>(initial)
  const [search, setSearch] = useState('')
  const [owner, setOwner] = useState('all')
  const [showLost, setShowLost] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<OpportunityStage | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const cols = showLost ? [...STAGES, LOST_COL] : STAGES

  const filtered = opps.filter((o) => {
    if (owner !== 'all' && o.owner !== owner) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const hay = `${o.name} ${o.prospectName} ${o.primaryContact ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  async function move(id: string, to: OpportunityStage) {
    const cur = opps.find((o) => o.id === id)
    if (!cur || cur.stage === to) return
    const prev = cur.stage
    setPendingId(id)
    setOpps((p) => p.map((o) => (o.id === id ? { ...o, stage: to } : o)))
    const res = await updateOpportunityStage(id, to)
    setPendingId(null)
    if (res.ok) {
      setOpps((p) => p.map((o) => (o.id === id ? res.data : o)))
      push('success', `Moved “${cur.name}” → ${to}`)
    } else {
      setOpps((p) => p.map((o) => (o.id === id ? { ...o, stage: prev } : o)))
      push('error', res.error || 'Could not move the opportunity')
    }
  }

  return (
    <>
      <AdminCard eyebrow="Filters" title="Slice the board">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5F6E6D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by deal name, account, contact…"
              className="input pl-9"
            />
          </div>
          <select
            className="input max-w-[200px]"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="all">All owners</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-[3px] border border-[#D5E0DE] bg-white cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 accent-[#0F766E]"
              checked={showLost}
              onChange={(e) => setShowLost(e.target.checked)}
            />
            <span className="text-[12.5px] text-[#0F4C4C]">Show lost</span>
          </label>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#5F6E6D]">
            <Filter className="w-3.5 h-3.5" />
            Drag a card between columns, or use its stage menu, to advance a deal.
          </span>
        </div>
      </AdminCard>

      <AdminCard
        eyebrow="Board"
        title="By stage"
        description="Drag a card to a new column to change its stage, or open a deal for the full record. Changes save immediately."
      >
        <div className="overflow-x-auto -mx-6 px-6 pb-2">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`,
              minWidth: cols.length * 260,
            }}
          >
            {cols.map((stage) => {
              const items = filtered.filter((o) => o.stage === stage.id)
              const stageValue = items.reduce((s, o) => s + o.value, 0)
              const isOver = overStage === stage.id
              return (
                <div
                  key={stage.id}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (overStage !== stage.id) setOverStage(stage.id)
                  }}
                  onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (dragId) void move(dragId, stage.id)
                    setDragId(null)
                    setOverStage(null)
                  }}
                  className={`space-y-2 rounded-[3px] transition-colors ${isOver ? 'bg-[#ECFEFE] outline-2 outline-dashed outline-[#0F766E]/40' : ''}`}
                >
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
                        {stage.label}
                      </p>
                      <p
                        className="font-serif text-[20px] text-[#0F4C4C] leading-none mt-1 tracking-[-0.01em]"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {items.length}
                      </p>
                      <p className="font-mono text-[10px] text-[#5F6E6D] mt-1">
                        {formatCurrency(stageValue, { compact: true })}
                      </p>
                    </div>
                    <GitBranch className="w-3.5 h-3.5 text-[#0F766E]" />
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {items.length === 0 && (
                      <div className="border border-dashed border-[#D5E0DE] rounded-[3px] p-4 text-center">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                          drop here
                        </p>
                      </div>
                    )}
                    {items.map((o) => (
                      <OppCard
                        key={o.id}
                        opp={o}
                        pending={pendingId === o.id}
                        onDragStart={() => setDragId(o.id)}
                        onDragEnd={() => setDragId(null)}
                        onMove={(to) => move(o.id, to)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </AdminCard>
    </>
  )
}

function OppCard({
  opp,
  pending,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  opp: Opportunity
  pending: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onMove: (to: OpportunityStage) => void
}) {
  const valuePerMo = opp.lineItems
    .filter((l) => l.recurring)
    .reduce((s, l) => s + l.qty * l.rate, 0)
  const heat = opp.probability >= 70 ? 'hot' : opp.probability >= 40 ? 'warm' : 'cool'
  const heatTone =
    heat === 'hot' ? 'text-[#B53A2B]' : heat === 'warm' ? 'text-[#7A5A1F]' : 'text-[#0F4C4C]'

  return (
    <div
      draggable={!pending}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`relative bg-white border border-[#D5E0DE] hover:border-[#0F4C4C]/40 rounded-[3px] overflow-hidden transition-colors group ${pending ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40 group-hover:bg-[#0F766E] transition-colors" />
      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0F766E]">{opp.id.slice(0, 8)}</p>
          <span className="flex items-center gap-1">
            {pending && <Loader2 className="w-3.5 h-3.5 text-[#0F766E] animate-spin" />}
            {opp.stage === 'closed-won' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />}
            {opp.stage === 'closed-lost' && <XCircle className="w-3.5 h-3.5 text-[#B53A2B]" />}
            <Link
              href={`/admin/pipeline/${opp.id}` as never}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Open opportunity"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#5F6E6D] hover:text-[#0F4C4C]" />
            </Link>
          </span>
        </div>
        <Link href={`/admin/pipeline/${opp.id}` as never} className="block">
          <p
            className="font-serif text-[14.5px] text-[#0F4C4C] leading-tight tracking-[-0.005em] hover:underline"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {opp.name}
          </p>
          <p className="text-[11.5px] text-[#5F6E6D] mt-0.5">{opp.prospectName}</p>
        </Link>
        <div className="flex items-center justify-between font-mono text-[10.5px] text-[#5F6E6D]">
          <span className={`inline-flex items-center gap-1 ${heatTone}`}>
            <Sparkles className="w-3 h-3" />
            {opp.probability}%
          </span>
          <span>
            {opp.expectedClose
              ? `Close ${new Date(opp.expectedClose).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : 'No close date'}
          </span>
        </div>
        <div className="pt-2 border-t border-[#E5EDEB] flex items-center justify-between">
          <div>
            <span
              className="font-serif text-[16px] text-[#0F4C4C] tracking-[-0.005em]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {formatCurrency(opp.value, { compact: true })}
            </span>
            {valuePerMo > 0 && (
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#5F6E6D] ml-1">
                · {formatCurrency(valuePerMo, { compact: true })}/mo
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            {opp.attachments.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#0F766E] bg-[#ECFEFE] border border-[#CFFAFA] px-1.5 py-0.5 rounded-[2px]"
              >
                {a.kind}
              </span>
            ))}
          </div>
          <select
            aria-label="Move to stage"
            value={opp.stage}
            disabled={pending}
            onChange={(e) => onMove(e.target.value as OpportunityStage)}
            className="text-[10.5px] font-mono border border-[#D5E0DE] rounded-[2px] bg-white px-1 py-0.5 text-[#0F4C4C] focus:outline-none focus:border-[#0F766E] disabled:opacity-50"
          >
            {ALL_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
