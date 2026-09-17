import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShichenClock from '@/components/ShichenClock'
import { currentShichen, shichenIndexFor } from '@/data/shichen'
import { randomCoinTosses } from '@/lib/divination'
import { todayKey } from '@/lib/pricing'
import { useStore } from '@/store/useStore'
import type { CastMode } from '@/types'

function formatTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function Home() {
  const navigate = useNavigate()
  const canAsk = useStore((s) => s.canAsk())
  const isPaid = useStore((s) => s.plan === 'monthly')
  const quotaRemaining = useStore((s) => s.quotaRemaining)()
  const askQuestion = useStore((s) => s.askQuestion)
  const timeCastStamp = useStore((s) => s.timeCastStamp)

  const [now, setNow] = useState(() => new Date())
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const shichen = useMemo(() => currentShichen(now), [now])
  const dark = shichen.dark

  // The hour gives exactly one time cast; after it, only coins stay open.
  const timeUsed = timeCastStamp === `${todayKey()}#${shichenIndexFor(now)}`
  const [castMode, setCastMode] = useState<CastMode>(() => (timeUsed ? 'coin' : 'time'))
  useEffect(() => {
    if (timeUsed && castMode === 'time') setCastMode('coin')
  }, [timeUsed, castMode])

  const handleAsk = async () => {
    if (submitting) return
    if (text.trim().length < 12) {
      setError('Write your question in a little more detail — specifics sharpen the answer.')
      return
    }
    if (!canAsk) {
      navigate('/profile')
      return
    }
    setError('')
    setNotice('')
    setSubmitting(true)
    const result = await askQuestion({
      questionText: text,
      castTime: new Date().toISOString(),
      coinTosses: castMode === 'coin' ? randomCoinTosses() : undefined,
    })
    setSubmitting(false)
    if (result.ok && result.question) {
      if (result.reason === 'duplicate') {
        setNotice('Same question, same hour — the reading you received still stands. Showing it now.')
        setTimeout(() => navigate(`/answer/${result.question!.id}`), 1400)
      } else {
        navigate(`/casting?id=${result.question.id}`)
      }
    } else {
      navigate('/profile')
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 py-4">
      {/* Clock */}
      <div className="animate-fadeIn">
        <ShichenClock dimmed={focused} size={330} />
      </div>

      {/* Watch label */}
      <div className="text-center animate-fadeUp">
        <p
          className="font-serif text-3xl tracking-wide sm:text-4xl"
          style={{ color: dark ? '#F5E6CA' : '#284131' }}
        >
          {shichen.char}时 · {shichen.name}
        </p>
        <p
          className="mt-1 text-sm tracking-[0.25em] uppercase"
          style={{ color: dark ? 'rgba(245,230,202,0.65)' : 'rgba(40,65,49,0.6)' }}
        >
          {formatTime(now)}
        </p>
      </div>

      {/* Question card */}
      <div className="w-full max-w-md animate-fadeUp rounded-3xl bg-cream-50/92 p-5 shadow-[0_18px_50px_-20px_rgba(31,51,38,0.45)] backdrop-blur-sm sm:p-6">
        <label htmlFor="question" className="mb-2 block font-serif text-xl text-bamboo-800">
          What&rsquo;s on your mind?
        </label>
        <p className="mb-3 text-xs leading-relaxed text-ink/55">
          Write it out in detail — what happened, who is involved, what you are afraid of. The more
          specific your question, the sharper your answer.
        </p>
        <textarea
          id="question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleAsk()
            }
          }}
          rows={4}
          maxLength={500}
          placeholder="e.g. Should I accept the offer from the smaller company — the pay is lower, but the team and the work excite me more?"
          className="w-full resize-none rounded-2xl border border-bamboo-200 bg-white/80 px-4 py-3 text-base leading-relaxed text-ink outline-none transition placeholder:text-ink/35 focus:border-bamboo-400 focus:ring-2 focus:ring-bamboo-200"
        />

        {error && <p className="mt-3 text-sm text-ember-dark">{error}</p>}
        {notice && (
          <p className="mt-3 rounded-xl bg-bamboo-500/10 px-3 py-2 text-center text-sm font-medium text-bamboo-700">
            {notice}
          </p>
        )}

        {/* The ritual: how to cast */}
        <div className="mt-4">
          <p className="flex items-start gap-1.5 rounded-xl bg-ember/10 px-3 py-2 text-[11.5px] font-medium leading-relaxed text-ember-dark">
            <span aria-hidden>🕯</span>
            <span>
              Casting is serious — one question, one cast. The hour gives a single reading, so ask
              only what truly matters.
            </span>
          </p>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => !timeUsed && setCastMode('time')}
              disabled={timeUsed}
              aria-pressed={castMode === 'time'}
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                castMode === 'time'
                  ? 'border-bamboo-500 bg-bamboo-500/10 shadow-sm'
                  : 'border-bamboo-200 bg-white/60 hover:border-bamboo-300'
              } ${timeUsed ? 'cursor-not-allowed opacity-45' : ''}`}
            >
              <span className="text-base" aria-hidden>⏳</span>
              <span className="block text-sm font-medium text-bamboo-800">Time cast</span>
              <span className="block text-[11px] leading-snug text-ink/55">
                {timeUsed ? 'Used for this hour' : 'This hour decides · once per hour'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCastMode('coin')}
              aria-pressed={castMode === 'coin'}
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                castMode === 'coin'
                  ? 'border-bamboo-500 bg-bamboo-500/10 shadow-sm'
                  : 'border-bamboo-200 bg-white/60 hover:border-bamboo-300'
              }`}
            >
              <span className="text-base" aria-hidden>🪙</span>
              <span className="block text-sm font-medium text-bamboo-800">Coin toss</span>
              <span className="block text-[11px] leading-snug text-ink/55">
                Six throws of three coins
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleAsk()}
          disabled={submitting}
          className="mt-4 w-full rounded-2xl bg-bamboo-500 py-3.5 text-base font-medium tracking-wider text-cream-50 transition hover:bg-bamboo-600 active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? 'Preparing…' : castMode === 'coin' ? 'Ask & Toss the Coins' : 'Ask'}
        </button>

        <p className="mt-3 text-center text-[11px] text-ink/45">
          {isPaid
            ? 'Unlimited questions on your plan'
            : canAsk
              ? `${quotaRemaining} free question today · resets at midnight`
              : "Today's free question is used — see plans for more"}
        </p>
      </div>
    </div>
  )
}
