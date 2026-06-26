import Image from 'next/image'

type Tone = 'light' | 'dark' | 'brass'
type Size = 'sm' | 'md' | 'lg' | 'xl'

// Rendered display heights per size. The shield PNG is 531×659 (ratio
// 0.806) — width is derived from the rendered height to keep aspect.
const SIZES: Record<Size, { height: number }> = {
  sm: { height: 28 },
  md: { height: 36 },
  lg: { height: 52 },
  xl: { height: 76 },
}

// Source aspect ratio of brand-mark{,-white}.png
const RATIO = 531 / 659

/**
 * GITSOLS monogram seal — the shield "G" from /public/brand/.
 * `tone="light"` renders the teal mark for cream/white backgrounds;
 * `tone="dark"` or `tone="brass"` renders the white mark for deep-teal
 * backgrounds.
 */
export default function Monogram({
  size = 'md',
  tone = 'dark',
  className = '',
}: {
  size?: Size
  tone?: Tone
  className?: string
}) {
  const { height } = SIZES[size]
  const width = Math.round(height * RATIO)

  // Light tone = teal mark (for cream/paper backgrounds);
  // dark / brass = white mark (for deep-teal backgrounds).
  const src = tone === 'light' ? '/brand/brand-mark.png' : '/brand/brand-mark-white.png'

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ height, width }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        priority={size === 'lg' || size === 'xl'}
        sizes={`${width}px`}
        className="block w-full h-full object-contain"
      />
    </span>
  )
}
