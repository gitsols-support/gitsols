import { SessionProvider } from 'next-auth/react'
import AdminLayoutClient from '@/components/layout/AdminLayoutClient'

// Every admin page fetches per-request data with the signed-in user's JWT
// (via headers()), so the whole group is dynamic — never statically prerendered.
export const dynamic = 'force-dynamic'

/**
 * Layout for the (admin) route group — wraps every authenticated admin page
 * in a SessionProvider so `useSession()` works in client components inside
 * the shell. Public pages (`/`, `/admin` sign-in) intentionally do not get
 * a session context.
 */
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </SessionProvider>
  )
}
