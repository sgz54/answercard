import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { api } from '@/services/api'
import { PRICING } from '@/lib/pricing'

export default function Profile() {
  const plan = useStore((s) => s.plan)
  const credits = useStore((s) => s.followupCredits)
  const questions = useStore((s) => s.questions)
  const unlockedCount = questions.filter((q) => q.isUnlocked).length
  const quotaRemaining = useStore((s) => s.quotaRemaining)()
  const purchase = useStore((s) => s.purchase)
  const applyCheckoutResult = useStore((s) => s.applyCheckoutResult)
  const cancelSubscription = useStore((s) => s.cancelSubscription)

  const [buying, setBuying] = useState<string | null>(null)

  // Handle PayPal redirect-back: ?token=ORDER_ID&product=...&question=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const product = params.get('product') as 'unlock' | 'monthly' | 'followup-pack' | null
    const questionId = params.get('question') ?? undefined
    if (token && product) {
      // Real PayPal flow: capture the approved order, then apply entitlements.
      ;(async () => {
        try {
          await api.captureOrder(token)
        } catch (e) {
          console.error('PayPal capture failed', e)
        }
        applyCheckoutResult(product, questionId)
      })()
    } else if (params.get('checkout') === 'success' && product) {
      // Fallback for mock / dev redirects.
      applyCheckoutResult(product, questionId)
    }
    if (token || params.get('checkout') === 'success') {
      window.history.replaceState({}, '', '/profile')
    }
  }, [applyCheckoutResult])

  const isPaid = plan === 'monthly'

  const buy = async (product: 'monthly' | 'followup-pack') => {
    setBuying(product)
    await purchase(product)
    setBuying(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-4">
      <div className="animate-fadeUp">
        <h1 className="font-serif text-3xl text-cream-50">Your space</h1>
        <p className="mt-1 text-sm text-cream-50/70">Membership, usage, and settings.</p>
      </div>

      {/* Status card */}
      <div className="animate-fadeUp rounded-3xl bg-cream-50/95 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bamboo-500">Plan</p>
            <p className="mt-1 font-serif text-2xl text-bamboo-800">
              {isPaid ? 'Monthly Membership' : 'Free Reader'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
              isPaid ? 'bg-bamboo-100 text-bamboo-700' : 'bg-bamboo-50 text-bamboo-600'
            }`}
          >
            {isPaid ? 'Active' : 'Free'}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-bamboo-50/70 p-3">
            <p className="font-serif text-xl text-bamboo-800">
              {isPaid ? '∞' : quotaRemaining}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink/50">Questions today</p>
          </div>
          <div className="rounded-2xl bg-bamboo-50/70 p-3">
            <p className="font-serif text-xl text-bamboo-800">{unlockedCount}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink/50">Unlocked</p>
          </div>
          <div className="rounded-2xl bg-bamboo-50/70 p-3">
            <p className="font-serif text-xl text-bamboo-800">{isPaid ? '∞' : credits}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink/50">Follow-up credits</p>
          </div>
        </div>

        {isPaid && (
          <button
            onClick={cancelSubscription}
            className="mt-4 w-full rounded-2xl border border-bamboo-200 py-2.5 text-xs font-medium text-bamboo-600 transition hover:bg-bamboo-50"
          >
            Cancel membership (demo)
          </button>
        )}
      </div>

      {/* Plans */}
      {!isPaid && (
        <div className="animate-fadeUp space-y-3">
          <button
            onClick={() => void buy('monthly')}
            disabled={buying !== null}
            className="flex w-full items-center justify-between rounded-2xl border-2 border-bamboo-500 bg-cream-50 p-5 text-left shadow-sm transition hover:bg-cream-100 disabled:opacity-60"
          >
            <div>
              <p className="flex items-center gap-2 font-medium text-bamboo-800">
                Monthly Membership
                <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Best value
                </span>
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs text-ink/55">
                <li>· Unlimited questions every day</li>
                <li>· Unlimited follow-ups</li>
                <li>· Every full reading unlocked · complete history</li>
              </ul>
            </div>
            <span className="font-serif text-xl text-bamboo-700">${PRICING.MONTHLY_USD}/mo</span>
          </button>

          <button
            onClick={() => void buy('followup-pack')}
            disabled={buying !== null}
            className="flex w-full items-center justify-between rounded-2xl border border-bamboo-200 bg-cream-50/95 p-5 text-left transition hover:bg-cream-100 disabled:opacity-60"
          >
            <div>
              <p className="font-medium text-bamboo-800">Follow-up pack</p>
              <p className="mt-0.5 text-xs text-ink/55">
                {PRICING.FOLLOWUP_PACK_CREDITS} additional AI follow-ups, whenever you need them
              </p>
            </div>
            <span className="font-serif text-xl text-bamboo-700">${PRICING.FOLLOWUP_PACK_USD}</span>
          </button>
        </div>
      )}

      <p className="text-center text-[11px] leading-relaxed text-cream-50/55">
        Payments secured by PayPal.
        <br />
        For reflection and entertainment only. Not a substitute for professional advice.
      </p>
    </div>
  )
}
