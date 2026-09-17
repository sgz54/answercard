// ─────────────────────────────────────────────────────────────
// Service layer. The app talks only to ApiClient; set
// VITE_API_MODE=real to point at the FastAPI backend.
// ─────────────────────────────────────────────────────────────

import type { AskInput, CheckoutResponse, FollowUp, Question } from '@/types'
import { mockApi } from './mockApi'
import { realApi } from './realApi'

export type ProductId = 'unlock' | 'monthly' | 'followup-pack'

export interface ApiClient {
  /** Cast a hexagram for the question and return the full record. */
  askQuestion(input: AskInput): Promise<Question>
  /** AI follow-up grounded in the original hexagram. */
  sendFollowUp(args: { question: Question; message: string; history: FollowUp[] }): Promise<FollowUp>
  /** Create a PayPal order; returns the approval URL + order ID. */
  createCheckout(product: ProductId, questionId?: string): Promise<CheckoutResponse>
  /** Capture an approved PayPal order and grant entitlements. */
  captureOrder(orderId: string): Promise<{ ok: boolean; product?: ProductId; isUnlocked?: boolean }>
}

const mode = import.meta.env.VITE_API_MODE === 'real' ? 'real' : 'mock'

export const api: ApiClient = mode === 'real' ? realApi : mockApi
