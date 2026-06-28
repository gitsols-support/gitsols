import { FileText } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminCard from '@/components/admin/AdminCard'
import { getPortalDocuments } from '@/server/portal-data'

export const metadata = { title: 'Documents · Client portal' }

export default async function Page() {
  const docs = await getPortalDocuments()
  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Library" title="Documents" description="Files shared with your account." stats={[{ label: 'Documents', value: docs.length }]} />
      <AdminCard flush title={`${docs.length} file${docs.length === 1 ? '' : 's'}`}>
        {docs.length === 0 ? (
          <div className="px-6 py-12 text-center text-[13px] text-[#5F6E6D]">No documents shared yet.</div>
        ) : (
          <ul>
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-6 py-3 border-b border-[#EDF2F1] last:border-0">
                <span className="inline-flex items-center gap-2 text-[13px] text-[#0F4C4C]"><FileText className="w-4 h-4 text-[#0F766E]" />{d.name}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#5F6E6D]">{d.kind}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  )
}
