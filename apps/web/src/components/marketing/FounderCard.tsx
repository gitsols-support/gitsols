import Link from 'next/link'
import { ArrowUpRight, Phone } from 'lucide-react'
import { COMPANY } from '@gitsols/constants'
import Monogram from './Monogram'

/**
 * Editorial founder card — letterpress feel. Brass top rule, oversized "G"
 * watermark, serif blockquote, monogram seal next to a signature line.
 */
export default function FounderCard() {
  return (
    <div className="relative bg-[#082F2F] text-white rounded-[4px] overflow-hidden">
      {/* Brass top rule */}
      <div className="h-[2px] bg-gradient-to-r from-[#0F766E] via-[#CFFAFA] to-[#0F766E]" />

      {/* Dot grid texture */}
      <div className="absolute inset-0 bg-grid-dark opacity-50 pointer-events-none" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 0% 100%, rgba(20,184,166,0.14) 0%, transparent 45%), radial-gradient(circle at 100% 0%, rgba(15,118,110,0.10) 0%, transparent 40%)',
        }}
      />

      {/* Oversized watermark "SA" */}
      <div
        className="absolute -right-6 -bottom-16 font-serif text-[340px] leading-none text-white/[0.035] select-none pointer-events-none"
        style={{ fontFamily: 'var(--font-serif)' }}
        aria-hidden
      >
        SA
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-10 p-10 sm:p-12 lg:p-14">
        {/* Identity column */}
        <div className="lg:col-span-2 flex flex-col items-start">
          {/* Seal */}
          <div className="flex items-center gap-3 mb-6">
            <Monogram size="md" tone="brass" />
            <div className="flex flex-col leading-none">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
                The Founder
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 mt-1">
                Letter № 1
              </span>
            </div>
          </div>

          {/* Avatar plate */}
          <div className="relative w-36 h-44 rounded-[3px] bg-white/[0.04] border border-white/15 flex items-center justify-center">
            <span
              className="font-serif text-7xl text-[#0F766E] tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              SA
            </span>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-[3px] bg-[#0F766E] flex items-center justify-center shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#082F2F]">
                NJ
              </span>
            </div>
          </div>

          <h3
            className="mt-8 font-serif text-3xl leading-tight tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {COMPANY.founder}
          </h3>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F766E]">
            Founder & Principal Engineer
          </p>

          <ul className="mt-6 space-y-2 text-[12.5px] text-white/65 list-rule">
            <li>Microsoft Azure architect, 14 yrs</li>
            <li>HIPAA / SOC 2 / NIST CSF program design</li>
            <li>Multi-location practice modernization</li>
            <li>Still picks up the phone for client escalations</li>
          </ul>
        </div>

        {/* Letter column */}
        <div className="lg:col-span-3 flex flex-col">
          <span
            className="font-serif text-7xl text-[#0F766E]/40 leading-none -mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}
            aria-hidden
          >
            &ldquo;
          </span>
          <blockquote
            className="font-serif text-[26px] sm:text-[30px] leading-[1.22] text-white tracking-[-0.01em]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            We started GITSOLS to bring enterprise-grade discipline —
            proactive monitoring, audit-ready evidence, real engineering —
            to the practices and firms that had been told they couldn&apos;t
            afford it.
          </blockquote>

          <p
            className="mt-6 font-serif italic text-[15px] text-white/55"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            That is still the deal, twenty-five years on.
          </p>

          {/* Signature row */}
          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span
                className="font-serif text-[28px] italic text-[#0F766E] tracking-[-0.03em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                S. Akram
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                · NJ · {COMPANY.founded}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-1.5 bg-[#0F766E] hover:bg-[#CFFAFA] text-[#082F2F] text-[12.5px] font-semibold px-4 py-2.5 rounded-[3px] transition-colors"
              >
                Reach the team
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <a
                href={`tel:${COMPANY.phoneE164}`}
                className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-white border border-white/20 hover:border-[#0F766E] hover:bg-white/[0.03] px-4 py-2.5 rounded-[3px] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
