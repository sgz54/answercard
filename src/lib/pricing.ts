// Business rules (PRD §5.1)
export const PRICING = {
  FREE_DAILY_CASTS: 1,
  FREE_FOLLOWUPS_PER_QUESTION: 1,
  FREE_HISTORY_VISIBLE: 3,
  UNLOCK_USD: 2.99,
  MONTHLY_USD: 6.99,
  FOLLOWUP_PACK_USD: 0.99,
  FOLLOWUP_PACK_CREDITS: 5,
} as const

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
