import { getAccounts, getEngagements, getServicesCatalog } from '@/server/admin-data'
import BillingFormClient from '@/components/admin/BillingFormClient'

export const metadata = { title: 'New invoice · Admin' }

export default async function Page() {
  const [accounts, engagements, services] = await Promise.all([
    getAccounts(),
    getEngagements(),
    getServicesCatalog(),
  ])
  return (
    <BillingFormClient
      kind="invoice"
      accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
      engagements={engagements.map((e) => ({ id: e.id, name: e.name, accountId: e.accountId }))}
      services={services}
    />
  )
}
