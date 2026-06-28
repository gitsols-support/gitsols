import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getPortalEngagements } from '@/server/portal-data'

export const metadata = { title: 'Projects · Client portal' }

const HEALTH: Record<string, string> = { green: 'bg-[#14B8A6]', amber: 'bg-[#C5933A]', red: 'bg-[#B53A2B]' }

export default async function Page() {
  const items = await getPortalEngagements()
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Delivery" title="Your projects" description="Active engagements and milestone progress." stats={[{ label: 'Projects', value: items.length }]} />
      {items.length === 0 ? (
        <AdminCard title="No projects yet"><p className="text-[13px] text-[#5F6E6D]">Your active engagements will appear here.</p></AdminCard>
      ) : (
        <div className="space-y-4">
          {items.map((e) => (
            <AdminCard key={e.id} eyebrow={e.type} title={e.name}>
              <div className="flex items-center gap-4 flex-wrap text-[12.5px] text-[#5F6E6D]">
                <span className="inline-flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${HEALTH[e.health] ?? 'bg-[#9aa6a4]'}`} /> {e.status}</span>
                <span>Stage: <span className="text-[#0F4C4C]">{e.stage}</span></span>
                {e.nextMilestone && <span>Next: <span className="text-[#0F4C4C]">{e.nextMilestone}</span>{e.nextMilestoneDue ? ` (due ${e.nextMilestoneDue})` : ''}</span>}
              </div>
              {e.milestones && e.milestones.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {e.milestones.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 text-[12.5px] border-b border-dotted border-[#D5E0DE] pb-2 last:border-0">
                      <span className="text-[#0F4C4C]">{m.title}</span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">{m.status}{m.dueDate ? ` · ${m.dueDate}` : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  )
}
