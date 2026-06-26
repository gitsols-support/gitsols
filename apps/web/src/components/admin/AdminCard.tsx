import type React from 'react'

interface AdminCardProps {
  title?: React.ReactNode
  eyebrow?: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  /** Remove inner padding (for tables that paint their own). */
  flush?: boolean
  className?: string
}

/**
 * Editorial admin card — brass top hairline, monospace eyebrow, serif title.
 */
export default function AdminCard({
  title,
  eyebrow,
  description,
  action,
  children,
  flush = false,
  className = '',
}: AdminCardProps) {
  return (
    <section
      className={`relative bg-white border border-[#D5E0DE] rounded-[4px] overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0F766E]/40" />
      {(title || eyebrow || action) && (
        <div
          className={`flex items-start justify-between gap-4 flex-wrap ${
            flush ? 'px-6 py-5 border-b border-[#D5E0DE]' : 'p-6 pb-4'
          }`}
        >
          <div>
            {eyebrow && (
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#0F766E] mb-2">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className="font-serif text-[20px] text-[#0F4C4C] leading-tight tracking-[-0.01em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1.5 text-[13px] text-[#5F6E6D] leading-relaxed">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={flush ? '' : 'px-6 pb-6'}>{children}</div>
    </section>
  )
}
