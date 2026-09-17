// Thin wrapper over lunar-javascript. Only exposes what the
// time-based casting (梅花易数 · 时间起卦) needs.
import { Solar } from 'lunar-javascript'

export interface LunarDate {
  year: number
  /** 1–12 (leap months are normalized to their positive number) */
  month: number
  /** 1–30 */
  day: number
  isLeapMonth: boolean
}

export function solarToLunar(date: Date): LunarDate {
  const lunar = Solar.fromDate(date).getLunar()
  const rawMonth = lunar.getMonth()
  return {
    year: lunar.getYear(),
    month: Math.abs(rawMonth),
    day: lunar.getDay(),
    isLeapMonth: rawMonth < 0,
  }
}

/**
 * 年支数 for 梅花易数: 子=1 丑=2 ... 亥=12, derived from the lunar year.
 */
export function yearBranchNumber(lunarYear: number): number {
  return (((lunarYear - 4) % 12) + 12) % 12 + 1
}

/**
 * 时辰数: 子时(23:00–01:00)=1 ... 亥时=12.
 */
export function hourBranchNumber(date: Date): number {
  return Math.floor(((date.getHours() + 1) % 24) / 2) + 1
}
