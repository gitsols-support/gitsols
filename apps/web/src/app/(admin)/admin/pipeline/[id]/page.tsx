import { notFound } from 'next/navigation'
import { getOpportunity } from '@/server/admin-data'
import OpportunityDetailClient from './OpportunityDetailClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getOpportunity(id)
  if (!data) notFound()
  return <OpportunityDetailClient initial={data} />
}
