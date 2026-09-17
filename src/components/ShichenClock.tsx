import { useEffect, useState } from 'react'
import { SHICHEN, shichenIndexFor, shichenProgress } from '@/data/shichen'

interface ShichenClockProps {
  /** Ritual casting mode: the ring accelerates and the dot flies around. */
  casting?: boolean
  /** Dim gently while the question input is focused. */
  dimmed?: boolean
  size?: number
}

const C = 160 // svg center / viewBox 320
const OUTER_R = 128
const ORBIT_R = 88

function polar(radius: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) }
}

/**
 * The twelve-double-hour ring.
 * - Outer ring: 12 时辰 characters + 60 faint minute ticks.
 * - Inner ring: a light dot drifting around one watch every two hours.
 * - Center: the active watch character with a soft breathing halo.
 */
export default function ShichenClock({ casting = false, dimmed = false, size = 340 }: ShichenClockProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (casting) return // CSS animations take over
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [casting])

  const activeIdx = shichenIndexFor(now)
  const active = SHICHEN[activeIdx]
  const progress = shichenProgress(now)
  const dotAngle = (activeIdx + progress) * 30
  const dot = polar(ORBIT_R, dotAngle)
  const ink = active.dark ? 'rgba(245,230,202,0.92)' : 'rgba(31,51,38,0.92)'
  const faint = active.dark ? 'rgba(245,230,202,0.28)' : 'rgba(31,51,38,0.22)'

  return (
    <div
      className="relative transition-opacity duration-700"
      style={{ width: size, height: size, opacity: dimmed ? 0.55 : 1 }}
    >
      <svg width={size} height={size} viewBox="0 0 320 320" className="overflow-visible">
        <defs>
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="45%" stopColor={active.accent} stopOpacity="0.95" />
            <stop offset="100%" stopColor={active.accent} stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Minute ticks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const p1 = polar(OUTER_R, i * 6)
          const p2 = polar(OUTER_R - (i % 5 === 0 ? 10 : 5), i * 6)
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={faint}
              strokeWidth={i % 5 === 0 ? 1.4 : 0.7}
            />
          )
        })}

        {/* Rotating ring: track + the twelve characters */}
        <g
          style={
            casting
              ? {
                  transformOrigin: '160px 160px',
                  animation: 'clockSpin 18s cubic-bezier(0.45,0,0.25,1) forwards',
                }
              : undefined
          }
        >
          <circle cx={C} cy={C} r={OUTER_R} fill="none" stroke={faint} strokeWidth="1.2" />
          {SHICHEN.map((s, i) => {
            const pos = polar(106, i * 30)
            const isActive = i === activeIdx
            return (
              <g key={s.index}>
                {isActive && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={20}
                    fill={active.accent}
                    opacity={0.18}
                      className="animate-breathe"
                      style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                  />
                )}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isActive ? 25 : 18}
                  fontWeight={isActive ? 600 : 400}
                  fill={isActive ? active.accent : faint}
                  style={{ fontFamily: '"Cormorant Garamond", serif', transition: 'all 600ms' }}
                  filter={isActive ? 'url(#softGlow)' : undefined}
                >
                  {s.char}
                </text>
              </g>
            )
          })}
        </g>

        {/* Inner orbit + light dot */}
        <circle cx={C} cy={C} r={ORBIT_R} fill="none" stroke={faint} strokeWidth="1" strokeDasharray="2 6" />
        {casting ? (
          <g
            style={{
              transformOrigin: '160px 160px',
              animation: 'clockSpin 0.85s linear infinite',
            }}
          >
            <circle cx={C} cy={C - ORBIT_R} r={26} fill="url(#dotGlow)" />
            <circle cx={C} cy={C - ORBIT_R} r={6.5} fill="#fffdf6" />
          </g>
        ) : (
          <>
            <circle cx={dot.x} cy={dot.y} r={22} fill="url(#dotGlow)" className="transition-all duration-1000 ease-linear" />
            <circle cx={dot.x} cy={dot.y} r={6} fill="#fffdf6" className="transition-all duration-1000 ease-linear" />
          </>
        )}

        {/* Center */}
        <circle
          cx={C}
          cy={C}
          r={52}
          fill={active.dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.35)'}
        />
        <circle cx={C} cy={C} r={52} fill="none" stroke={faint} strokeWidth="1" />
        {casting ? (
          <g
            style={{ transformOrigin: '160px 160px', animation: 'clockSpinReverse 1.4s linear infinite' }}
          >
            <text
              x={C}
              y={C + 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={40}
              fill={active.accent}
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              {active.char}
            </text>
          </g>
        ) : (
          <text
            x={C}
            y={C + 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={42}
            fill={ink}
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            {active.char}
          </text>
        )}
      </svg>
    </div>
  )
}
