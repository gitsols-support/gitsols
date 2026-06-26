import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client portal sign in',
  description: 'Sign in to your GITSOLS client portal.',
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
