import Link from 'next/link'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import type { Industry } from '@gitsols/constants'

interface IndustryCardProps {
  industry: Industry
  icon: LucideIcon
  /** Optional sequence number for editorial cap. */
  index?: number
}

export default function IndustryCard({ industry, icon: Icon, index }: IndustryCardProps) {
  const padded = index != null ? String(index).padStart(2, '0') : null
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="group relative block bg-white rounded-[4px] border border-[#D5E0DE] hover:border-[#0F4C4C]/40 hover:shadow-[0_24px_40px_-20px_rgba(8,47,47,0.18)] transition-all overflow-hidden h-full"
    >
      {/* Brass top hairline */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40 group-hover:bg-[#0F766E] transition-colors" />

      <div className="p-7 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0F4C4C]">
            {padded ? `№ ${padded} · ` : ''}Vertical
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
          {industry.name}
        </h3>
        <p
          className="mt-2 font-serif italic text-[14px] text-[#0F4C4C]/70"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {industry.tagline}
        </p>
        <p className="mt-4 text-[13.5px] text-[#5F6E6D] leading-relaxed flex-1">
          {industry.summary}
        </p>

        <div className="mt-6 pt-4 border-t border-[#E5EDEB] flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#0F4C4C]/70">
            View dossier
          </span>
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-[#0F4C4C]">→</span>
        </div>
      </div>
    </Link>
  )
}
