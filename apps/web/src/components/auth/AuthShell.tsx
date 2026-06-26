'use client'

import { ShieldCheck, Lock, Globe2, Activity } from 'lucide-react'
import Wordmark from '@/components/marketing/Wordmark'

interface AuthShellProps {
  children: React.ReactNode
  brandTagline?: string
  brandLabel?: string
  mobileTitle?: string
  mobileBadge?: string
  footerText?: string
}

const TRUST_POINTS = [
  { icon: Lock, label: 'End-to-end encrypted (AES-256 / TLS 1.3)' },
  { icon: Globe2, label: 'HIPAA-aware infrastructure, NJ-hosted' },
  { icon: ShieldCheck, label: 'MFA-enforced, audit-logged access' },
  { icon: Activity, label: '24/7 monitoring by the GITSOLS NOC' },
]

/**
 * Split-panel auth shell — teal gradient brand panel on the left, white form
 * panel on the right. Used by the sign-in page (and any post-login auth
 * flows like MFA verify, recovery, etc.) to give every credentialed surface
 * a consistent feel.
 */
export default function AuthShell({
  children,
  brandTagline = 'Sign in to manage clients, engagements, milestones, and tickets across the GITSOLS book of business.',
  brandLabel = 'Gitsols Admin · Restricted access',
  mobileTitle = 'Gitsols',
  mobileBadge = 'Restricted',
  footerText = 'This is a private GITSOLS system. All access is logged and monitored.',
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex bg-[#0F4C4C] text-white">
      {/* ── Left brand panel (hidden on mobile) ── */}
      <aside className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C4C] via-[#0A3A3A] to-[#070F2C]" />
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #155E5E 0%, transparent 40%), radial-gradient(circle at 80% 70%, #14B8A6 0%, transparent 35%)',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Wordmark tone="dark" height={44} />
            <p className="text-[10px] text-white/50 uppercase tracking-[0.18em] mt-3">
              {brandLabel}
            </p>
          </div>

          <div className="space-y-7">
            <div>
              <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
                Run the book,
                <br />
                not the inbox.
              </h1>
              <p className="mt-4 text-white/60 text-sm max-w-md leading-relaxed">{brandTagline}</p>
            </div>

            <div className="space-y-3 pt-2">
              {TRUST_POINTS.map((point) => {
                const Icon = point.icon
                return (
                  <div key={point.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <span className="text-xs text-white/70">{point.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>© 2026 GITSOLS LLC · Restricted system</span>
            <span className="font-mono">v0.2</span>
          </div>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Mobile-only top bar */}
        <div className="lg:hidden h-14 px-5 flex items-center justify-between border-b border-gray-100">
          <Wordmark tone="light" height={28} title={mobileTitle} />
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
            {mobileBadge}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-fade-in">{children}</div>
        </div>

        <footer className="px-6 sm:px-10 pb-6 text-[10px] text-gray-400">{footerText}</footer>
      </main>
    </div>
  )
}
