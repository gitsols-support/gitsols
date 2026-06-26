import { getAccounts } from '@/server/admin-data'
import EngagementFormClient from './EngagementFormClient'

export default async function Page() {
  const accounts = await getAccounts()
  return <EngagementFormClient accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} />
}
