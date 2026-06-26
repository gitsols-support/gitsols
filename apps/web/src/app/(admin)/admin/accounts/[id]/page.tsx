import { notFound } from 'next/navigation'
import { getAccount, getAccountContacts, getEngagements, getTickets } from '@/server/admin-data'
import AccountDetailClient from './AccountDetailClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const account = await getAccount(id)
  if (!account) notFound()
  const [contacts, engs, tix] = await Promise.all([
    getAccountContacts(id),
    getEngagements(),
    getTickets(),
  ])
  return (
    <AccountDetailClient
      initial={account}
      contacts={contacts}
      engagements={engs.filter((e) => e.accountId === id)}
      tickets={tix.filter((t) => t.accountId === id)}
    />
  )
}
