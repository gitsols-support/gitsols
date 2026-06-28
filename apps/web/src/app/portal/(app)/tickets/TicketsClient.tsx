'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, LifeBuoy } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { useToast } from '@/components/admin/Toast'
import { createPortalTicket } from '@/server/admin-actions'
import type { Ticket } from '@gitsols/types'

const STATUS: Record<string, string> = {
  open: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
  'in-progress': 'bg-[#FEF6E6] text-[#8a6516] border-[#F5E4BD]',
  'awaiting-client': 'bg-[#FBE6E1] text-[#B53A2B] border-[#F5C9C0]',
  resolved: 'bg-[#0F4C4C] text-white border-[#0F766E]',
}

export default function TicketsClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const router = useRouter()
  const { push } = useToast()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p3')
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!subject.trim()) return push('error', 'Subject required', 'Describe the issue briefly.')
    setSaving(true)
    const res = await createPortalTicket({ subject: subject.trim(), description: description.trim() || undefined, priority })
    setSaving(false)
    if (!res.ok) return push('error', 'Could not submit', res.error)
    push('success', 'Ticket submitted', 'Our team will follow up shortly.')
    setSubject(''); setDescription(''); setPriority('p3'); setOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Support"
        title="Support tickets"
        description="Raise a request and track its status."
        stats={[{ label: 'Tickets', value: initialTickets.length }, { label: 'Open', value: initialTickets.filter((t) => t.status !== 'resolved').length }]}
      />

      <div className="flex justify-end">
        <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2 rounded-[3px] border border-[#0F4C4C]">
          <Plus className="w-3.5 h-3.5" /> {open ? 'Close form' : 'New ticket'}
        </button>
      </div>

      {open && (
        <AdminCard eyebrow="New" title="File a ticket">
          <div className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">Subject</label>
              <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">Details</label>
              <textarea className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's happening?" />
            </div>
            <div className="max-w-[200px]">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-1.5 block">Priority</label>
              <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as 'p1' | 'p2' | 'p3' | 'p4')}>
                <option value="p1">P1 — Urgent</option>
                <option value="p2">P2 — High</option>
                <option value="p3">P3 — Normal</option>
                <option value="p4">P4 — Low</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={submit} disabled={saving} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0F766E] hover:bg-[#0F4C4C] px-4 py-2.5 rounded-[3px] border border-[#0F4C4C] disabled:opacity-60">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Submit ticket
              </button>
            </div>
          </div>
        </AdminCard>
      )}

      <AdminCard flush title={`${initialTickets.length} ticket${initialTickets.length === 1 ? '' : 's'}`}>
        {initialTickets.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <LifeBuoy className="w-7 h-7 mx-auto text-[#9aa6a4] mb-2" />
            <p className="text-[13px] text-[#5F6E6D]">No tickets yet. File one above when you need help.</p>
          </div>
        ) : (
          <ul>
            {initialTickets.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-6 py-3 border-b border-[#EDF2F1] last:border-0">
                <div>
                  <p className="text-[13px] text-[#0F4C4C]">{t.subject}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">{t.priority} · {t.category}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-[3px] border text-[10.5px] font-mono uppercase ${STATUS[t.status] ?? 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]'}`}>{t.status}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  )
}
