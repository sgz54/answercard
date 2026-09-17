import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import HexagramIcon from '@/components/HexagramIcon'
import FollowUpChat from '@/components/FollowUpChat'
import PaywallModal from '@/components/PaywallModal'
import ShareModal from '@/components/ShareModal'
import { HEXAGRAMS } from '@/data/hexagrams'
import { QUESTION_TYPES } from '@/types'
import { useStore } from '@/store/useStore'

export default function Answer() {
  const { id } = useParams<{ id: string }>()
  const question = useStore((s) => s.questions.find((q) => q.id === id))
  const isPaid = useStore((s) => s.plan === 'monthly')

  const [paywall, setPaywall] = useState<null | 'unlock' | 'followup'>(null)
  const [showChat, setShowChat] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const typeMeta = useMemo(
    () => QUESTION_TYPES.find((t) => t.id === question?.questionType),
    [question],
  )

  if (!question) return <Navigate to="/" replace />

  const reading = HEXAGRAMS[question.hexagram.primaryNo]
  const unlocked = question.isUnlocked || isPaid
  const created = new Date(question.createdAt)

  const sections = [
    { title: 'What’s happening now', body: question.interpretation.present, always: true },
    { title: 'What’s blocking you', body: question.interpretation.block, always: false },
    { title: 'What to do next', body: question.interpretation.next, always: false },
  ]

  return (
    <div className="flex flex-1 flex-col gap-5 py-4">
      {/* ── Hexagram header ─────────────────────────────── */}
      <div className="animate-fadeUp rounded-3xl bg-cream-50/95 px-6 pb-7 pt-8 text-center shadow-[0_18px_50px_-24px_rgba(31,51,38,0.5)]">
        <div className="flex items-center justify-center gap-4">
          <HexagramIcon lines={question.hexagram.lines} movingYao={question.hexagram.movingYao} size={82} />
        </div>
        <h1 className="mt-5 font-serif text-4xl text-bamboo-800">{reading.name}</h1>
        <p className="mt-1.5 font-serif text-xl italic text-ember-dark">“{reading.keyword}”</p>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink/45">
          <span>{typeMeta?.emoji} {typeMeta?.label}</span>
          <span aria-hidden>·</span>
          <span>{question.hexagram.castMode === 'coin' ? '🪙 Coin cast' : '⏳ Time cast'}</span>
          <span aria-hidden>·</span>
          <span>
            {created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
            {created.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>

        <p className="mx-auto mt-5 max-w-lg font-serif text-lg leading-relaxed text-bamboo-900/80">
          “{question.questionText}”
        </p>

        {/* The call — unambiguous leaning, shown up front */}
        <div className="mt-5 flex justify-center px-2">
          <p className="inline-flex max-w-lg items-start gap-2 rounded-2xl bg-bamboo-500/10 px-4 py-2.5 text-left text-[15px] font-medium leading-relaxed text-bamboo-800">
            <span aria-hidden className="text-base leading-6">⚖️</span>
            <span>{question.interpretation.verdict}</span>
          </p>
        </div>
      </div>

      {/* ── Three-sentence reading ──────────────────────── */}
      <div className="animate-fadeUp space-y-4 rounded-3xl bg-cream-50/95 p-6 shadow-[0_18px_50px_-24px_rgba(31,51,38,0.5)] sm:p-7" style={{ animationDelay: '120ms' }}>
        {sections.map((section, idx) => {
          const hidden = !section.always && !unlocked
          return (
            <div key={section.title} className={idx > 0 ? 'border-t border-bamboo-100 pt-4' : ''}>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-bamboo-500">
                <span className="mr-2 font-serif text-base text-bamboo-300">{idx + 1}</span>
                {section.title}
              </h2>
              <div className="relative mt-2">
                <p className={`font-serif text-lg leading-relaxed text-ink ${hidden ? 'paywall-blur' : ''}`}>
                  {section.body}
                </p>
                {hidden && idx === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setPaywall('unlock')}
                      className="rounded-full bg-bamboo-500 px-5 py-2.5 text-sm font-medium text-cream-50 shadow-lg transition hover:bg-bamboo-600"
                    >
                      🔓 Unlock the full reading — $2.99
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Other person + timing — unlocked depth */}
        {unlocked && (
          <div className="mt-2 space-y-4 border-t border-bamboo-100 pt-4">
            {question.interpretation.other && (
              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-bamboo-500">
                  The other person
                </h3>
                <p className="mt-1.5 font-serif text-lg leading-relaxed text-ink">
                  {question.interpretation.other}
                </p>
              </div>
            )}
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-bamboo-500">
                When it moves
              </h3>
              <p className="mt-1.5 font-serif text-lg leading-relaxed text-ink">
                {question.interpretation.timing}
              </p>
            </div>
          </div>
        )}

        {/* Action */}
        <div className="relative mt-2 rounded-2xl bg-ember/15 p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ember-dark">
            Your next move
          </p>
          <p className={`mt-1.5 text-[15px] leading-relaxed text-ink ${!unlocked ? 'paywall-blur' : ''}`}>
            {question.interpretation.action}
          </p>
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
              <button
                onClick={() => setPaywall('unlock')}
                className="rounded-full bg-ember px-5 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-ember-dark"
              >
                See your concrete next step
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────── */}
      <div className="animate-fadeUp grid grid-cols-2 gap-3" style={{ animationDelay: '220ms' }}>
        <button
          onClick={() => {
            if (!unlocked) {
              setPaywall('unlock')
              return
            }
            setShowChat((v) => !v)
          }}
          className="rounded-2xl bg-bamboo-500 py-3.5 text-sm font-medium text-cream-50 shadow-sm transition hover:bg-bamboo-600"
        >
          💬 Ask a follow-up
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="rounded-2xl border border-cream-50/60 bg-cream-50/15 py-3.5 text-sm font-medium text-cream-50 backdrop-blur-sm transition hover:bg-cream-50/25"
        >
          🌅 Share My Answer
        </button>
      </div>

      {showChat && unlocked && (
        <div className="animate-fadeUp">
          <FollowUpChat question={question} onLimitReached={() => setPaywall('followup')} />
        </div>
      )}

      <Link
        to="/"
        className="animate-fadeUp text-center text-sm text-cream-50/80 underline-offset-4 transition hover:text-cream-50 hover:underline"
        style={{ animationDelay: '300ms' }}
      >
        Read another moment
      </Link>

      <p className="pb-2 text-center text-[11px] leading-relaxed text-cream-50/55">
        For reflection and entertainment only. Not a substitute for professional advice.
      </p>

      {paywall && (
        <PaywallModal
          open
          context={paywall}
          questionId={question.id}
          onClose={() => setPaywall(null)}
        />
      )}
      {shareOpen && <ShareModal open question={question} onClose={() => setShareOpen(false)} />}
    </div>
  )
}
