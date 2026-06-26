import { STATS } from '@gitsols/constants'

interface StatRowProps {
  tone?: 'light' | 'dark'
  /** Render as a header strip (no top border, used as hero bottom rail). */
  header?: boolean
}

/**
 * Editorial stat rail — large serif numerals, brass hairline accents, vertical
 * dividers between cells. Works on cream and on deep teal.
 */
export default function StatRow({ tone = 'light', header = false }: StatRowProps) {
  const isDark = tone === 'dark'

  const wrapperBorder = isDark
    ? `${header ? '' : 'border-y'} border-white/10`
    : `${header ? '' : 'border-y'} border-[#D5E0DE]`

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 ${wrapperBorder}`}>
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className={`relative px-6 py-8 ${
            isDark
              ? 'lg:border-r lg:border-white/10 lg:last:border-r-0 border-b border-white/10 lg:border-b-0'
              : 'lg:border-r lg:border-[#D5E0DE] lg:last:border-r-0 border-b border-[#D5E0DE] lg:border-b-0'
          } ${i >= 2 ? 'border-b-0' : ''}`}
        >
          {/* Index marker */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                isDark ? 'text-[#0F766E]' : 'text-[#0F4C4C]'
              }`}
            >
              0{i + 1}
            </span>
            <span
              className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-[#D5E0DE]'}`}
              aria-hidden
            />
          </div>

          <p
            className={`font-serif text-[44px] sm:text-[52px] leading-[0.95] tracking-[-0.022em] ${
              isDark ? 'text-white' : 'text-[#0F4C4C]'
            }`}
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {s.value}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`h-px w-6 ${isDark ? 'bg-[#0F766E]' : 'bg-[#0F766E]'}`}
              aria-hidden
            />
            <p
              className={`font-mono text-[10.5px] uppercase tracking-[0.22em] ${
                isDark ? 'text-white/60' : 'text-[#5F6E6D]'
              }`}
            >
              {s.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
