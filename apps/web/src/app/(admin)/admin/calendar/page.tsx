import type { Metadata } from 'next'
import { Calendar, Plus, ExternalLink } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'

export const metadata: Metadata = { title: 'Calendar · Admin' }

const TODAY = [
  { time: '9:00', title: 'Audit · Meadow Ridge Pediatrics', kind: 'Discovery', with: 'Dr. Aisha Patel', length: '60m' },
  { time: '11:00', title: 'Verde Q2 QBR', kind: 'QBR', with: 'Dr. Mei-Lin Wu', length: '90m' },
  { time: '13:30', title: 'Riverbend NYDFS review', kind: 'Workshop', with: 'Theodore Hahn', length: '45m' },
  { time: '15:00', title: 'Sterling SoW walkthrough', kind: 'Sales', with: 'Margaret Park', length: '30m' },
]

const WEEK = [
  { day: 'Mon', date: '02', meetings: 4 },
  { day: 'Tue', date: '03', meetings: 6 },
  { day: 'Wed', date: '04', meetings: 3 },
  { day: 'Thu', date: '05', meetings: 5 },
  { day: 'Fri', date: '06', meetings: 2 },
]

export default function AdminCalendarPage() {
  return (
    <div className="max-w-[1400px] space-y-6">
      <AdminPageHeader
        eyebrow="Operations · Booking"
        title="Calendar"
        description="Internal calendar plus client-facing booking links. Pulls from Microsoft 365 and Cal.com self-hosted."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Delivery' }, { label: 'Calendar' }]}
        stats={[
          { label: 'Today', value: TODAY.length },
          { label: 'This week', value: WEEK.reduce((s, w) => s + w.meetings, 0) },
          { label: 'Booking links', value: 3 },
          { label: 'No-show · 30d', value: '4%', hint: 'on target' },
        ]}
        primaryAction={{ label: 'New event', href: '/admin/calendar', icon: Plus }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AdminCard eyebrow="Today" title="Schedule" className="lg:col-span-2" flush>
          <ul>
            {TODAY.map((e, i, arr) => (
              <li
                key={i}
                className={`flex items-start gap-5 px-6 py-4 ${i < arr.length - 1 ? 'border-b border-[#E5EDEB]' : ''}`}
              >
                <div className="text-right w-14 flex-shrink-0">
                  <p className="font-serif text-[22px] text-[#0F4C4C] leading-none tracking-[-0.015em]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {e.time}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5F6E6D] mt-1">{e.length}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0F766E]">{e.kind}</span>
                  </div>
                  <p className="font-serif text-[16px] text-[#0F4C4C] leading-tight tracking-[-0.005em]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {e.title}
                  </p>
                  <p className="font-mono text-[11px] text-[#5F6E6D] mt-1">With {e.with}</p>
                </div>
                <Calendar className="w-4 h-4 text-[#0F766E]" />
              </li>
            ))}
          </ul>
        </AdminCard>

        <div className="space-y-5">
          <AdminCard eyebrow="Week" title="Density">
            <div className="grid grid-cols-5 gap-2">
              {WEEK.map((d) => (
                <div key={d.day} className="text-center bg-[#F4F8F7] border border-[#D5E0DE] rounded-[3px] py-3">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">{d.day}</p>
                  <p className="font-serif text-[20px] text-[#0F4C4C] leading-none mt-1" style={{ fontFamily: 'var(--font-serif)' }}>
                    {d.date}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#0F766E] mt-1.5">
                    {d.meetings} mtgs
                  </p>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard eyebrow="Booking" title="Public links">
            <ul className="space-y-2">
              {[
                { name: 'Free IT audit · 60m', url: 'cal.com/gitsols/audit' },
                { name: 'Bespoke scoping · 45m', url: 'cal.com/gitsols/scope' },
                { name: 'Account QBR · 90m', url: 'cal.com/gitsols/qbr' },
              ].map((l) => (
                <li key={l.url} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[3px] border border-[#D5E0DE] bg-[#F4F8F7]/60">
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-[#0F4C4C]">{l.name}</p>
                    <p className="font-mono text-[10.5px] text-[#5F6E6D] mt-0.5 truncate">{l.url}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#5F6E6D]" />
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}
