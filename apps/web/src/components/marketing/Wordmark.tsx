import Image from 'next/image'

type Tone = 'light' | 'dark'

// The full lockup at /public/brand/logo{,-white}.png is 2863×659 — wide
// horizontal arrangement of the shield + "GITSOLS" + "Guardian IT Solutions
// & Services" tagline. We render at the height the consumer asks for and
// derive the width from the file aspect ratio.
const LOGO_RATIO = 2863 / 659

interface WordmarkProps {
  tone?: Tone
  /** Rendered height in px (the lockup width is derived from the ratio). */
  height?: number
  className?: string
  /** Optional caller-supplied accessible name. */
  title?: string
}

/**
 * Full GITSOLS lockup — uses the actual logo PNG.
 * `tone="light"` for cream/white backgrounds; `tone="dark"` for deep teal.
 */
export default function Wordmark({
  tone = 'light',
  height = 36,
  className = '',
  title = 'GITSOLS — Guardian IT Solutions',
}: WordmarkProps) {
  const width = Math.round(height * LOGO_RATIO)
  const src = tone === 'dark' ? '/brand/logo-white.png' : '/brand/logo.png'

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ height, width }}
    >
      <Image
        src={src}
        alt={title}
        width={width}
        height={height}
        priority
        sizes={`${width}px`}
        className="block w-full h-full object-contain"
      />
    </span>
  )
}
