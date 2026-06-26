import { notFound } from 'next/navigation'
import { getProposal } from '@/server/admin-data'
import BillingDetailClient from '@/components/admin/BillingDetailClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const proposal = await getProposal(id)
  if (!proposal) notFound()
  return <BillingDetailClient kind="proposal" doc={proposal} />
}
