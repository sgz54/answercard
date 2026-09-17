import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import HexagramIcon from '@/components/HexagramIcon'
import { HEXAGRAMS } from '@/data/hexagrams'
import { QUESTION_TYPES, type QuestionType } from '@/types'
import { useStore } from '@/store/useStore'
import { PRICING } from '@/lib/pricing'

type Filter = 'all' | QuestionType

export default function History() {
  const questions = useStore((s) => s.questions)
  const isPaid = useStore((s) => s.plan === 'monthly')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? questions : questions.filter((q) => q.questionType === filter)),
    [questions, filter],
  )

  // Free tier keeps only the most recent three.
  const visible = isPaid ? filtered : filtered.slice(0, PRICING.FREE_HISTORY_VISIBLE)
  const hiddenCount = filtered.length - visible.length

  return (
    <div className="flex flex-1 flex-col gap-5 py-4">
      <div className="animate-fadeUp">
        <h1 className="font-serif text-3xl text-cream-50">Your moments</h1>
        <p className="mt-1 text-sm text-cream-50/70">Every question you’ve asked, in its own time.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', ...QUESTION_TYPES.map((t) => t.id)] as Filter[]).map((id) => {
          const meta = QUESTION_TYPES.find((t) => t.id === id)
          const active = filter === id
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                active
                  ? 'bg-cream-50 text-bamboo-800'
                  : 'bg-cream-50/15 text-cream-50/80 hover:bg-cream-50/25'
              }`}
            >
              {id === 'all' ? 'All' : `${meta!.emoji} ${meta!.label}`}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-cream-50/10 py-20 text-center">
          <p className="font-serif text-2xl text-cream-50/90">No moments yet</p>
          <p className="max-w-xs text-sm text-cream-50/65">
            When you hold a question and ask it, the reading will wait for you here.
          </p>
          <Link
            to="/"
            className="rounded-full bg-cream-50 px-6 py-2.5 text-sm font-medium text-bamboo-800 transition hover:bg-cream-200"
          >
            Ask your first question
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((q, idx) => {
            const reading = HEXAGRAMS[q.hexagram.primaryNo]
            const date = new Date(q.createdAt)
            const meta = QUESTION_TYPES.find((t) => t.id === q.questionType)
            return (
              <Link
                key={q.id}
                to={`/answer/${q.id}`}
                className="animate-fadeUp flex items-center gap-4 rounded-2xl bg-cream-50/95 p-4 shadow-sm transition hover:bg-cream-50"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <HexagramIcon
                  lines={q.hexagram.lines}
                  movingYao={q.hexagram.movingYao}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{q.questionText}</p>
                  <p className="mt-0.5 truncate text-xs italic text-ember-dark">“{reading.keyword}”</p>
                </div>
                <div className="shrink-0 text-right text-[11px] text-ink/50">
                  <p>
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="mt-0.5">
                    {meta?.emoji} {!q.isUnlocked && !isPaid && <span className="text-ember-dark">🔒</span>}
                  </p>
                </div>
              </Link>
            )
          })}

          {hiddenCount > 0 && (
            <div className="rounded-2xl border border-cream-50/30 bg-cream-50/10 p-5 text-center">
              <p className="text-sm text-cream-50/85">
                {hiddenCount} earlier {hiddenCount === 1 ? 'reading is' : 'readings are'} kept with membership.
              </p>
              <Link
                to="/profile"
                className="mt-2 inline-block rounded-full bg-cream-50 px-5 py-2 text-xs font-medium text-bamboo-800 transition hover:bg-cream-200"
              >
                See full history — ${PRICING.MONTHLY_USD}/mo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
