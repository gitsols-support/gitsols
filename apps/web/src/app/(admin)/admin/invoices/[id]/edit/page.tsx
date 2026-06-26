import { notFound } from 'next/navigation'
import { getInvoice, getAccounts, getEngagements, getServicesCatalog } from '@/server/admin-data'
import BillingFormClient from '@/components/admin/BillingFormClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [invoice, accounts, engagements, services] = await Promise.all([
    getInvoice(id),
    getAccounts(),
    getEngagements(),
    getServicesCatalog(),
  ])
  if (!invoice) notFound()
  return (
    <BillingFormClient
      kind="invoice"
      initial={invoice}
      accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
      engagements={engagements.map((e) => ({ id: e.id, name: e.name, accountId: e.accountId }))}
      services={services}
    />
  )
}
