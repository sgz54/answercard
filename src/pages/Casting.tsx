import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import ShichenClock from '@/components/ShichenClock'
import { useStore } from '@/store/useStore'

const TOTAL_MS = 18_000
const THROW_MS = 3_000
const FLIP_MS = 1_400

const TIME_PHASES = [
  'Reading this moment…',
  'Listening to your question…',
  'Finding your answer…',
  'Finding your answer…',
  'Almost there…',
  'Almost there…',
]

const COIN_PHASES = [
  'The first throw sets the base…',
  'The second throw builds on it…',
  'The third throw shapes the matter…',
  'The fourth throw deepens it…',
  'The fifth throw nears the answer…',
  'The last throw seals it…',
]

export default function Casting() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const question = useStore((s) => s.questions.find((q) => q.id === params.get('id')))
  const [phase, setPhase] = useState(0)
  const [tossIdx, setTossIdx] = useState(0)
  const [flipping, setFlipping] = useState(true)

  const isCoin = question?.hexagram.castMode === 'coin'
  const tosses = question?.hexagram.coinTosses ?? []

  useEffect(() => {
    if (!question) return

    if (isCoin) {
      if (tosses.length !== 6) return
      const timers: number[] = []
      for (let k = 0; k < 6; k++) {
        timers.push(
          window.setTimeout(() => {
            setTossIdx(k)
            setFlipping(true)
          }, k * THROW_MS),
        )
        timers.push(
          window.setTimeout(() => setFlipping(false), k * THROW_MS + FLIP_MS),
        )
      }
      timers.push(
        window.setTimeout(
          () => navigate(`/answer/${question.id}`, { replace: true }),
          TOTAL_MS,
        ),
      )
      return () => timers.forEach(clearTimeout)
    }

    const phaseTimer = setInterval(() => {
      setPhase((p) => Math.min(p + 1, TIME_PHASES.length - 1))
    }, TOTAL_MS / TIME_PHASES.length)

    const done = setTimeout(() => {
      navigate(`/answer/${question.id}`, { replace: true })
    }, TOTAL_MS)

    return () => {
      clearInterval(phaseTimer)
      clearTimeout(done)
    }
  }, [question, navigate, isCoin, tosses.length])

  if (!question) return <Navigate to="/" replace />

  // Lines already revealed: during a flip the previous throws only.
  const revealed = flipping ? tossIdx : Math.min(tossIdx + 1, 6)
  const sums = tosses.map((t) => t[0] + t[1] + t[2])

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 overflow-hidden px-6">
      {/* Readability scrim over the time-tinted background */}
      <div className="pointer-events-none absolute inset-0 bg-bamboo-900/35" />

      {isCoin ? (
        <>
          {/* Coins */}
          <div className="relative" style={{ perspective: '700px' }}>
            <div className="flex gap-4">
              {(tosses[Math.min(tossIdx, 5)] ?? [2, 2, 2]).map((c, i) => (
                <div
                  key={`${tossIdx}-${i}`}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.35)] ${
                    flipping ? 'coin-flipping' : ''
                  }`}
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #f7e3b0, #d9a441 60%, #a8741f)',
                    color: '#5b3d0e',
                  }}
                >
                  {c === 3 ? '◉' : '◌'}
                </div>
              ))}
            </div>
          </div>

          {/* Throw narration */}
          <div className="relative text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-cream-50/60">
              Throw {Math.min(tossIdx + 1, 6)} of 6
            </p>
            <p
              key={tossIdx}
              className="animate-fadeIn mt-2 font-serif text-2xl text-cream-50 sm:text-3xl"
            >
              {COIN_PHASES[Math.min(tossIdx, 5)]}
            </p>
          </div>

          {/* Line stack, bottom → top */}
          <div className="relative flex flex-col-reverse items-center gap-2">
            {Array.from({ length: 6 }, (_, i) => {
              if (i >= revealed) {
                return <div key={i} className="h-2.5 w-24 rounded-full bg-cream-50/15" />
              }
              const yang = sums[i] === 7 || sums[i] === 9
              const moving =
                revealed === 6
                  ? i + 1 === question.hexagram.movingYao
                  : sums[i] === 6 || sums[i] === 9
              const cls = `h-2.5 rounded-full ${
                moving ? 'bg-ember shadow-[0_0_12px_rgba(224,133,79,0.65)]' : 'bg-cream-50'
              }`
              return yang ? (
                <div key={i} className={cls} style={{ width: 96 }} />
              ) : (
                <div key={i} className="flex items-center gap-2" style={{ width: 96 }}>
                  <div className={cls} style={{ width: 38 }} />
                  <div className={cls} style={{ width: 38 }} />
                </div>
              )
            })}
          </div>

          {/* Heads legend */}
          <p className="relative text-[11px] tracking-wide text-cream-50/50">
            ◉ heads · ◌ tails — six throws build the answer from the base up
          </p>
        </>
      ) : (
        <ShichenClock casting size={300} />
      )}

      <div className="relative text-center">
        {!isCoin && (
          <p key={phase} className="animate-fadeIn font-serif text-2xl text-cream-50 sm:text-3xl">
            {TIME_PHASES[phase]}
          </p>
        )}
        {question.questionText && (
          <p className="mx-auto mt-4 max-w-sm text-sm italic leading-relaxed text-cream-50/70">
            “{question.questionText}”
          </p>
        )}
      </div>
    </div>
  )
}
