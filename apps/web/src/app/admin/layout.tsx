import type { Metadata } from 'next'

// Server-side metadata for the /admin sign-in route. Lives in a tiny layout
// because the page itself is `'use client'` (forms with state) and Next does
// not allow `metadata` exports from client components.
export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the admin.',
}

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
