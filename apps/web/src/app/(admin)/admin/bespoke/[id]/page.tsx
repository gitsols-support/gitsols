import { notFound } from 'next/navigation'
import { getBespokeProject } from '@/server/admin-data'
import BespokeDetailClient from './BespokeDetailClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getBespokeProject(id)
  if (!data) notFound()
  return <BespokeDetailClient initial={data} />
}
