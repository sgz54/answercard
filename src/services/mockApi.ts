// In-browser implementation: local casting engine + interpreter.
import type { ApiClient, ProductId } from './api'
import type { AskInput, CheckoutResponse, FollowUp, Question } from '@/types'
import { castByTime, castByCoins } from '@/lib/divination'
import { buildInterpretation, buildFollowUpResponse, inferQuestionType } from './interpret'

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockApi: ApiClient = {
  async askQuestion(input: AskInput): Promise<Question> {
    await delay(900) // the 15–20s ritual animation runs on the casting page
    const castTime = new Date(input.castTime)
    // Coin casts use the user's own throws; time casts read the hour.
    const hexagram = input.coinTosses
      ? castByCoins(input.coinTosses, castTime)
      : castByTime(castTime)
    return {
      id: uid(),
      questionText: input.questionText.trim(),
      questionType: inferQuestionType(input.questionText),
      hexagram,
      interpretation: buildInterpretation(hexagram, input.questionText),
      isUnlocked: false,
      createdAt: input.castTime,
    }
  },

  async sendFollowUp({ question, message, history }): Promise<FollowUp> {
    await delay(1100 + Math.random() * 700)
    return {
      id: uid(),
      questionId: question.id,
      userMessage: message.trim(),
      aiResponse: buildFollowUpResponse(question, history.length, message),
      createdAt: new Date().toISOString(),
    }
  },

  async createCheckout(_product: ProductId, _questionId?: string): Promise<CheckoutResponse> {
    // Mock mode: return empty URL so the store keeps its instant-success flow.
    return { url: '', sessionId: '' }
  },

  async captureOrder(_orderId: string) {
    return { ok: true }
  },
}
