// ─────────────────────────────────────────────────────────────
// 梅花易数 · 时间起卦 (time-based casting)
//
//   上卦 = (年支 + 月 + 日) mod 8        (0 → 8)
//   下卦 = (年支 + 月 + 日 + 时辰) mod 8  (0 → 8)
//   动爻 = (年支 + 月 + 日 + 时辰) mod 6  (0 → 6)
//
// Trigrams use 先天八卦数 (Qian=1 ... Kun=8). The resulting two
// trigrams form the primary hexagram; flipping the moving line
// yields the changed hexagram. This is internal computation —
// none of the traditional vocabulary is ever shown to users.
// ─────────────────────────────────────────────────────────────

import { TRIGRAMS, trigramNoFromLines } from '@/data/trigrams'
import { hexagramNo } from '@/data/hexagrams'
import { shichenIndexFor } from '@/data/shichen'
import { solarToLunar, yearBranchNumber, hourBranchNumber } from './lunar'
import type { CastMode, CoinThrow, HexagramResult } from '@/types'

const mod = (n: number, m: number): number => ((n % m) + m) % m

/** mod m where a remainder of 0 maps to m (the traditional rule). */
const divinationMod = (n: number, m: number): number => mod(n - 1, m) + 1

/**
 * Shared assembly: given the six primary lines and the moving line,
 * derive trigram numbers, the changed hexagram, and the record.
 */
function assembleHexagram(
  lines: boolean[],
  movingYao: number,
  castMode: CastMode,
  date: Date,
  coinTosses?: CoinThrow[],
): HexagramResult {
  const upperTrigram = trigramNoFromLines(lines.slice(3, 6))
  const lowerTrigram = trigramNoFromLines(lines.slice(0, 3))

  // Flip the moving line to get the changed hexagram.
  const changedLines = lines.map((line, i) => (i === movingYao - 1 ? !line : line))
  const changedLower = trigramNoFromLines(changedLines.slice(0, 3))
  const changedUpper = trigramNoFromLines(changedLines.slice(3, 6))

  const lunar = solarToLunar(date)
  return {
    primaryNo: hexagramNo(upperTrigram, lowerTrigram),
    changedNo: hexagramNo(changedUpper, changedLower),
    movingYao,
    lines,
    changedLines,
    upperTrigram,
    lowerTrigram,
    castMode,
    coinTosses,
    shichenIndex: shichenIndexFor(date),
    lunar: { year: lunar.year, month: lunar.month, day: lunar.day, hourBranch: hourBranchNumber(date) },
  }
}

export function castByTime(date: Date): HexagramResult {
  const lunar = solarToLunar(date)
  const yearNum = yearBranchNumber(lunar.year)
  const monthNum = lunar.month
  const dayNum = lunar.day
  const hourNum = hourBranchNumber(date)

  const base = yearNum + monthNum + dayNum
  const upperTrigram = divinationMod(base, 8)
  const lowerTrigram = divinationMod(base + hourNum, 8)
  const movingYao = divinationMod(base + hourNum, 6)

  // Primary hexagram lines, bottom → top: lower trigram then upper.
  const lines = [...TRIGRAMS[lowerTrigram].lines, ...TRIGRAMS[upperTrigram].lines]

  return assembleHexagram(lines, movingYao, 'time', date)
}

// ── 铜钱起卦 (three-coin casting) ────────────────────────────
// Six throws of three coins, one line per throw, bottom → top.
// Heads = 3, tails = 2; the sum decides the line:
//   9 old yang (moves) · 7 young yang · 8 young yin · 6 old yin (moves)
// Mei Hua requires exactly one moving line, so:
//   · several old lines → the lowest one acts (the first stirring governs)
//   · a still hexagram  → the trigram numbers pick the line, the
//     same 以数取动 rule the time cast uses.

const HEADS = 3
const TAILS = 2

function throwSum(t: CoinThrow): number {
  return t[0] + t[1] + t[2]
}

export function castByCoins(tosses: CoinThrow[], date: Date): HexagramResult {
  if (tosses.length !== 6) throw new Error('Coin casting needs exactly six throws')

  const sums = tosses.map(throwSum)
  const lines = sums.map((s) => s === 7 || s === 9)

  // Moving-line candidates: every 6 or 9. The lowest one governs.
  let movingYao = sums.findIndex((s) => s === 6 || s === 9) + 1
  if (movingYao === 0) {
    // A still hexagram: pick the moving line from the trigram numbers.
    const upper = trigramNoFromLines(lines.slice(3, 6))
    const lower = trigramNoFromLines(lines.slice(0, 3))
    movingYao = divinationMod(upper + lower, 6)
  }

  return assembleHexagram(lines, movingYao, 'coin', date, tosses)
}

/** Six fresh throws of three coins (3 = heads, 2 = tails). */
export function randomCoinTosses(): CoinThrow[] {
  const flip = (): 2 | 3 => (Math.random() < 0.5 ? TAILS : HEADS) as 2 | 3
  return Array.from({ length: 6 }, () => [flip(), flip(), flip()] as CoinThrow)
}
