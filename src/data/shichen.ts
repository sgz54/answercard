// ─────────────────────────────────────────────────────────────
// The twelve 时辰 (double-hours). Drives the clock, label copy
// and the slowly shifting background palette.
// ─────────────────────────────────────────────────────────────

export interface Shichen {
  /** 0–11, 子 = 0 */
  index: number
  /** Chinese character shown on the outer ring */
  char: string
  /** Poetic English label, e.g. "Noon" */
  name: string
  /** Clock range */
  hours: string
  /** Background gradient stops (top → bottom) */
  gradient: [string, string]
  /** Accent color for the light dot / highlights while active */
  accent: string
  /** Use light text on the background (night watches) */
  dark: boolean
}

export const SHICHEN: Shichen[] = [
  { index: 0, char: '子', name: 'Midnight', hours: '23:00–01:00', gradient: ['#141a2e', '#232b48'], accent: '#9db4e8', dark: true },
  { index: 1, char: '丑', name: 'Before Dawn', hours: '01:00–03:00', gradient: ['#1b2440', '#3a3b5c'], accent: '#a8a6d8', dark: true },
  { index: 2, char: '寅', name: 'Dawn', hours: '03:00–05:00', gradient: ['#4a4668', '#8a6f88'], accent: '#e0b7c8', dark: true },
  { index: 3, char: '卯', name: 'Sunrise', hours: '05:00–07:00', gradient: ['#c98f6e', '#e9c39b'], accent: '#fff1d6', dark: false },
  { index: 4, char: '辰', name: 'Morning', hours: '07:00–09:00', gradient: ['#a8c3a0', '#e8d9b5'], accent: '#4A7C59', dark: false },
  { index: 5, char: '巳', name: 'Mid-Morning', hours: '09:00–11:00', gradient: ['#7fa98b', '#d9e0c4'], accent: '#31523c', dark: false },
  { index: 6, char: '午', name: 'Noon', hours: '11:00–13:00', gradient: ['#e6c484', '#f5e6ca'], accent: '#c46a38', dark: false },
  { index: 7, char: '未', name: 'Early Afternoon', hours: '13:00–15:00', gradient: ['#c9d3a4', '#efe3bf'], accent: '#5d7a4a', dark: false },
  { index: 8, char: '申', name: 'Afternoon', hours: '15:00–17:00', gradient: ['#8fb59c', '#e4d3a6'], accent: '#3c6648', dark: false },
  { index: 9, char: '酉', name: 'Sunset', hours: '17:00–19:00', gradient: ['#d88c63', '#b9655a'], accent: '#ffe3c2', dark: false },
  { index: 10, char: '戌', name: 'Evening', hours: '19:00–21:00', gradient: ['#6d5f7d', '#3e4359'], accent: '#d8c8e8', dark: true },
  { index: 11, char: '亥', name: 'Night', hours: '21:00–23:00', gradient: ['#2b3150', '#171c30'], accent: '#8fa0cf', dark: true },
]

/** 时辰 index for a given Date. 子时 spans 23:00–01:00 and is index 0. */
export function shichenIndexFor(date: Date): number {
  return Math.floor(((date.getHours() + 1) % 24) / 2)
}

/** 0–1 progress of the light dot inside the current two-hour watch. */
export function shichenProgress(date: Date): number {
  const total = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
  const idx = shichenIndexFor(date)
  const start = idx === 0 ? 23 * 60 : idx * 120 - 60
  let elapsed = total - start
  if (elapsed < 0) elapsed += 24 * 60 // 子时 crosses midnight
  return Math.min(1, Math.max(0, elapsed / 120))
}

export function currentShichen(date: Date = new Date()): Shichen {
  return SHICHEN[shichenIndexFor(date)]
}
