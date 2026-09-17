interface HexagramIconProps {
  /** Six lines bottom → top; true = yang (solid) */
  lines: boolean[]
  /** 1–6, highlighted as the moving line */
  movingYao?: number
  size?: number
  className?: string
  color?: string
  movingColor?: string
}

/**
 * Minimal modern hexagram mark: six stacked rounded bars.
 * Yin lines show a clean central gap; the moving line glows ember.
 */
export default function HexagramIcon({
  lines,
  movingYao,
  size = 96,
  className,
  color = '#31523c',
  movingColor = '#e0854f',
}: HexagramIconProps) {
  const width = size
  const height = size * 1.25
  const barH = size * 0.085
  const gap = size * 0.135
  const yinGap = size * 0.16

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Hexagram"
    >
      {lines.map((yang, i) => {
        // SVG paints top → bottom; index 0 is the bottom line.
        const y = height - barH - i * (barH + gap)
        const isMoving = movingYao === i + 1
        const fill = isMoving ? movingColor : color
        if (yang) {
          return (
            <rect
              key={i}
              x={0}
              y={y}
              width={width}
              height={barH}
              rx={barH / 2}
              fill={fill}
              style={isMoving ? { filter: 'drop-shadow(0 0 6px rgba(224,133,79,0.55))' } : undefined}
            />
          )
        }
        const piece = (width - yinGap) / 2
        return (
          <g key={i}>
            <rect x={0} y={y} width={piece} height={barH} rx={barH / 2} fill={fill} />
            <rect x={width - piece} y={y} width={piece} height={barH} rx={barH / 2} fill={fill} />
          </g>
        )
      })}
    </svg>
  )
}
