import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Service } from '@gitsols/constants'
import { getServiceIcon } from './service-icons'

interface ServiceCardProps {
  service: Service
  /** Layout density. */
  variant?: 'compact' | 'wide'
  /** Featured variant — heavier, dark editorial treatment. */
  featured?: boolean
  /** Optional sequence number — adds an editorial cap to the corner. */
  index?: number
}

/**
 * Editorial service card — paper white with a brass top hairline, monospace
 * category cap, serif title. Featured variant is dark teal with brass details.
 */
export default function ServiceCard({
  service,
  variant = 'wide',
  featured = false,
  index,
}: ServiceCardProps) {
  const Icon = getServiceIcon(service.slug)
  const padded = index != null ? String(index).padStart(2, '0') : null

  if (featured) {
    return (
      <Link
        href={`/services/${service.slug}`}
        className="group relative block rounded-[4px] overflow-hidden text-white h-full"
      >
        {/* Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C4C] via-[#0A3A3A] to-[#082F2F] group-hover:from-[#155E5E] group-hover:via-[#0F4C4C] group-hover:to-[#0A3A3A] transition-colors" />
        {/* Brass top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0F766E] via-[#CFFAFA] to-[#0F766E]" />
        {/* Grid texture */}
        <div className="absolute inset-0 bg-grid-dark opacity-50 pointer-events-none" aria-hidden="true" />
        {/* Big watermark numeral */}
        {padded && (
          <span
            className="absolute -right-2 -bottom-6 font-serif text-[200px] leading-none text-white/[0.045] select-none"
            style={{ fontFamily: 'var(--font-serif)' }}
            aria-hidden="true"
          >
            {padded}
          </span>
        )}

        <div className="relative p-8 h-full flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {padded && (
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]"
                >
                  №&nbsp;{padded}
                </span>
              )}
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                {service.category}
              </span>
            </div>
            <ArrowUpRight className="w-5 h-5 text-[#0F766E] mt-0.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>

          <div className="mt-6 w-12 h-12 rounded-[3px] bg-white/[0.06] border border-white/[0.12] flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-6 h-6 text-[#0F766E]" />
          </div>

          <h3
            className="mt-8 font-serif text-[26px] leading-[1.08] tracking-[-0.012em]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {service.name}
          </h3>
          <p className="mt-3 font-serif italic text-[15px] text-[#CFFAFA]" style={{ fontFamily: 'var(--font-serif)' }}>
            {service.tagline}
          </p>
          <p className="mt-5 text-[14px] text-white/65 leading-relaxed flex-1">
            {service.summary}
          </p>

          <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F766E]">
              Read engagement note
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative block bg-white rounded-[4px] border border-[#D5E0DE] hover:border-[#0F4C4C]/40 hover:shadow-[0_24px_40px_-20px_rgba(8,47,47,0.18)] transition-all overflow-hidden h-full"
    >
      {/* Brass top hairline */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40 group-hover:bg-[#0F766E] transition-colors" />

      <div className="p-7 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
            {padded ? `№ ${padded} · ` : ''}{service.category}
          </span>
          <ArrowUpRight className="w-4 h-4 text-[#0F4C4C] group-hover:text-[#0F4C4C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        <div className="mt-5 w-11 h-11 rounded-[3px] bg-[#F4F8F7] border border-[#D5E0DE] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#0F4C4C]" />
        </div>

        <h3
          className="mt-5 font-serif text-[22px] leading-[1.12] text-[#0F4C4C] tracking-[-0.01em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {service.name}
        </h3>
        <p
          className="mt-2 font-serif italic text-[14px] text-[#0F4C4C]/70"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {service.tagline}
        </p>
        <p
          className={`mt-4 text-[13.5px] text-[#5F6E6D] leading-relaxed flex-1 ${
            variant === 'compact' ? 'line-clamp-3' : ''
          }`}
        >
          {service.summary}
        </p>
      </div>
    </Link>
  )
}
