import { notFound } from 'next/navigation'
import { getProposal, getAccounts, getEngagements, getServicesCatalog } from '@/server/admin-data'
import BillingFormClient from '@/components/admin/BillingFormClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [proposal, accounts, engagements, services] = await Promise.all([
    getProposal(id),
    getAccounts(),
    getEngagements(),
    getServicesCatalog(),
  ])
  if (!proposal) notFound()
  return (
    <BillingFormClient
      kind="proposal"
      initial={proposal}
      accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
      engagements={engagements.map((e) => ({ id: e.id, name: e.name, accountId: e.accountId }))}
      services={services}
    />
  )
}
