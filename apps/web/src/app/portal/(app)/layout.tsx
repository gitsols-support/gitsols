import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import PortalShell from '@/components/portal/PortalShell'

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/portal')
  return <PortalShell user={{ name: session.user.name, email: session.user.email }}>{children}</PortalShell>
}
