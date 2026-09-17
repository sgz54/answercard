// FastAPI backend client. Shape mirrors the mock implementation
// 1:1, so switching is a VITE_API_MODE env change.
//
// Expected endpoints (see backend contract):
//   POST /questions                 { question_text, question_type, cast_time }
//        -> Question
//   POST /questions/{id}/follow-ups { message }
//        -> FollowUp
//   POST /payments/checkout         { product, questionId? }
//        -> { url, sessionId }   (PayPal approval URL + order ID)
//   POST /payments/capture/{orderId}
//        -> { ok, product, isUnlocked }
import type { ApiClient, ProductId } from './api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${path}`)
  }
  return (await res.json()) as T
}

export const realApi: ApiClient = {
  askQuestion(input) {
    return request('/questions', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  sendFollowUp({ question, message }) {
    return request(`/questions/${question.id}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  },

  createCheckout(product: ProductId, questionId?: string) {
    return request('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ product, questionId }),
    })
  },

  captureOrder(orderId: string) {
    return request(`/payments/capture/${orderId}`, { method: 'POST' })
  },
}
