import { useState } from 'react'

const SHICHEN_CHARS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const WELCOME_KEY = 'answer-card-seen-welcome-v1'

export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1'
  } catch {
    return false
  }
}

export default function Welcome({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false)

  const handleEnter = () => {
    setLeaving(true)
    setTimeout(() => {
      try {
        localStorage.setItem(WELCOME_KEY, '1')
      } catch {
        /* ignore */
      }
      onEnter()
    }, 700)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-bamboo-900 via-bamboo-800 to-ink px-6 transition-opacity duration-700 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 旋转时辰环 — 背景装饰 */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div
          className="relative h-[460px] w-[460px] opacity-15"
          style={{ animation: 'clockSpin 120s linear infinite' }}
        >
          {SHICHEN_CHARS.map((c, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 origin-center font-serif text-2xl text-cream-50"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-210px)`,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 呼吸光晕 */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-bamboo-400/10 blur-3xl"
        style={{ animation: 'breathe 5s ease-in-out infinite' }}
        aria-hidden
      />

      {/* 中央内容 */}
      <div className="relative z-10 max-w-md text-center">
        {/* 太极 */}
        <div className="text-7xl text-cream-50/90" aria-hidden>
          ☯
        </div>

        <h1 className="mt-5 font-serif text-5xl tracking-wide text-cream-50 drop-shadow-lg">
          Answer Card
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.42em] text-cream-50/55">
          Read This Moment
        </p>

        {/* 分隔线 */}
        <div className="mx-auto mt-7 h-px w-32 bg-gradient-to-r from-transparent via-cream-50/40 to-transparent" />

        <div className="mt-7 space-y-4 px-1 text-[15px] leading-relaxed text-cream-50/75">
          <p className="font-serif text-lg italic text-cream-50/90">
            Every hour carries its own reading.
          </p>
          <p>
            The clock speaks once for the hour; the coins speak as many times as your hand is
            willing to throw. One question, one cast — ask what truly matters, and listen.
          </p>
          <p className="text-sm text-cream-50/55">
            This is a sacred practice. Treat each reading with the weight it deserves.
          </p>
        </div>

        <button
          type="button"
          onClick={handleEnter}
          className="mt-10 rounded-full border border-cream-50/30 bg-cream-50/10 px-8 py-3.5 text-base font-medium tracking-[0.12em] text-cream-50 backdrop-blur-sm transition hover:border-cream-50/60 hover:bg-cream-50/20 active:scale-[0.99]"
        >
          I Understand — Enter
        </button>

        <p className="mt-8 text-[11px] tracking-wide text-cream-50/35">
          For reflection and entertainment only. Not a substitute for professional advice.
        </p>
      </div>
    </div>
  )
}
