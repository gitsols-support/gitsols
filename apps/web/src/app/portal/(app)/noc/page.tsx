import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getPortalNoc } from '@/server/portal-data'

export const metadata = { title: 'Monitoring · Client portal' }

const DOT: Record<string, string> = {
  healthy: 'bg-[#14B8A6]', warning: 'bg-[#C5933A]', critical: 'bg-[#B53A2B]', offline: 'bg-[#9aa6a4]', unenrolled: 'bg-[#D5E0DE]',
}

export default async function Page() {
  const { rollup, endpoints, alerts } = await getPortalNoc()
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Security · Monitoring"
        title="Endpoint monitoring"
        description="Live health of your managed devices."
        stats={[
          { label: 'Endpoints', value: rollup.total },
          { label: 'Healthy', value: rollup.healthy },
          { label: 'Warnings', value: rollup.warning },
          { label: 'Open alerts', value: rollup.openAlerts },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard flush eyebrow="Devices" title="Endpoints">
          {endpoints.length === 0 ? (
            <div className="px-6 py-10 text-center text-[13px] text-[#5F6E6D]">No monitored endpoints yet.</div>
          ) : (
            <ul>
              {endpoints.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-6 py-2.5 border-b border-[#EDF2F1] last:border-0 text-[12.5px]">
                  <span className="inline-flex items-center gap-2 text-[#0F4C4C]"><span className={`w-2 h-2 rounded-full ${DOT[e.status] ?? 'bg-[#9aa6a4]'}`} />{e.displayName ?? e.hostname}</span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#5F6E6D]">{e.osFamily} · {e.status}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
        <AdminCard flush eyebrow="Active" title="Open alerts">
          {alerts.length === 0 ? (
            <div className="px-6 py-10 text-center text-[13px] text-[#5F6E6D]">No open alerts. All clear.</div>
          ) : (
            <ul>
              {alerts.map((a) => (
                <li key={a.id} className="px-6 py-2.5 border-b border-[#EDF2F1] last:border-0">
                  <p className="text-[12.5px] text-[#0F4C4C]">{a.title}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#5F6E6D]">{a.severity} · {a.endpointHostname}</p>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  )
}
