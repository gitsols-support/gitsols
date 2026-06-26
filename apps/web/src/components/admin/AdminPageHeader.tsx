import Link from 'next/link'
import type { Route } from 'next'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: Route
}

interface AdminPageHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  /** Optional summary stats row that renders to the right. */
  stats?: { label: string; value: string | number; hint?: string }[]
  /** Optional primary action (Link). */
  primaryAction?: { label: string; href: Route; icon?: LucideIcon }
  /** Optional secondary action. */
  secondaryAction?: { label: string; href: Route }
  /** Status badge rendered next to title. */
  badge?: { label: string; tone?: 'default' | 'live' | 'warn' | 'muted' }
}

/**
 * Editorial admin page header — consistent across every internal page.
 * Brass top hairline · breadcrumbs · serif title · stat rail · primary action.
 */
export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  stats,
  primaryAction,
  secondaryAction,
  badge,
}: AdminPageHeaderProps) {
  return (
    <header className="relative bg-white border border-[#D5E0DE] rounded-[4px] overflow-hidden mb-6">
      {/* Brass top rule */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0F766E] via-[#0F4C4C] to-[#0F766E]" />

      <div className="p-6 lg:p-7">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5F6E6D] mb-5">
            {breadcrumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {c.href ? (
                  <Link href={c.href} className="hover:text-[#0F4C4C]">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-[#0F4C4C]">{c.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span className="text-[#D5E0DE]">/</span>}
              </span>
            ))}
          </nav>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            {eyebrow && (
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="block w-6 h-px bg-[#0F766E]" aria-hidden />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#0F766E]">
                  {eyebrow}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="font-serif text-[#0F4C4C] leading-[1.04] tracking-[-0.018em]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.875rem, 3vw, 2.5rem)' }}
              >
                {title}
              </h1>
              {badge && <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>}
            </div>

            {description && (
              <p className="mt-3 text-[14px] text-[#5F6E6D] leading-relaxed max-w-2xl">
                {description}
              </p>
            )}

            {(primaryAction || secondaryAction) && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {primaryAction && (
                  <Link
                    href={primaryAction.href}
                    className="group inline-flex items-center gap-1.5 bg-[#0F4C4C] hover:bg-[#082F2F] text-white text-[12.5px] font-semibold px-4 py-2.5 rounded-[3px] transition-colors border border-[#082F2F] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  >
                    {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
                    {primaryAction.label}
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                )}
                {secondaryAction && (
                  <Link
                    href={secondaryAction.href}
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F4C4C] border border-[#D5E0DE] bg-white hover:border-[#0F4C4C]/40 px-4 py-2.5 rounded-[3px] transition-colors"
                  >
                    {secondaryAction.label}
                  </Link>
                )}
              </div>
            )}
          </div>

          {stats && stats.length > 0 && (
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-px bg-[#D5E0DE] border border-[#D5E0DE] rounded-[3px] overflow-hidden">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white px-4 py-3">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#5F6E6D]">
                      {s.label}
                    </p>
                    <p
                      className="mt-1 font-serif text-[24px] text-[#0F4C4C] leading-none tracking-[-0.015em]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {s.value}
                    </p>
                    {s.hint && (
                      <p className="font-mono text-[9.5px] text-[#0F766E] mt-1 uppercase tracking-[0.12em]">
                        {s.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function StatusBadge({
  tone = 'default',
  children,
}: {
  tone?: 'default' | 'live' | 'warn' | 'muted'
  children: React.ReactNode
}) {
  const tones: Record<string, string> = {
    default: 'bg-[#ECFEFE] text-[#0F4C4C] border-[#CFFAFA]',
    live: 'bg-[#0F4C4C] text-white border-[#0F766E]',
    warn: 'bg-[#FAEFD4] text-[#7A5A1F] border-[#E8D4A0]',
    muted: 'bg-[#F4F8F7] text-[#5F6E6D] border-[#D5E0DE]',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-[3px] border ${tones[tone] ?? tones.default}`}
    >
      {tone === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" aria-hidden />
      )}
      {children}
    </span>
  )
}
