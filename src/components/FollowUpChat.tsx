import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { HEXAGRAMS } from '@/data/hexagrams'
import { PRICING } from '@/lib/pricing'
import type { Question } from '@/types'

interface FollowUpChatProps {
  question: Question
  onLimitReached: () => void
}

export default function FollowUpChat({ question, onLimitReached }: FollowUpChatProps) {
  const followups = useStore((s) => s.followups[question.id] ?? [])
  const addFollowUp = useStore((s) => s.addFollowUp)
  const isPaid = useStore((s) => s.plan === 'monthly')
  const credits = useStore((s) => s.followupCredits)

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [followups.length, sending])

  const left = useStore((s) => s.followupsLeftFor)(question.id)
  const canSend = left > 0

  const send = async () => {
    const message = input.trim()
    if (message.length < 2 || sending) return
    if (!canSend) {
      onLimitReached()
      return
    }
    setSending(true)
    setInput('')
    await addFollowUp(question.id, message)
    setSending(false)
  }

  const quotaLabel = isPaid
    ? 'Unlimited follow-ups on your plan'
    : `${left} follow-up${left === 1 ? '' : 's'} left · ${credits} pack credits`

  return (
    <div className="rounded-3xl bg-cream-50/95 p-5 shadow-[0_18px_50px_-24px_rgba(31,51,38,0.5)] sm:p-6">
      {/* Context header */}
      <div className="border-b border-bamboo-100 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bamboo-500">Your question</p>
        <p className="mt-1 font-serif text-lg leading-snug text-bamboo-900">“{question.questionText}”</p>
        <p className="mt-1.5 text-xs italic text-ember-dark">
          Thread: {HEXAGRAMS[question.hexagram.primaryNo].keyword}
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="soft-scroll max-h-80 space-y-4 overflow-y-auto py-4">
        {followups.length === 0 && (
          <p className="py-4 text-center text-sm text-ink/50">
            Anything unclear? Ask one follow-up — the answer stays grounded in this reading.
          </p>
        )}
        {followups.map((f) => (
          <div key={f.id} className="space-y-2">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-bamboo-500 px-4 py-2.5 text-sm leading-relaxed text-cream-50">
                {f.userMessage}
              </p>
            </div>
            <div className="flex justify-start">
              <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-bamboo-100 bg-white/80 px-4 py-2.5 text-sm leading-relaxed text-ink">
                {f.aiResponse}
              </p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-bamboo-100 bg-white/80 px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-bamboo-400"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="pt-2">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            rows={1}
            maxLength={300}
            placeholder={canSend ? 'Ask a follow-up…' : 'You’ve used your free follow-up'}
            className="max-h-28 flex-1 resize-none rounded-2xl border border-bamboo-200 bg-white/85 px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-bamboo-400 focus:ring-2 focus:ring-bamboo-200"
          />
          <button
            onClick={() => void send()}
            disabled={sending || input.trim().length < 2}
            className="shrink-0 rounded-2xl bg-bamboo-500 px-5 py-3 text-sm font-medium text-cream-50 transition hover:bg-bamboo-600 disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-ink/45">{quotaLabel}</span>
          {!canSend && (
            <button onClick={onLimitReached} className="text-[11px] font-medium text-ember-dark underline">
              Get more (${PRICING.FOLLOWUP_PACK_USD} / {PRICING.FOLLOWUP_PACK_CREDITS})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
