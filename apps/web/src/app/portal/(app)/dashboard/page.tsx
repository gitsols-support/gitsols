import Link from 'next/link'
import { Briefcase, ReceiptText, LifeBuoy, CalendarClock, ArrowUpRight } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getPortalOverview } from '@/server/portal-data'
import { formatCurrency } from '@/server/admin-data'

export const metadata = { title: 'Overview · Client portal' }

export default async function Page() {
  const o = await getPortalOverview()
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={`Welcome · ${o.account.name}`}
        title="Your account at a glance"
        description="Projects, invoices, support, and monitoring for your organization."
        stats={[
          { label: 'Active projects', value: o.engagementsActive },
          { label: 'Open tickets', value: o.openTickets },
          { label: 'Invoices due', value: o.invoicesOutstanding },
          { label: 'Balance due', value: formatCurrency(o.balanceDue) },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard eyebrow="Next up" title="Upcoming milestone">
          {o.nextMilestone ? (
            <div className="flex items-start gap-3">
              <CalendarClock className="w-5 h-5 text-[#0F766E] mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-[#0F4C4C]">{o.nextMilestone.title}</p>
                <p className="text-[12.5px] text-[#5F6E6D]">{o.nextMilestone.engagement}{o.nextMilestone.due ? ` · due ${o.nextMilestone.due}` : ''}</p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[#5F6E6D]">No upcoming milestones scheduled.</p>
          )}
        </AdminCard>
        <AdminCard eyebrow="Quick links" title="Jump to">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Projects', href: '/portal/engagements', icon: Briefcase },
              { label: 'Invoices', href: '/portal/invoices', icon: ReceiptText },
              { label: 'Support', href: '/portal/tickets', icon: LifeBuoy },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-[3px] border border-[#D5E0DE] hover:bg-[#F4F8F7] text-[13px] text-[#0F4C4C]">
                <span className="inline-flex items-center gap-2"><l.icon className="w-4 h-4 text-[#0F766E]" />{l.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#5F6E6D]" />
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
