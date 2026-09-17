// ─────────────────────────────────────────────────────────────
// Answer Card — shared domain types
// These mirror the FastAPI + Supabase contracts (see /backend).
// ─────────────────────────────────────────────────────────────

export type QuestionType = 'relationship' | 'career' | 'decision' | 'other'

export const QUESTION_TYPES: { id: QuestionType; emoji: string; label: string }[] = [
  { id: 'relationship', emoji: '💕', label: 'Relationship' },
  { id: 'career', emoji: '💼', label: 'Career' },
  { id: 'decision', emoji: '🧭', label: 'Decision' },
  { id: 'other', emoji: '🌙', label: 'Other' },
]

/** The three-sentence reading + one concrete action. */
export interface Interpretation {
  /** What's happening now */
  present: string
  /** What's blocking you */
  block: string
  /** What to do next */
  next: string
  /** One concrete, executable piece of advice */
  action: string
  /** Clear leaning verdict, e.g. "The reading leans Yes — ..." */
  verdict: string
  /** 应期 (timing window) derived from trigram numbers */
  timing: string
  /** Portrait of the other party, when the question involves one */
  other?: string
}

/** How the hexagram was cast: by the hour, or by coin tosses. */
export type CastMode = 'time' | 'coin'

/**
 * One throw of three coins, bottom line → top line.
 * Each coin: 3 (heads) or 2 (tails); the sum 6–9 decides the line
 * (7/8 stay still, 6/9 move). Empty = cast by time.
 */
export type CoinThrow = [number, number, number]

export interface HexagramResult {
  /** King Wen number of the primary (ben) hexagram, 1–64 */
  primaryNo: number
  /** King Wen number of the changed (zhi) hexagram, 1–64 */
  changedNo: number
  /** Moving line, 1–6 (bottom to top) */
  movingYao: number
  /** Primary hexagram six lines, bottom → top. true = yang (solid) */
  lines: boolean[]
  /** Changed hexagram six lines, bottom → top */
  changedLines: boolean[]
  /** 先天八卦数 of the upper trigram, 1–8 */
  upperTrigram: number
  /** 先天八卦数 of the lower trigram, 1–8 */
  lowerTrigram: number
  /** 时辰 index 0–11 (子 = 0) used for the cast */
  shichenIndex: number
  /** How this hexagram was cast */
  castMode: CastMode
  /** Raw six throws, present only for coin casts (used to replay the ritual) */
  coinTosses?: CoinThrow[]
  /** Lunar date used internally for the cast (never shown to users) */
  lunar: { year: number; month: number; day: number; hourBranch: number }
}

export interface Question {
  id: string
  questionText: string
  questionType: QuestionType
  hexagram: HexagramResult
  interpretation: Interpretation
  /** Single unlock ($2.99) or granted by subscription */
  isUnlocked: boolean
  createdAt: string
}

export interface FollowUp {
  id: string
  questionId: string
  userMessage: string
  aiResponse: string
  createdAt: string
}

export type PlanId = 'free' | 'monthly'

export interface AskInput {
  questionText: string
  /** ISO string of the cast moment (set the moment the user taps Ask) */
  castTime: string
  /**
   * Six throws of three coins (bottom line → top line), 3 = heads,
   * 2 = tails per coin. Present = coin cast; absent = time cast.
   */
  coinTosses?: CoinThrow[]
}

export interface CheckoutResponse {
  /** PayPal approval URL — empty string in mock mode (no redirect). */
  url: string
  sessionId: string
}

export interface PurchaseResult {
  ok: boolean
  plan?: PlanId
  isUnlocked?: boolean
  followupCredits?: number
}
