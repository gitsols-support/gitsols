import { notFound } from 'next/navigation'
import { getInvoice } from '@/server/admin-data'
import BillingDetailClient from '@/components/admin/BillingDetailClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) notFound()
  return <BillingDetailClient kind="invoice" doc={invoice} />
}
