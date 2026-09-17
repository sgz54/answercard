// ─────────────────────────────────────────────────────────────
// Mei Hua Yi Shu interpretation core (internal only — the UI
// never shows traditional vocabulary).
//
// Sources informing the reading model:
//  · Shao Yong's 梅花易数: 体用 (body/use) division by the moving
//    line, five-element generation/overcoming between trigrams,
//    and the 万物类象 (images of the eight trigrams).
//  · The Zhouyi: the moving line's stage semantics (sprout,
//    steady middle, fault line, near-power, command seat, excess).
//  · Ni Haixia's Tian Ji lectures: the "human way" of each
//    hexagram — the behavioral rule the image implies (see the
//    `virtue` lines in hexagrams.ts).
// ─────────────────────────────────────────────────────────────

import type { HexagramResult } from '@/types'

export type Element = 'metal' | 'wood' | 'water' | 'fire' | 'earth'

const GENERATES: Record<Element, Element> = {
  metal: 'water',
  water: 'wood',
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
}

const OVERCOMES: Record<Element, Element> = {
  metal: 'wood',
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
}

export interface TrigramImage {
  element: Element
  /** The image when it is the USE trigram (the matter / outside). */
  asSituation: string
  /** The image when it is the BODY trigram (the asker / self). */
  asSelf: string
  /** Behavior pattern of the other person (when the use trigram stands for them). */
  asOther: string
  /** What holds that person back. */
  holdsBack: string
}

/** 八卦类象, keyed by 先天八卦数. */
export const TRIGRAM_IMAGES: Record<number, TrigramImage> = {
  1: {
    element: 'metal',
    asSituation:
      'the situation is formal and high-stakes, governed by hierarchy, rules and a clear power structure',
    asSelf: 'you are in a strong, take-charge state, holding more authority than you realize',
    asOther:
      'principled and self-assured — someone who moves by rules and position, not by impulse',
    holdsBack: 'pride and the fear of losing face',
  },
  2: {
    element: 'metal',
    asSituation:
      'the situation runs on words — conversation, promises and negotiation, with pleasant surfaces that still need verifying',
    asSelf: 'you are in a light, talkative, agreeable mood, more ready to please than to push',
    asOther:
      'charming and easy to talk to; their promises come easier than their follow-through',
    holdsBack: 'the wish to keep things pleasant rather than real',
  },
  3: {
    element: 'fire',
    asSituation:
      'everything is out in the open and moving fast — visibility, attention, quick bright developments that can also burn quick',
    asSelf: 'you are sharp, exposed, and reacting faster than is good for you',
    asOther: 'expressive and warm in the moment — what they feel shows immediately',
    holdsBack: 'the fact that their heat cools as fast as it ignites',
  },
  4: {
    element: 'wood',
    asSituation:
      'events are moving fast and loudly — news, surprises, and things being shaken loose around you',
    asSelf: 'you are restless and primed to act, carrying more momentum than patience',
    asOther: 'impulsive and direct; they act first and sort the feelings out later',
    holdsBack: 'the honest truth that they do not know their own mind yet',
  },
  5: {
    element: 'wood',
    asSituation:
      'things are advancing quietly and indirectly — through details, documents and backchannels rather than open moves',
    asSelf: 'you are watching, flexible, and quietly working your angles',
    asOther:
      'indirect — hints, side doors, and messages that never quite say the thing outright',
    holdsBack: 'conflict avoidance; they would rather drift than decide',
  },
  6: {
    element: 'water',
    asSituation:
      'the situation carries hidden depths — unclear information, emotional undercurrents, and real risk under a calm surface',
    asSelf: 'your mind is heavy and circling the same worries, seeing the danger more clearly than the way out',
    asOther: 'guarded and hard to read; their feelings stay underwater',
    holdsBack: 'distrust — they test before they open up',
  },
  7: {
    element: 'earth',
    asSituation:
      'the situation has hit a wall and stands still — a boundary, a silence, a door that is not opening',
    asSelf: 'part of you wants to stop and hold ground, and that instinct is half right',
    asOther: 'still and stubborn; they move only when they themselves decide to',
    holdsBack: 'their own timetable, which ignores yours entirely',
  },
  8: {
    element: 'earth',
    asSituation:
      'the situation is slow, practical and grounded — moving at its own pace, fed steadily rather than forced',
    asSelf: 'you are tired and grounded, holding a lot quietly',
    asOther: 'steady and accommodating; they absorb pressure rather than push back',
    holdsBack: 'quiet resentment accumulating where honest words were needed',
  },
}

