import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTicket } from '@/server/admin-data'
import TicketDetailClient from './TicketDetailClient'

export const metadata: Metadata = { title: 'Ticket · Admin' }

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const ticket = await getTicket(id)
  if (!ticket) notFound()
  return <TicketDetailClient initial={ticket} />
}
