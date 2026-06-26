interface SectionLabelProps {
  children: React.ReactNode
  /** Optional accent — useful for over-dark backgrounds. */
  tone?: 'light' | 'dark'
  /** Show a roman numeral marker (I. II. III. ...) before the label. */
  numeral?: number
  /** Show a leading hairline rule. */
  rule?: boolean
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/**
 * Editorial section eyebrow — monospace, brass-toned, optional roman numeral
 * marker and leading rule for newspaper-style section heads.
 */
export default function SectionLabel({
  children,
  tone = 'light',
  numeral,
  rule = false,
}: SectionLabelProps) {
  const color = tone === 'dark' ? 'text-[#0F766E]' : 'text-[#0F4C4C]'
  const ruleColor = tone === 'dark' ? 'bg-[#0F766E]/50' : 'bg-[#0F766E]/70'

  return (
    <div className="inline-flex items-center gap-3">
      {rule && <span className={`block w-8 h-px ${ruleColor}`} aria-hidden="true" />}
      {numeral != null && numeral > 0 && (
        <span
          className={`font-serif italic text-[15px] leading-none ${color}`}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {ROMAN[numeral] ?? numeral}.
        </span>
      )}
      <p
        className={`font-mono text-[11px] font-medium uppercase tracking-[0.22em] ${color}`}
      >
        {children}
      </p>
    </div>
  )
}
