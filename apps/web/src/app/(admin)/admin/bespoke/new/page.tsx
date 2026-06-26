import { getAccounts } from '@/server/admin-data'
import BespokeFormClient from './BespokeFormClient'

export default async function Page() {
  const accounts = await getAccounts()
  return <BespokeFormClient accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} />
}
