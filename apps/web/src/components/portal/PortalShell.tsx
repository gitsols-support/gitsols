'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Briefcase,
  ReceiptText,
  LifeBuoy,
  FileText,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { cn } from '@gitsols/utils'

const NAV = [
  { label: 'Overview', href: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/portal/engagements', icon: Briefcase },
  { label: 'Invoices', href: '/portal/invoices', icon: ReceiptText },
  { label: 'Support', href: '/portal/tickets', icon: LifeBuoy },
  { label: 'Documents', href: '/portal/documents', icon: FileText },
  { label: 'Monitoring', href: '/portal/noc', icon: ShieldCheck },
]

export default function PortalShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: { name?: string | null; email?: string | null }
}) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-[#F8FAFA]">
      <header className="bg-white border-b border-[#D5E0DE]">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[18px] font-bold text-[#0F4C4C]" style={{ fontFamily: 'var(--font-serif)' }}>
              gitsols
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#0F766E] border border-[#CFFAFA] bg-[#ECFEFE] px-1.5 py-0.5 rounded">
              Client portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-[#5F6E6D] hidden sm:block">{user.name ?? user.email}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/portal' })}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-mono uppercase tracking-[0.12em] text-[#5F6E6D] hover:text-[#0F4C4C]"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
        <nav className="max-w-[1400px] mx-auto px-6 flex items-center gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                  active
                    ? 'border-[#0F766E] text-[#0F4C4C]'
                    : 'border-transparent text-[#5F6E6D] hover:text-[#0F4C4C]',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
