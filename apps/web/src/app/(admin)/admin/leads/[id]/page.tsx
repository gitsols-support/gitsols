import { notFound } from 'next/navigation'
import { getLead } from '@/server/admin-data'
import LeadDetailClient from './LeadDetailClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getLead(id)
  if (!data) notFound()
  return <LeadDetailClient initial={data} />
}
