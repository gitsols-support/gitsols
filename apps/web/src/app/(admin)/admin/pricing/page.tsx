import type { Metadata } from 'next'
import { getServicesCatalog } from '@/server/admin-data'
import PricingConfiguratorClient from './PricingConfiguratorClient'

export const metadata: Metadata = { title: 'Pricing · Admin' }

export default async function Page() {
  const services = await getServicesCatalog()
  return <PricingConfiguratorClient services={services} />
}
