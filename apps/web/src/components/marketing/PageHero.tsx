// Reusable dark-teal hero used at the top of every marketing page.
//
// Background recipe is the same as `AuthShell` (admin sign-in panel) — base
// gradient + radial overlay + 32px grid pattern — so every public page
// opens with the same authoritative deep-teal masthead.
//
// Use `size="lg"` only on the home page; interior pages use `size="md"` for
// a tighter masthead that doesn't dominate the fold.

import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import NetworkBackground from './NetworkBackground'

interface PageHeroProps {
  /** Mono-style brass eyebrow line. */
  eyebrow?: string
  /** Headline — supports `<br/>` and inline highlights via children. */
  title: ReactNode
  /** One-line subtitle / lede. */
  subtitle?: ReactNode
  /** Optional CTA row (typically 1–2 `<Link>` buttons). */
  cta?: ReactNode
  /** Optional bottom trust strip — short inline items. */
  trust?: { label: string }[]
  /** Optional right-rail slot (small card, stat, etc.). */
  aside?: ReactNode
  /**
   * Vertical density:
   *   sm — terms / privacy
   *   md — services / industries / process / contact (default)
   *   lg — home (used by app/(marketing)/page.tsx directly, not via this)
   */
  size?: 'sm' | 'md' | 'lg'
  /** Optional breadcrumb / back link, rendered above the eyebrow. */
  breadcrumb?: ReactNode
}

const PADDING = {
  sm: 'py-14 sm:py-16',
  md: 'py-20 sm:py-24',
  lg: 'py-24 sm:py-28',
} as const

const TITLE_SIZE = {
  sm: 'clamp(1.875rem, 4vw, 2.75rem)',
  md: 'clamp(2.25rem, 5vw, 3.75rem)',
  lg: 'clamp(2.5rem, 6vw, 4.75rem)',
} as const

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  cta,
  trust,
  aside,
  size = 'md',
  breadcrumb,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0F4C4C] text-white">
      {/* Base gradient — same recipe as AuthShell */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C4C] via-[#0A3A3A] to-[#070F2C]" />
      {/* Radial accent washes */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #155E5E 0%, transparent 40%), radial-gradient(circle at 80% 70%, #14B8A6 0%, transparent 35%)',
        }}
        aria-hidden
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />
      {/* Subtle network — only on md/lg sizes so the sm hero stays clean */}
      {size !== 'sm' && (
        <NetworkBackground
          tone="dark"
          className="absolute inset-0 w-full h-full opacity-[0.35] pointer-events-none"
        />
      )}

      <div className={`relative max-w-7xl mx-auto px-6 ${PADDING[size]}`}>
        <div className={aside ? 'grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-end' : ''}>
          <div className={aside ? 'lg:col-span-8' : 'max-w-3xl'}>
            {breadcrumb && <div className="mb-6">{breadcrumb}</div>}
            {eyebrow && (
              <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#14B8A6]">
                {eyebrow}
              </p>
            )}
            <h1
              className={eyebrow || breadcrumb ? 'mt-5' : ''}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: TITLE_SIZE[size],
                fontWeight: 600,
                letterSpacing: '-0.026em',
                lineHeight: 1.04,
                color: 'white',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-6 text-[15px] sm:text-[16px] text-white/65 leading-[1.6] max-w-2xl">
                {subtitle}
              </p>
            )}
            {cta && <div className="mt-8 flex flex-wrap items-center gap-3">{cta}</div>}
            {trust && trust.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-white/55">
                {trust.map((t) => (
                  <span key={t.label} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {aside && (
            <aside className="lg:col-span-4 lg:pl-6 lg:border-l border-white/10">
              {aside}
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}
