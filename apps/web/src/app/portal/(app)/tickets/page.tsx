import { getPortalTickets } from '@/server/portal-data'
import TicketsClient from './TicketsClient'

export const metadata = { title: 'Support · Client portal' }

export default async function Page() {
  const tickets = await getPortalTickets()
  return <TicketsClient initialTickets={tickets} />
}
