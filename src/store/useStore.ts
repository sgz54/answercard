import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AskInput, FollowUp, PlanId, Question, QuestionType } from '@/types'
import { api, type ProductId } from '@/services/api'
import { PRICING, todayKey } from '@/lib/pricing'
import { shichenIndexFor } from '@/data/shichen'
import { randomCoinTosses } from '@/lib/divination'

interface AskResult {
  ok: boolean
  reason?: 'quota' | 'duplicate'
  question?: Question
}

/** Marks the last hour that received a time cast: `${dateKey}#${shichen}`. */
const timeStamp = (castTime: string): string =>
  `${todayKey()}#${shichenIndexFor(new Date(castTime))}`

/** Normalize for duplicate detection: lowercase, strip punctuation, collapse spaces. */
const normalizeQuestion = (q: string): string =>
  q.trim().toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')

interface AppState {
  questions: Question[]
  followups: Record<string, FollowUp[]>
  plan: PlanId
  followupCredits: number
  dailyDate: string
  dailyUsed: number
  /** The hour that already received its one time cast (null = none). */
  timeCastStamp: string | null

  // Casts
  canAsk: () => boolean
  quotaRemaining: () => number
  askQuestion: (input: AskInput) => Promise<AskResult>
  getQuestion: (id: string) => Question | undefined

  // Entitlement
  isPaid: () => boolean
  canSeeFullHistory: () => boolean
  unlockQuestion: (id: string) => void
  followupsLeftFor: (questionId: string) => number // Infinity for subscribers
  consumeFollowUp: (questionId: string) => void
  addFollowUp: (questionId: string, message: string) => Promise<FollowUp | undefined>

  // Billing
  purchase: (product: ProductId, questionId?: string) => Promise<void>
  applyCheckoutResult: (product: ProductId, questionId?: string) => void
  cancelSubscription: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      questions: [],
      followups: {},
      plan: 'free',
      followupCredits: 0,
      dailyDate: todayKey(),
      dailyUsed: 0,
      timeCastStamp: null,

      canAsk: () => {
        const { plan, dailyDate, dailyUsed } = get()
        if (plan === 'monthly') return true
        if (dailyDate !== todayKey()) return true
        return dailyUsed < PRICING.FREE_DAILY_CASTS
      },

      quotaRemaining: () => {
        const { plan, dailyDate, dailyUsed } = get()
        if (plan === 'monthly') return Infinity
        if (dailyDate !== todayKey()) return PRICING.FREE_DAILY_CASTS
        return Math.max(0, PRICING.FREE_DAILY_CASTS - dailyUsed)
      },

      askQuestion: async (input) => {
        if (!get().canAsk()) return { ok: false, reason: 'quota' }
        const stamp = timeStamp(input.castTime)

        // Same hour + same question → the earlier reading still stands,
        // regardless of which ritual the user selects now.
        if (get().timeCastStamp === stamp) {
          const norm = normalizeQuestion(input.questionText)
          const existing = get().questions.find(
            (q) =>
              q.hexagram.castMode === 'time' &&
              timeStamp(q.createdAt) === stamp &&
              normalizeQuestion(q.questionText) === norm,
          )
          if (existing) {
            return { ok: true, question: existing, reason: 'duplicate' }
          }
          // Same hour, different question → fall back to coins.
          const final = { ...input, coinTosses: input.coinTosses ?? randomCoinTosses() }
          const question = await api.askQuestion(final)
          set((state) => ({
            questions: [question, ...state.questions],
            dailyDate: todayKey(),
            dailyUsed: state.dailyDate === todayKey() ? state.dailyUsed + 1 : 1,
          }))
          return { ok: true, question }
        }

        const question = await api.askQuestion(input)
        set((state) => ({
          questions: [question, ...state.questions],
          dailyDate: todayKey(),
          dailyUsed: state.dailyDate === todayKey() ? state.dailyUsed + 1 : 1,
          timeCastStamp: question.hexagram.castMode === 'time' ? stamp : state.timeCastStamp,
        }))
        return { ok: true, question }
      },

      getQuestion: (id) => get().questions.find((q) => q.id === id),

      isPaid: () => get().plan === 'monthly',
      canSeeFullHistory: () => get().plan === 'monthly',

      unlockQuestion: (id) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, isUnlocked: true } : q)),
        })),

      followupsLeftFor: (questionId) => {
        const { plan, followupCredits, followups } = get()
        if (plan === 'monthly') return Infinity
        const used = followups[questionId]?.length ?? 0
        const free = PRICING.FREE_FOLLOWUPS_PER_QUESTION
        return Math.max(0, free - used) + followupCredits
      },

      consumeFollowUp: (questionId) => {
        const { plan, followups, followupCredits } = get()
        if (plan === 'monthly') return
        const used = followups[questionId]?.length ?? 0
        // Free per-question quota is consumed first, then purchased credits.
        if (used >= PRICING.FREE_FOLLOWUPS_PER_QUESTION && followupCredits > 0) {
          set({ followupCredits: followupCredits - 1 })
        }
      },

      addFollowUp: async (questionId, message) => {
        const question = get().questions.find((q) => q.id === questionId)
        if (!question) return
        if (get().followupsLeftFor(questionId) <= 0) return
        const history = get().followups[questionId] ?? []
        const followUp = await api.sendFollowUp({ question, message, history })
        get().consumeFollowUp(questionId)
        set((state) => ({
          followups: {
            ...state.followups,
            [questionId]: [...(state.followups[questionId] ?? []), followUp],
          },
        }))
        return followUp
      },

      purchase: async (product, questionId) => {
        const { url } = await api.createCheckout(product, questionId)
        if (url) {
          // Real PayPal checkout — redirect; entitlements applied on return.
          window.location.href = url
          return
        }
        // Mock checkout — instant success after a short beat.
        await new Promise((r) => setTimeout(r, 1300))
        get().applyCheckoutResult(product, questionId)
      },

      applyCheckoutResult: (product, questionId) => {
        if (product === 'monthly') set({ plan: 'monthly' })
        if (product === 'followup-pack')
          set((s) => ({ followupCredits: s.followupCredits + PRICING.FOLLOWUP_PACK_CREDITS }))
        if (product === 'unlock' && questionId) get().unlockQuestion(questionId)
      },

      cancelSubscription: () => set({ plan: 'free' }),
    }),
    {
      name: 'answer-card-store-v2',
      partialize: (state) => ({
        questions: state.questions,
        followups: state.followups,
        plan: state.plan,
        followupCredits: state.followupCredits,
        dailyDate: state.dailyDate,
        dailyUsed: state.dailyUsed,
        timeCastStamp: state.timeCastStamp,
      }),
    },
  ),
)

export type { ProductId, QuestionType }