export type Relation =
  | /** 用生体 */ 'support'
  | /** 比和 */ 'peer'
  | /** 体克用 */ 'control'
  | /** 体生用 */ 'drain'
  | /** 用克体 */ 'attack'

/** Moving line 1–3 lives in the lower trigram; 4–6 in the upper. */
export function bodyUseSplit(hex: HexagramResult): { bodyNo: number; useNo: number } {
  const useIsLower = hex.movingYao <= 3
  return {
    bodyNo: useIsLower ? hex.upperTrigram : hex.lowerTrigram,
    useNo: useIsLower ? hex.lowerTrigram : hex.upperTrigram,
  }
}

export function relationOf(bodyNo: number, useNo: number): Relation {
  const b = TRIGRAM_IMAGES[bodyNo].element
  const u = TRIGRAM_IMAGES[useNo].element
  if (b === u) return 'peer'
  if (GENERATES[u] === b) return 'support'
  if (OVERCOMES[u] === b) return 'attack'
  if (GENERATES[b] === u) return 'drain'
  return 'control'
}

/** The moving line's stage semantics, from the Zhouyi line positions. */
export const YAO_STAGE: Record<number, string> = {
  1: 'This matter is at the sprout stage — start smaller than feels satisfying: one low-cost probe beats one grand commitment.',
  2: 'The matter sits in its steady middle, on your own ground — build on what already works before reaching further.',
  3: 'The situation stands on a fault line between inner and outer — verify everything once more before moving; half the risk here is bad information.',
  4: 'You are close to the decision-makers, on uncomfortable ground — advance by invitation: get explicitly asked, or explicitly ask.',
  5: 'This is the seat of command, the strongest position in the reading — make the call yourself and own it out loud.',
  6: 'The matter has reached its extreme and is turning — aim to close and consolidate, not to open anything new.',
}

export interface RelationCopy {
  /** Tone sentence appended after the use-trigram situation. */
  presentTone: string
  /** The block, specific to this body/use dynamic. */
  block: string
  /** Direction phrase after the changed-hexagram keyword. */
  move: string
  /** Concrete strategies; every one carries a time anchor. */
  actions: string[]
  /** Clear leaning verdict — the street-reader's unambiguous call. */
  verdict: string
  /** Follow-up deepening sentence (lowercase start, fits after "here"). */
  followupDeep: string
  followupClose: string
}

