'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Bell, Activity, TrendingUp, LogOut,
  User, Settings, HelpCircle, ChevronDown, Shield,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { cn, titleCase } from '@gitsols/utils'
import NocBell from './NocBell'

export type RightPanelType = 'notifications' | 'activity' | 'stats' | null

interface AdminTopBarProps {
  onIconClick: (type: RightPanelType) => void
  activePanelType: RightPanelType
  sidebarCollapsed: boolean
  onSidebarToggle: () => void
}

const RIGHT_ICONS: { type: RightPanelType; icon: React.ElementType; badge?: number }[] = [
  { type: 'notifications', icon: Bell, badge: 2 },
  { type: 'activity', icon: Activity },
  { type: 'stats', icon: TrendingUp },
]

// ─── Profile dropdown ─────────────────────────────────────────────────────────

const PROFILE_MENU = [
  { icon: User, label: 'My Profile', href: '#' },
  { icon: Shield, label: 'Security', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
  { icon: HelpCircle, label: 'Help & Docs', href: '#' },
]

function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-colors',
          open ? 'bg-[#ECFEFE]' : 'hover:bg-gray-100',
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-[#0F4C4C] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">A</span>
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-xs font-semibold text-gray-800 leading-tight">Admin</p>
          <p className="text-[10px] text-gray-400 leading-tight">admin@example.com</p>
        </div>
        <ChevronDown
          className={cn(
            'w-3 h-3 text-gray-400 transition-transform hidden sm:block',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-[#E2E8E8] shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 pt-4 pb-3 bg-[#F8FAFA] border-b border-[#E2E8E8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F4C4C] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                <span className="inline-flex items-center gap-1 mt-1 bg-[#0F4C4C] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  <Shield className="w-2.5 h-2.5" />
                  Admin
                </span>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            {PROFILE_MENU.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                </div>
                {label}
              </Link>
            ))}
          </div>

          <div className="px-1.5 pb-1.5">
            <div className="h-px bg-[#E2E8E8] mb-1.5" />
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </div>
              Sign out
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

export default function AdminTopBar({
  onIconClick,
  activePanelType,
  sidebarCollapsed,
  onSidebarToggle,
}: AdminTopBarProps) {
  const pathname = usePathname()

  const getTitle = () => {
    if (!pathname) return 'Dashboard'
    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    if (!last || last === 'admin') return 'Dashboard'
    return titleCase(last)
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left — collapse toggle + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onSidebarToggle}
          className="w-8 h-8 rounded-[3px] text-gray-500 hover:text-[#0F4C4C] hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
        <span className="block w-px h-5 bg-gray-200" aria-hidden />
        <h1 className="text-sm font-semibold text-gray-800 tracking-wide flex-shrink-0">
          {getTitle()}
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {/* NOC bell — own dropdown, sits to the left of the panel icons */}
        <NocBell />
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Panel icon buttons */}
        {RIGHT_ICONS.map(({ type, icon: Icon, badge }) => (
          <button
            key={type}
            onClick={() => onIconClick(activePanelType === type ? null : type)}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors',
              activePanelType === type
                ? 'bg-[#0F4C4C] text-white'
                : 'text-gray-500 hover:bg-gray-100',
            )}
            aria-label={type ?? undefined}
          >
            <Icon className="w-4 h-4" />
            {badge && activePanelType !== type && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#14B8A6] text-white text-[9px] font-bold flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Profile dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  )
}
