import Link from 'next/link'
import type { Route } from 'next'
import { ArrowUpRight } from 'lucide-react'
import SectionLabel from './SectionLabel'
import Monogram from './Monogram'
import { COMPANY } from '@gitsols/constants'

interface CtaProps {
  /** Override the eyebrow above the heading. */
  label?: string
  /** Headline — supports a line break with <br/>. */
  heading: React.ReactNode
  /** Body copy under the heading. */
  body?: React.ReactNode
  /** Primary CTA — defaults to the Free IT Audit page. */
  primaryHref?: string
  primaryLabel?: string
  /** Show the call button next to the primary CTA. */
  showPhone?: boolean
}

/**
 * Editorial closing CTA — deep teal with brass accents, monogram in the
 * background, signature line. Used at the bottom of every marketing page.
 */
export default function Cta({
  label = 'Next step',
  heading,
  body,
  primaryHref = '/free-it-audit',
  primaryLabel = 'Request an IT audit',
  showPhone = true,
}: CtaProps) {
  return (
    <section className="relative bg-[#082F2F] text-white overflow-hidden">
      {/* Brass top rule */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#0F766E] to-transparent" />

      {/* Decorative grid */}
      <div className="absolute inset-0 bg-grid-dark opacity-[0.4] pointer-events-none" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 100%, rgba(20,184,166,0.12) 0%, transparent 40%), radial-gradient(circle at 90% 0%, rgba(15,118,110,0.10) 0%, transparent 40%)',
        }}
      />

      {/* Oversized monogram watermark */}
      <div
        className="absolute -right-12 -bottom-20 font-serif text-[420px] leading-none text-white/[0.025] select-none pointer-events-none"
        style={{ fontFamily: 'var(--font-serif)' }}
        aria-hidden="true"
      >
        G
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <SectionLabel tone="dark" rule>{label}</SectionLabel>
            <h2
              className="mt-5 font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.04] tracking-[-0.018em]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {heading}
            </h2>
            {body && (
              <p className="mt-6 text-[15px] text-white/65 max-w-xl leading-relaxed">{body}</p>
            )}

            {/* Signature row */}
            <div className="mt-10 flex items-center gap-4">
              <Monogram size="md" tone="brass" />
              <div className="flex flex-col leading-tight">
                <span
                  className="font-serif text-[15px] text-white/85"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  The GITSOLS team
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E] mt-1">
                  New Jersey · 24/7 Operations
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <Link
              href={primaryHref as Route}
              className="group inline-flex items-center justify-between gap-2 bg-[#0F766E] hover:bg-[#CFFAFA] text-[#082F2F] text-[13.5px] font-semibold px-6 py-4 rounded-[3px] transition-colors"
            >
              <span>{primaryLabel}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            {showPhone && (
              <a
                href={`tel:${COMPANY.phoneE164}`}
                className="inline-flex items-center justify-between gap-2 border border-white/20 hover:border-[#0F766E] hover:bg-white/[0.03] text-white text-[13.5px] font-semibold px-6 py-4 rounded-[3px] transition-colors"
              >
                <span>Call {COMPANY.phone}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0F766E]">24/7</span>
              </a>
            )}
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mt-2">
              Response · within 1 business day
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