export const RELATION_COPY: Record<Relation, RelationCopy> = {
  support: {
    presentTone: 'The outside force here is feeding your position, not fighting it.',
    block:
      'the block is under-asking — the support on the table goes unclaimed because part of you is still waiting for a risk-free version of this',
    move: 'the help forming around you does most of the carrying',
    actions: [
      'the move that fits this reading is a response, not more deliberation — give your answer within 48 hours while the support is flowing',
      'this week, claim the help being offered: one concrete yes — a meeting booked, a message sent, a hand taken — instead of three half-maybes',
      'line up the supporting pieces within the next three days — the person, the resource, the green light — and let them carry the weight with you',
    ],
    verdict: 'The reading leans Yes — conditions favor you, and the door is open if you walk through it soon.',
    followupDeep:
      'the support around this is real but conditional — it moves when you move, so the next 72 hours are about one visible step, not a better plan',
    followupClose: 'Accept the help already within reach.',
  },
  peer: {
    presentTone: 'The two sides of this move together without friction — same substance, same direction.',
    block:
      'nothing outside is blocking this; the drag is internal — you keep re-litigating a direction that is already clear',
    move: 'the road stays smooth as long as you keep your own pace even',
    actions: [
      'set a decision time within 48 hours and keep it — conditions this even will not wait around forever',
      'the direct version of what you want is the version that works: say it plainly this week, without packaging',
      'keep the pace even this week: one small steady step per day beats a single big swing',
    ],
    verdict: 'Leans Yes, slowly — nothing opposes you here, but nothing will hurry either; a plain ask moves it fastest.',
    followupDeep:
      'smooth conditions reward plainness — the simple, direct form of what you want is the one that works',
    followupClose: 'Keep it simple and keep moving.',
  },
  control: {
    presentTone: 'You hold the stronger hand here — but taking what you want will cost deliberate effort.',
    block:
      'the block is trying to win by pressure what needs to be won by leverage — every brute push burns strength you will want later',
    move: 'each deliberate, well-aimed push converts directly into progress',
    actions: [
      'trade force for leverage this week: find the one thing the other side actually needs, and offer it',
      'name your position once, clearly, within 48 hours — then hold it without repeating yourself',
      'budget your energy like money this week: spend it on the one decisive move, not on daily skirmishes',
    ],
    verdict: 'Yes, but earned — you hold the stronger hand, and the win comes through leverage, not luck.',
    followupDeep:
      'you are stronger than the situation, and that is exactly the trap — spend leverage, not strength',
    followupClose: 'Use leverage, not force.',
  },
  drain: {
    presentTone: 'Your energy is flowing out of you faster than it returns — this situation lives on your giving.',
    block:
      'the block is over-giving: you are carrying costs that are not yours to carry, and the outflow is quietly hollowing out your position',
    move: 'the moment you stop over-giving, the flow reverses in your favor',
    actions: [
      'put a boundary on it this week: name one thing you stop doing or paying for, and let the other side feel it',
      'ask for something back within 48 hours — one concrete return before you give another inch',
      'cut the giving to what is strictly needed for two weeks, and watch who steps up when your effort stops covering the gap',
    ],
    verdict: 'Not as asked — what you want will cost more than it returns right now; renegotiate the terms before you commit.',
    followupDeep:
      'every extra round of giving costs double now — decide what is enough, deliver exactly that, and stop',
    followupClose: 'Protect your energy like a budget.',
  },
  attack: {
    presentTone: 'The external pressure in this reading is real, and it is aimed squarely at your position.',
    block:
      'the block is your instinct to prove strength inside a fight shaped by someone else — meeting it head-on only feeds it',
    move: 'the pressure eases as soon as you stop standing in its line',
    actions: [
      'do not counter-attack; step sideways this week — reduce exposure, buy time, and change the ground the fight stands on',
      'protect the core first: within 48 hours, secure the one thing you cannot afford to lose, then let the noise pass',
      'choose one channel — the person or route that actually decides this — and work only that, quietly, for the next two weeks',
    ],
    verdict: 'Not this way — forcing it now backfires; the same goal stays reachable once the ground changes.',
    followupDeep:
      'the pressure is built to make you move first — stillness plus one well-chosen channel beats three reactive ones',
    followupClose: 'Choose your ground before you speak.',
  },
}

// ── 应期 (timing window) ─────────────────────────────────────
// Shao Yong reads "when" from the trigram numbers and the speed
// of the body/use dynamic: generation moves fast, overcoming
// slow. Same math here, expressed in days/weeks/months.

/** How fast this relation tends to resolve, in days per base unit. */
const RELATION_SPEED: Record<Relation, number> = {
  support: 0.5,
  peer: 0.8,
  control: 1.2,
  drain: 1.6,
  attack: 1.6,
}

const TIMING_TAIL: Record<Relation, string> = {
  support: 'the window is open, so move inside it',
  peer: 'steady motion inside that window pays',
  control: 'it lands when you make the decisive push, not before',
  drain: 'it lands once you stop over-giving',
  attack: 'it lands after the pressure passes, not during',
}

export function timingWindow(hex: HexagramResult, relation: Relation): string {
  // 先天卦数之和 + 动爻: 3–22, the classic base for reading a date.
  const base = hex.upperTrigram + hex.lowerTrigram + hex.movingYao
  const mid = base * RELATION_SPEED[relation]
  const low = Math.max(2, Math.round(mid * 0.7))
  const high = Math.max(low + 3, Math.round(mid * 1.4))
  const tail = TIMING_TAIL[relation]

  if (high <= 14) return `Expect the turn within ${low}–${high} days — ${tail}.`
  if (high <= 42) {
    const wl = Math.max(1, Math.round(low / 7))
    const wh = Math.max(wl + 1, Math.round(high / 7))
    return `Expect movement within ${wl}–${wh} weeks — ${tail}.`
  }
  const ml = Math.max(1, Math.round(low / 30))
  const mh = Math.max(ml + 1, Math.round(high / 30))
  return `Expect the shift within ${ml}–${mh} months — ${tail}.`
}

/** Trim a question for quoting; keeps the original wording intact. */
export function cleanQuestion(q: string): string {
  const t = q.trim().replace(/\s+/g, ' ')
  if (t.length <= 110) return t
  return t.slice(0, 107).replace(/[,;:\s]+\S*$/, '') + '…'
}
