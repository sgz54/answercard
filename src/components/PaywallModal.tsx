import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { PRICING } from '@/lib/pricing'

interface PaywallModalProps {
  open: boolean
  onClose: () => void
  /** What triggered the wall — highlights the relevant product. */
  context: 'unlock' | 'followup'
  questionId: string
}

export default function PaywallModal({ open, onClose, context, questionId }: PaywallModalProps) {
  const purchase = useStore((s) => s.purchase)
  const isPaid = useStore((s) => s.plan === 'monthly')
  const [buying, setBuying] = useState<string | null>(null)

  if (!open) return null

  const buy = async (product: 'unlock' | 'monthly' | 'followup-pack') => {
    setBuying(product)
    await purchase(product, product === 'unlock' ? questionId : undefined)
    setBuying(null)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bamboo-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="animate-fadeUp w-full max-w-md rounded-t-3xl bg-cream-50 p-6 shadow-2xl sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between">
          <h2 className="font-serif text-2xl text-bamboo-800">
            {context === 'unlock' ? 'See your full answer' : 'Keep the conversation going'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink/40 transition hover:bg-bamboo-50 hover:text-ink"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-ink/60">
          {context === 'unlock'
            ? 'Your reading holds three insights: the present, the block, and your next move — plus one concrete action.'
            : 'Ask follow-up questions and get answers grounded in the same reading.'}
        </p>

        <div className="space-y-3">
          {/* Monthly */}
          <button
            onClick={() => void buy('monthly')}
            disabled={buying !== null || isPaid}
            className="group flex w-full items-center justify-between rounded-2xl border-2 border-bamboo-500 bg-bamboo-50 p-4 text-left transition hover:bg-bamboo-100 disabled:opacity-60"
          >
            <div>
              <p className="flex items-center gap-2 font-medium text-bamboo-800">
                Monthly Membership
                <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Best value
                </span>
              </p>
              <p className="mt-0.5 text-xs text-ink/55">
                Unlimited questions · unlimited follow-ups · full history
              </p>
            </div>
            <span className="font-serif text-xl text-bamboo-700">
              {isPaid ? 'Active' : `$${PRICING.MONTHLY_USD}/mo`}
            </span>
          </button>

          {context === 'unlock' && (
            <button
              onClick={() => void buy('unlock')}
              disabled={buying !== null || isPaid}
              className="flex w-full items-center justify-between rounded-2xl border border-bamboo-200 bg-white/80 p-4 text-left transition hover:border-bamboo-400 disabled:opacity-60"
            >
              <div>
                <p className="font-medium text-bamboo-800">Unlock this answer</p>
                <p className="mt-0.5 text-xs text-ink/55">All three insights + your concrete next move</p>
              </div>
              <span className="font-serif text-xl text-bamboo-700">${PRICING.UNLOCK_USD}</span>
            </button>
          )}

          {context === 'followup' && (
            <button
              onClick={() => void buy('followup-pack')}
              disabled={buying !== null || isPaid}
              className="flex w-full items-center justify-between rounded-2xl border border-bamboo-200 bg-white/80 p-4 text-left transition hover:border-bamboo-400 disabled:opacity-60"
            >
              <div>
                <p className="font-medium text-bamboo-800">Follow-up pack</p>
                <p className="mt-0.5 text-xs text-ink/55">
                  {PRICING.FOLLOWUP_PACK_CREDITS} more questions about this reading
                </p>
              </div>
              <span className="font-serif text-xl text-bamboo-700">${PRICING.FOLLOWUP_PACK_USD}</span>
            </button>
          )}
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-ink/40">
          {buying ? 'Redirecting to secure checkout…' : 'Payments secured by PayPal.'}
        </p>
      </div>
    </div>
  )
}
