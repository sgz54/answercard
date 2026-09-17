// ─────────────────────────────────────────────────────────────
// The eight trigrams (八卦), keyed by 先天八卦数 (1–8).
// lines are bottom → top; true = yang (solid line).
// ─────────────────────────────────────────────────────────────

export interface Trigram {
  no: number
  pinyin: string
  name: string
  nature: string
  symbol: string
  lines: [boolean, boolean, boolean]
}

export const TRIGRAMS: Record<number, Trigram> = {
  1: { no: 1, pinyin: 'Qián', name: 'The Creative', nature: 'Heaven', symbol: '☰', lines: [true, true, true] },
  2: { no: 2, pinyin: 'Duì', name: 'The Joyous', nature: 'Lake', symbol: '☱', lines: [true, true, false] },
  3: { no: 3, pinyin: 'Lí', name: 'The Clinging', nature: 'Fire', symbol: '☲', lines: [true, false, true] },
  4: { no: 4, pinyin: 'Zhèn', name: 'The Arousing', nature: 'Thunder', symbol: '☳', lines: [true, false, false] },
  5: { no: 5, pinyin: 'Xùn', name: 'The Gentle', nature: 'Wind', symbol: '☴', lines: [false, true, true] },
  6: { no: 6, pinyin: 'Kǎn', name: 'The Abysmal', nature: 'Water', symbol: '☵', lines: [false, true, false] },
  7: { no: 7, pinyin: 'Gèn', name: 'Keeping Still', nature: 'Mountain', symbol: '☶', lines: [false, false, true] },
  8: { no: 8, pinyin: 'Kūn', name: 'The Receptive', nature: 'Earth', symbol: '☷', lines: [false, false, false] },
}

/** Recover the 先天数 from three lines (bottom → top). */
export function trigramNoFromLines(lines: boolean[]): number {
  const v = (lines[0] ? 1 : 0) + (lines[1] ? 2 : 0) + (lines[2] ? 4 : 0)
  return 8 - v
}
