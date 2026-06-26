interface NetworkBackgroundProps {
  className?: string
  /** Light = on cream backgrounds, dark = on deep teal backgrounds. */
  tone?: 'light' | 'dark'
}

const NODES = [
  { x: 80, y: 90, r: 4 },
  { x: 200, y: 60, r: 3 },
  { x: 320, y: 110, r: 5 },
  { x: 440, y: 70, r: 3 },
  { x: 560, y: 130, r: 4 },
  { x: 680, y: 90, r: 3 },
  { x: 140, y: 220, r: 3 },
  { x: 260, y: 260, r: 5 },
  { x: 380, y: 220, r: 3 },
  { x: 500, y: 270, r: 4 },
  { x: 620, y: 230, r: 3 },
  { x: 80, y: 360, r: 4 },
  { x: 220, y: 400, r: 3 },
  { x: 360, y: 360, r: 4 },
  { x: 490, y: 410, r: 3 },
  { x: 620, y: 370, r: 4 },
] as const

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [0, 6], [1, 7], [2, 7], [2, 8], [3, 9],
  [4, 10], [5, 10], [6, 11], [7, 12], [8, 13],
  [9, 14], [10, 15], [11, 12], [12, 13], [13, 14],
  [14, 15], [6, 7], [8, 9],
] as const

/**
 * Editorial network topology — uses brass (light tone) or signal teal (dark
 * tone) accents. A handful of nodes are tagged "anchor" with a serif numeral
 * label, giving the texture a print-engineering feel.
 */
export default function NetworkBackground({
  className,
  tone = 'light',
}: NetworkBackgroundProps) {
  const nodeColor = tone === 'dark' ? '#14B8A6' : '#0F4C4C'
  const edgeColor = tone === 'dark' ? '#14B8A6' : '#0F4C4C'
  const accentColor = tone === 'dark' ? '#0F766E' : '#0F766E'
  const edgeOpacity = tone === 'dark' ? 0.2 : 0.14
  const nodeOpacity = tone === 'dark' ? 0.55 : 0.42

  // A few "anchor" nodes get a brass ring + serif numeral
  const anchors = new Set([2, 7, 10, 13])

  return (
    <svg
      viewBox="0 0 760 480"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={className}
    >
      <g stroke={edgeColor} strokeOpacity={edgeOpacity} strokeWidth={1}>
        {EDGES.map(([a, b], i) => {
          const from = NODES[a]
          const to = NODES[b]
          if (!from || !to) return null
          return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        })}
      </g>
      <g fill={nodeColor} fillOpacity={nodeOpacity}>
        {NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r}>
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur={`${4 + (i % 3)}s`}
              begin={`${(i * 0.2).toFixed(1)}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
      {/* Anchor rings */}
      <g fill="none" stroke={accentColor} strokeOpacity={0.55} strokeWidth={1}>
        {NODES.map((n, i) =>
          anchors.has(i) ? (
            <circle key={`r-${i}`} cx={n.x} cy={n.y} r={n.r + 6} />
          ) : null,
        )}
      </g>
    </svg>
  )
}
