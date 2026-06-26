'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Ticket as TicketIcon,
  ArrowLeft,
  Building2,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  MessageSquare,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { updateTicketStatus, addTicketComment } from '@/server/admin-actions'
import { formatRelative } from '@/server/admin-stubs'
import type { Ticket, TicketStatus } from '@gitsols/types'

const STATUS_TONE: Record<TicketStatus, string> = {
  open: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  'in-progress': 'bg-[#0F4C4C] text-white border-[#0F766E]',
  'awaiting-client': 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  resolved: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const PRIORITY_TONE: Record<Ticket['priority'], string> = {
  p1: 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  p2: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
  p3: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  p4: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
}

const STATUSES: { id: TicketStatus; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'awaiting-client', label: 'Awaiting client' },
  { id: 'resolved', label: 'Resolved' },
]

const CATEGORY_LABEL: Record<Ticket['category'], string> = {
  incident: 'Incident',
  request: 'Request',
  change: 'Change',
  project: 'Project',
}

export default function TicketDetailClient({ initial }: { initial: Ticket }) {
  const { push } = useToast()
  const [ticket, setTicket] = useState<Ticket>(initial)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [statusPending, setStatusPending] = useState<TicketStatus | null>(null)

  const comments = ticket.comments ?? []

  async function changeStatus(status: TicketStatus) {
    if (status === ticket.status) return
    setStatusPending(status)
    const res = await updateTicketStatus(ticket.id, status)
    setStatusPending(null)
    if (res.ok) {
      setTicket(res.data)
      push('success', `Status → ${status.replace('-', ' ')}`)
    } else {
      push('error', res.error || 'Could not update status')
    }
  }

  async function postComment() {
    const body = draft.trim()
    if (!body) return
    setPosting(true)
    const res = await addTicketComment(ticket.id, body)
    setPosting(false)
    if (res.ok) {
      setTicket(res.data)
      setDraft('')
    } else {
      push('error', res.error || 'Could not post comment')
    }
  }

  return (
    <div className="max-w-[1100px] space-y-6">
      <Link
        href={'/admin/tickets' as never}
        className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.16em] text-[#5F6E6D] hover:text-[#0F4C4C]"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to queue
      </Link>

      <AdminPageHeader
        eyebrow={`Ticket · ${ticket.id.slice(0, 8)}`}
        title={ticket.subject}
        description={ticket.accountName ? `Account: ${ticket.accountName}` : 'Unassigned account'}
        badge={{
          label: ticket.status.replace('-', ' '),
          tone: ticket.status === 'resolved' ? 'muted' : ticket.priority === 'p1' ? 'warn' : 'live',
        }}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Tickets', href: '/admin/tickets' },
          { label: ticket.id.slice(0, 8) },
        ]}
        stats={[
          { label: 'Priority', value: ticket.priority.toUpperCase() },
          { label: 'Category', value: CATEGORY_LABEL[ticket.category] },
          { label: 'Comments', value: comments.length },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {ticket.description && (
            <AdminCard eyebrow="Detail" title="Description">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </AdminCard>
          )}

          <AdminCard
            eyebrow="Thread"
            title={`Comments (${comments.length})`}
            description="Internal notes and client correspondence."
            flush
          >
            <ul>
              {comments.length === 0 && (
                <li className="px-6 py-10 text-center">
                  <MessageSquare className="w-7 h-7 mx-auto text-[#9FB3B0] mb-2" />
                  <p className="text-sm text-gray-500">No comments yet.</p>
                </li>
              )}
              {comments.map((c, i) => (
                <li
                  key={c.id}
                  className={`px-6 py-4 ${i < comments.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-[#0F4C4C]">{c.author}</span>
                    <span className="font-mono text-[10px] text-[#5F6E6D]">
                      {formatRelative(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#E5EDEB] p-4">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Add a comment…"
                className="input w-full resize-y"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => void postComment()}
                  disabled={posting || !draft.trim()}
                  className="inline-flex items-center gap-1.5 bg-[#0F4C4C] text-white hover:bg-[#155E5E] disabled:opacity-50 text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {posting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Post comment
                </button>
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-5">
          <AdminCard eyebrow="Workflow" title="Status">
            <div className="space-y-2">
              {STATUSES.map((s) => {
                const active = ticket.status === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => void changeStatus(s.id)}
                    disabled={statusPending !== null}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-[13px] font-medium transition-colors disabled:opacity-60 ${
                      active
                        ? STATUS_TONE[s.id]
                        : 'bg-white border-[#E2E8E8] text-[#0F4C4C] hover:bg-gray-50'
                    }`}
                  >
                    <span>{s.label}</span>
                    {statusPending === s.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      active && <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )
              })}
            </div>
          </AdminCard>

          <AdminCard eyebrow="Ticket" title="Details">
            <dl className="space-y-3 text-sm">
              <Row icon={TicketIcon} label="Priority">
                <span
                  className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-[3px] border ${PRIORITY_TONE[ticket.priority]}`}
                >
                  {ticket.priority.toUpperCase()}
                </span>
              </Row>
              <Row icon={Building2} label="Account">
                {ticket.accountName ?? '—'}
              </Row>
              <Row icon={CheckCircle2} label="Assignee">
                {ticket.assignee ?? 'Unassigned'}
              </Row>
              <Row icon={Clock} label="Opened">
                {formatRelative(ticket.openedAt)}
              </Row>
              {ticket.slaTarget && (
                <Row icon={Clock} label="SLA target">
                  {new Date(ticket.slaTarget).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Row>
              )}
              {ticket.resolvedAt && (
                <Row icon={CheckCircle2} label="Resolved">
                  {formatRelative(ticket.resolvedAt)}
                </Row>
              )}
            </dl>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-1.5 text-gray-500">
        <Icon className="w-3.5 h-3.5 text-[#0F766E]" />
        {label}
      </dt>
      <dd className="text-gray-800 font-medium text-right">{children}</dd>
    </div>
  )
}
