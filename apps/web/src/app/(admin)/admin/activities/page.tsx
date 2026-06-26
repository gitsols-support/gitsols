import type { Metadata } from 'next'
import { Activity, Mail, Phone, FileSignature, CheckCircle2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { formatRelative } from '@/server/admin-stubs'

export const metadata: Metadata = { title: 'Activity log · Admin' }

type Entry = {
  id: string
  ts: string
  actor: string
  verb: string
  target: string
  kind: 'email' | 'call' | 'milestone' | 'document' | 'note' | 'lead' | 'ticket'
}

const FEED: Entry[] = [
  { id: 'a-1', ts: '2026-05-30T11:42:00Z', actor: 'Sohail Akram', verb: 'logged a call with', target: 'Theodore Hahn (Riverbend)', kind: 'call' },
  { id: 'a-2', ts: '2026-05-30T11:08:00Z', actor: 'System', verb: 'received a new lead from', target: 'Aisha Patel (Meadow Ridge Pediatrics)', kind: 'lead' },
  { id: 'a-3', ts: '2026-05-30T10:35:00Z', actor: 'Sohail Akram', verb: 'sent SoW v3 to', target: 'Sterling & Park Attorneys', kind: 'document' },
  { id: 'a-4', ts: '2026-05-30T09:18:00Z', actor: 'Verde IT', verb: 'approved milestone "Network segmentation" for', target: 'Verde Health Partners', kind: 'milestone' },
  { id: 'a-5', ts: '2026-05-30T08:11:00Z', actor: 'Sohail Akram', verb: 'replied to ticket', target: 'T-26-1042 · Harrowgate Insurance VPN down', kind: 'ticket' },
  { id: 'a-6', ts: '2026-05-29T22:48:00Z', actor: 'Lakeside Medical', verb: 'opened ticket', target: 'T-26-1040 · Clinical onboarding', kind: 'ticket' },
  { id: 'a-7', ts: '2026-05-29T17:02:00Z', actor: 'Sohail Akram', verb: 'emailed', target: 'Marcus Chen (Chen Wealth) re: NYDFS scoping', kind: 'email' },
  { id: 'a-8', ts: '2026-05-29T15:30:00Z', actor: 'System', verb: 'auto-flagged', target: 'Harrowgate Insurance — health declined (critical)', kind: 'note' },
  { id: 'a-9', ts: '2026-05-29T11:14:00Z', actor: 'Verde IT', verb: 'submitted milestone feedback (5/5) on', target: 'EHR uplift · Verde Health Partners', kind: 'milestone' },
  { id: 'a-10', ts: '2026-05-29T09:00:00Z', actor: 'Sohail Akram', verb: 'closed ticket', target: 'T-26-1037 · Eastfield M365 license uplift', kind: 'ticket' },
]

const KIND_ICON: Record<Entry['kind'], React.ElementType> = {
  email: Mail,
  call: Phone,
  milestone: CheckCircle2,
  document: FileSignature,
  note: Activity,
  lead: Activity,
  ticket: Activity,
}

const KIND_TONE: Record<Entry['kind'], string> = {
  email: 'bg-[#ECFEFE] text-[#0F4C4C]',
  call: 'bg-[#CFFAFA] text-[#0F4C4C]',
  milestone: 'bg-[#0F4C4C] text-white',
  document: 'bg-[#F4F8F7] text-[#0F4C4C]',
  note: 'bg-[#F4F8F7] text-[#5F6E6D]',
  lead: 'bg-[#ECFEFE] text-[#0F4C4C]',
  ticket: 'bg-[#FAEFD4] text-[#7A5A1F]',
}

export default function AdminActivitiesPage() {
  return (
    <div className="max-w-[1100px] space-y-6">
      <AdminPageHeader
        eyebrow="Operations · Audit"
        title="Activity log"
        description="Every interaction across the firm — calls, emails, approvals, document events, ticket transitions. Audit-grade record."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'CRM' }, { label: 'Activity' }]}
        stats={[
          { label: 'Today', value: FEED.filter((e) => e.ts.startsWith('2026-05-30')).length },
          { label: '7-day', value: FEED.length },
          { label: 'Actors', value: 4 },
          { label: 'Sources', value: 7 },
        ]}
      />

      <AdminCard eyebrow="Chronicle" title="Recent activity" flush>
        <ol>
          {FEED.map((e, i, arr) => {
            const Icon = KIND_ICON[e.kind]
            return (
              <li
                key={e.id}
                className={`px-6 py-4 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''} flex items-start gap-4`}
              >
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-[3px] flex-shrink-0 ${KIND_TONE[e.kind]}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] text-[#062524] leading-snug">
                    <span className="font-semibold text-[#0F4C4C]">{e.actor}</span>{' '}
                    <span className="text-[#5F6E6D]">{e.verb}</span>{' '}
                    <span className="text-[#0F4C4C]">{e.target}</span>
                  </p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5F6E6D] mt-1">
                    {formatRelative(e.ts)} · {e.kind}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </AdminCard>
    </div>
  )
}
