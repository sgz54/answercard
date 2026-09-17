// ─────────────────────────────────────────────────────────────
// Interpretation engine (mock).
//
// Reads the cast through Mei Hua Yi Shu body/use dynamics and
// binds every sentence to the user's actual question, so two
// different questions never share the same answer even on the
// same hexagram. In production the FastAPI backend replaces
// this with DeepSeek output in the same shape.
// ─────────────────────────────────────────────────────────────

import { HEXAGRAMS } from '@/data/hexagrams'
import {
  TRIGRAM_IMAGES,
  bodyUseSplit,
  relationOf,
  YAO_STAGE,
  RELATION_COPY,
  timingWindow,
  cleanQuestion,
  type Relation,
} from '@/data/yijing'
import type { HexagramResult, Interpretation, Question, QuestionType } from '@/types'

const RELATIONS: Relation[] = ['support', 'peer', 'control', 'drain', 'attack']

/** Detects a third person in the question (pronouns or a named role). */
const OTHER_RE =
  /\b(he|she|him|her|his|hers|they|them|their)\b|\bmy (wife|husband|partner|girlfriend|boyfriend|ex|boss|manager|mom|mother|dad|father|friend|bestie|crush|roommate|brother|sister|son|daughter|colleague|coworker|landlord|client)\b/i

/** Infer a coarse topic bucket from the question text (kept for history filters). */
export function inferQuestionType(text: string): QuestionType {
  const t = text.toLowerCase()
  if (/(love|girlfriend|boyfriend|partner|wife|husband|marry|marriage|divorce|crush|date|dating|relationship|break.?up|heartbreak|\bex\b|\btext(ing)?\b|\bher\b|\bhim\b)/.test(t)) {
    return 'relationship'
  }
  if (/(job|offer|salary|boss|work|career|promotion|interview|resign|quit|startup|colleague|raise|business|company|hire|fire|freelance)/.test(t)) {
    return 'career'
  }
  if (/(move|moving|buy|sell|house|apartment|invest|relocat|choose|decision|decide|between|sign|contract)/.test(t)) {
    return 'decision'
  }
  return 'other'
}

export function buildInterpretation(
  hexagram: HexagramResult,
  questionText: string,
): Interpretation {
  const q = cleanQuestion(questionText)
  const { bodyNo, useNo } = bodyUseSplit(hexagram)
  const relation = relationOf(bodyNo, useNo)
  const copy = RELATION_COPY[relation]
  const useImage = TRIGRAM_IMAGES[useNo]
  const bodyImage = TRIGRAM_IMAGES[bodyNo]

  const reading = HEXAGRAMS[hexagram.primaryNo]
  const changed = HEXAGRAMS[hexagram.changedNo]
  const stage = YAO_STAGE[hexagram.movingYao]

  // Deterministic per (question, cast) so a reading never drifts,
  // but different questions/timings get different strategy picks.
  const seed = hexagram.primaryNo * 7 + hexagram.changedNo * 3 + hexagram.movingYao + questionText.length
  const action = copy.actions[seed % copy.actions.length]

  return {
    // ① What's happening now: the question, the matter's image, the body/use verdict.
    present: `You asked, \u201C${q}\u201D — ${useImage.asSituation}. ${copy.presentTone}`,
    // ② What's blocking you: the dynamic + your own current state.
    block: `The reading is specific here: ${copy.block}, and right now ${bodyImage.asSelf}.`,
    // ③ What to do next: the moving line's stage + where the changed hexagram points.
    next: `${stage} The road ahead bends toward \u201C${changed.keyword}\u201D — ${copy.move}.`,
    // ④ The concrete move: strategy with a time anchor + the hexagram's human way.
    action: `On \u201C${q}\u201D — ${action}. ${reading.virtue}`,
    // ⑤ The street-reader's call: an unambiguous leaning, never hedged.
    verdict: copy.verdict,
    // ⑥ 应期: a concrete window from trigram numbers + relation speed.
    timing: timingWindow(hexagram, relation),
    // ⑦ Portrait of the other party, only when the question names one.
    other: OTHER_RE.test(questionText)
      ? `The one you're asking about comes across as ${useImage.asOther}; what holds them back is ${useImage.holdsBack}.`
      : undefined,
  }
}

// ── Follow-up replies ─────────────────────────────────────────

const LEADINS = [
  'Staying in the same reading —',
  'Going one level deeper —',
  'The signs on this have not moved —',
  'Same pattern, sharper focus —',
]

export function buildFollowUpResponse(question: Question, historyCount: number, message: string): string {
  const { bodyNo, useNo } = bodyUseSplit(question.hexagram)
  const relation = RELATIONS.includes(relationOf(bodyNo, useNo)) ? relationOf(bodyNo, useNo) : 'peer'
  const copy = RELATION_COPY[relation]
  const m = cleanQuestion(message)

  const lead = LEADINS[(historyCount + m.length) % LEADINS.length]
  return `${lead} \u201C${m}\u201D — here ${copy.followupDeep}. ${copy.followupClose}`
}
