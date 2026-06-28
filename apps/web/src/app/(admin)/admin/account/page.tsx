import type { Metadata } from 'next'
import AccountSecurityClient from './AccountSecurityClient'

export const metadata: Metadata = { title: 'Account · Admin' }

export default function Page() {
  return <AccountSecurityClient />
}
