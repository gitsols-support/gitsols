import { getAccounts } from '@/server/admin-data'
import UserFormClient from './UserFormClient'

export const metadata = { title: 'New user · Admin' }

export default async function Page() {
  const accounts = await getAccounts()
  return <UserFormClient accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} />
}
