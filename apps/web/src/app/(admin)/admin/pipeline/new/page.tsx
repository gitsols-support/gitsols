import { getAccounts } from '@/server/admin-data'
import PipelineFormClient from './PipelineFormClient'

export default async function Page() {
  const accounts = await getAccounts()
  return <PipelineFormClient accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} />
}
