'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Settings,
  Activity,
  BookOpen,
  Palette,
  Briefcase,
  Inbox,
  Building2,
  Workflow,
  PackageOpen,
  Ticket,
  FileText,
  BarChart3,
  Calendar,
  GitBranch,
  Code2,
  Search,
  RadioTower,
  ShieldCheck,
  ClipboardList,
  Megaphone,
  ReceiptText,
  FileSignature,
  Tags,
  UserCog,
} from 'lucide-react'
import { cn } from '@gitsols/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string | number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'CRM',
    items: [
      { label: 'Leads', href: '/admin/leads', icon: Inbox, badge: 4 },
      { label: 'Pipeline', href: '/admin/pipeline', icon: GitBranch },
      { label: 'Accounts', href: '/admin/accounts', icon: Building2 },
      { label: 'Contacts', href: '/admin/contacts', icon: Users },
      { label: 'Activities', href: '/admin/activities', icon: Activity },
    ],
  },
  {
    label: 'Delivery',
    items: [
      { label: 'Engagements', href: '/admin/engagements', icon: Briefcase },
      { label: 'Bespoke projects', href: '/admin/bespoke', icon: Code2 },
      { label: 'Tickets', href: '/admin/tickets', icon: Ticket, badge: 12 },
      { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Growth',
    items: [{ label: 'Marketing / GHL', href: '/admin/marketing', icon: Megaphone }],
  },
  {
    label: 'Billing',
    items: [
      { label: 'Proposals', href: '/admin/proposals', icon: FileSignature },
      { label: 'Invoices', href: '/admin/invoices', icon: ReceiptText },
      { label: 'Pricing', href: '/admin/pricing', icon: Tags },
    ],
  },
  {
    label: 'NOC',
    items: [
      { label: 'Console', href: '/admin/noc', icon: RadioTower, badge: 7 },
      { label: 'Endpoints', href: '/admin/noc/endpoints', icon: ShieldCheck },
      { label: 'Configurator', href: '/admin/noc/configurator', icon: Settings },
      { label: 'Runbooks', href: '/admin/noc/runbooks', icon: ClipboardList },
    ],
  },
  {
    label: 'Library',
    items: [
      { label: 'Service catalog', href: '/admin/services', icon: PackageOpen },
      { label: 'Documents', href: '/admin/documents', icon: FileText },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'My account', href: '/admin/account', icon: UserCog },
      { label: 'Team & roles', href: '/admin/users', icon: Users },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Theme', href: '/admin/theme', icon: Palette },
      { label: 'Process', href: '/admin/process', icon: Workflow },
    ],
  },
  {
    label: 'Help',
    items: [{ label: 'Docs', href: '/admin/docs', icon: BookOpen }],
  },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onOpenDrawer?: () => void
}

export default function AdminSidebar({ collapsed, onToggle: _onToggle, onOpenDrawer }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === '/admin/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'bg-[#082F2F] text-white h-screen flex flex-col flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden border-r border-white/5',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Brand area */}
      <div className="h-16 border-b border-white/10 flex items-center justify-center px-3 flex-shrink-0">
        <Link
          href="/admin/dashboard"
          className="flex items-center justify-center min-w-0"
          aria-label="GITSOLS · Dashboard"
        >
          {collapsed ? (
            <Image
              src="/brand/brand-mark-white.png"
              alt="GITSOLS"
              width={532}
              height={659}
              priority
              className="h-9 w-auto"
            />
          ) : (
            <Image
              src="/brand/logo-white.png"
              alt="GITSOLS"
              width={2863}
              height={659}
              priority
              className="h-9 w-auto"
            />
          )}
        </Link>
      </div>

      {/* Quick view trigger */}
      {onOpenDrawer && (
        <div className="px-2 py-3 border-b border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-[3px] bg-[#0F4C4C] hover:bg-[#155E5E] border border-[#0F766E]/50 hover:border-[#0F766E] transition-colors"
            aria-label="Open quick view drawer"
          >
            <Search className="w-3.5 h-3.5 text-[#CFFAFA] flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/80 group-hover:text-white">
                  Quick view
                </span>
                <kbd className="px-1.5 py-0.5 bg-[#062524] border border-white/15 rounded-[2px] font-mono text-[9.5px] text-white/60 group-hover:text-white/85">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-hidden py-3 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#0F766E] px-3 mb-2 mt-4">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mt-3 mb-1 h-px bg-white/10 mx-1" />}

            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-[3px] transition-colors mb-0.5',
                      active
                        ? 'bg-[#0F4C4C] text-white border border-[#0F766E]/40'
                        : 'text-white/70 hover:bg-white/[0.06] hover:text-white border border-transparent',
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-[13px] font-medium truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge != null && (
                      <span className="font-mono text-[10px] bg-[#0F766E] text-white px-1.5 py-0.5 rounded-[2px] leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#0F4C4C] text-white text-[12px] rounded-[3px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity shadow-[0_8px_20px_-4px_rgba(0,0,0,0.4)] border border-[#0F766E]/40">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0F4C4C]" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
              NOC · Nominal
            </p>
          </div>
          <p className="font-mono text-[10px] text-white/40">GITSOLS Admin v0.2 · © 2026</p>
        </div>
      )}
    </aside>
  )
}
