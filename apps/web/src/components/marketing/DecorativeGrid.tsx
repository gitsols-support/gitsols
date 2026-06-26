// Reusable dot-grid SVG background. Tiled via SVG <pattern> so it scales
// cleanly and renders crisply at any size.
//
// Use behind sections that need ambient depth without imagery (e.g. behind
// a CTA, behind the founder block). Drop into a `relative` parent with
// `pointer-events-none` so it sits behind content without blocking clicks.

interface DecorativeGridProps {
  className?: string
  tone?: 'light' | 'dark'
  /** Spacing between dots in px. Smaller = denser. */
  size?: number
}

export default function DecorativeGrid({
  className,
  tone = 'light',
  size = 24,
}: DecorativeGridProps) {
  const dotColor = tone === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,76,76,0.07)'

  return (
    <svg
      className={className}
      aria-hidden
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={`grid-${tone}-${size}`}
          x="0"
          y="0"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill={dotColor} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#grid-${tone}-${size})`} />
    </svg>
  )
}
