import { notFound } from 'next/navigation'
import { getEngagement } from '@/server/admin-data'
import EngagementDetailClient from './EngagementDetailClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getEngagement(id)
  if (!data) notFound()
  return <EngagementDetailClient initial={data} />
}
