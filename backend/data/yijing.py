# ─────────────────────────────────────────────────────────────
# Mei Hua Yi Shu interpretation core (internal only — the UI
# never shows traditional vocabulary).
#
# Ported from src/data/yijing.ts — keep in sync.
# ─────────────────────────────────────────────────────────────
import re
import math
from typing import Dict, List, Optional, Tuple


Element = str  # 'metal' | 'wood' | 'water' | 'fire' | 'earth'

GENERATES: Dict[Element, Element] = {
    "metal": "water",
    "water": "wood",
    "wood":  "fire",
    "fire":  "earth",
    "earth": "metal",
}

OVERCOMES: Dict[Element, Element] = {
    "metal": "wood",
    "wood":  "earth",
    "earth": "water",
    "water": "fire",
    "fire":  "metal",
}


class TrigramImage:
    __slots__ = ("element", "as_situation", "as_self", "as_other", "holds_back")

    def __init__(self, element: Element, as_situation: str, as_self: str,
                 as_other: str, holds_back: str):
        self.element = element
        self.as_situation = as_situation
        self.as_self = as_self
        self.as_other = as_other
        self.holds_back = holds_back


# 八卦类象, keyed by 先天八卦数.
TRIGRAM_IMAGES: Dict[int, TrigramImage] = {
    1: TrigramImage(
        "metal",
        "the situation is formal and high-stakes, governed by hierarchy, rules and a clear power structure",
        "you are in a strong, take-charge state, holding more authority than you realize",
        "principled and self-assured — someone who moves by rules and position, not by impulse",
        "pride and the fear of losing face",
    ),
    2: TrigramImage(
        "metal",
        "the situation runs on words — conversation, promises and negotiation, with pleasant surfaces that still need verifying",
        "you are in a light, talkative, agreeable mood, more ready to please than to push",
        "charming and easy to talk to; their promises come easier than their follow-through",
        "the wish to keep things pleasant rather than real",
    ),
    3: TrigramImage(
        "fire",
        "everything is out in the open and moving fast — visibility, attention, quick bright developments that can also burn quick",
        "you are sharp, exposed, and reacting faster than is good for you",
        "expressive and warm in the moment — what they feel shows immediately",
        "the fact that their heat cools as fast as it ignites",
    ),
    4: TrigramImage(
        "wood",
        "events are moving fast and loudly — news, surprises, and things being shaken loose around you",
        "you are restless and primed to act, carrying more momentum than patience",
        "impulsive and direct; they act first and sort the feelings out later",
        "the honest truth that they do not know their own mind yet",
    ),
    5: TrigramImage(
        "wood",
        "things are advancing quietly and indirectly — through details, documents and backchannels rather than open moves",
        "you are watching, flexible, and quietly working your angles",
        "indirect — hints, side doors, and messages that never quite say the thing outright",
        "conflict avoidance; they would rather drift than decide",
    ),
    6: TrigramImage(
        "water",
        "the situation carries hidden depths — unclear information, emotional undercurrents, and real risk under a calm surface",
        "your mind is heavy and circling the same worries, seeing the danger more clearly than the way out",
        "guarded and hard to read; their feelings stay underwater",
        "distrust — they test before they open up",
    ),
    7: TrigramImage(
        "earth",
        "the situation has hit a wall and stands still — a boundary, a silence, a door that is not opening",
        "part of you wants to stop and hold ground, and that instinct is half right",
        "still and stubborn; they move only when they themselves decide to",
        "their own timetable, which ignores yours entirely",
    ),
    8: TrigramImage(
        "earth",
        "the situation is slow, practical and grounded — moving at its own pace, fed steadily rather than forced",
        "you are tired and grounded, holding a lot quietly",
        "steady and accommodating; they absorb pressure rather than push back",
        "quiet resentment accumulating where honest words were needed",
    ),
}


# Relation types: support / peer / control / drain / attack
Relation = str

RELATIONS: List[str] = ["support", "peer", "control", "drain", "attack"]


def body_use_split(hex_result) -> Tuple[int, int]:
    """Moving line 1–3 lives in the lower trigram; 4–6 in the upper."""
    use_is_lower = hex_result.movingYao <= 3
    body_no = hex_result.upperTrigram if use_is_lower else hex_result.lowerTrigram
    use_no = hex_result.lowerTrigram if use_is_lower else hex_result.upperTrigram
    return body_no, use_no


def relation_of(body_no: int, use_no: int) -> Relation:
    b = TRIGRAM_IMAGES[body_no].element
    u = TRIGRAM_IMAGES[use_no].element
    if b == u:
        return "peer"
    if GENERATES[u] == b:
        return "support"
    if OVERCOMES[u] == b:
        return "attack"
    if GENERATES[b] == u:
        return "drain"
    return "control"


# The moving line's stage semantics, from the Zhouyi line positions.
YAO_STAGE: Dict[int, str] = {
    1: "This matter is at the sprout stage — start smaller than feels satisfying: one low-cost probe beats one grand commitment.",
    2: "The matter sits in its steady middle, on your own ground — build on what already works before reaching further.",
    3: "The situation stands on a fault line between inner and outer — verify everything once more before moving; half the risk here is bad information.",
    4: "You are close to the decision-makers, on uncomfortable ground — advance by invitation: get explicitly asked, or explicitly ask.",
    5: "This is the seat of command, the strongest position in the reading — make the call yourself and own it out loud.",
    6: "The matter has reached its extreme and is turning — aim to close and consolidate, not to open anything new.",
}


class RelationCopy:
    __slots__ = ("present_tone", "block", "move", "actions",
                 "verdict", "followup_deep", "followup_close")

    def __init__(self, present_tone: str, block: str, move: str,
                 actions: List[str], verdict: str,
                 followup_deep: str, followup_close: str):
        self.present_tone = present_tone
        self.block = block
        self.move = move
        self.actions = actions
        self.verdict = verdict
        self.followup_deep = followup_deep
        self.followup_close = followup_close


RELATION_COPY: Dict[Relation, RelationCopy] = {
    "support": RelationCopy(
        "The outside force here is feeding your position, not fighting it.",
        "the block is under-asking — the support on the table goes unclaimed because part of you is still waiting for a risk-free version of this",
        "the help forming around you does most of the carrying",
        [
            "the move that fits this reading is a response, not more deliberation — give your answer within 48 hours while the support is flowing",
            "this week, claim the help being offered: one concrete yes — a meeting booked, a message sent, a hand taken — instead of three half-maybes",
            "line up the supporting pieces within the next three days — the person, the resource, the green light — and let them carry the weight with you",
        ],
        "The reading leans Yes — conditions favor you, and the door is open if you walk through it soon.",
        "the support around this is real but conditional — it moves when you move, so the next 72 hours are about one visible step, not a better plan",
        "Accept the help already within reach.",
    ),
    "peer": RelationCopy(
        "The two sides of this move together without friction — same substance, same direction.",
        "nothing outside is blocking this; the drag is internal — you keep re-litigating a direction that is already clear",
        "the road stays smooth as long as you keep your own pace even",
        [
            "set a decision time within 48 hours and keep it — conditions this even will not wait around forever",
            "the direct version of what you want is the version that works: say it plainly this week, without packaging",
            "keep the pace even this week: one small steady step per day beats a single big swing",
        ],
        "Leans Yes, slowly — nothing opposes you here, but nothing will hurry either; a plain ask moves it fastest.",
        "smooth conditions reward plainness — the simple, direct form of what you want is the one that works",
        "Keep it simple and keep moving.",
    ),
    "control": RelationCopy(
        "You hold the stronger hand here — but taking what you want will cost deliberate effort.",
        "the block is trying to win by pressure what needs to be won by leverage — every brute push burns strength you will want later",
        "each deliberate, well-aimed push converts directly into progress",
        [
            "trade force for leverage this week: find the one thing the other side actually needs, and offer it",
            "name your position once, clearly, within 48 hours — then hold it without repeating yourself",
            "budget your energy like money this week: spend it on the one decisive move, not on daily skirmishes",
        ],
        "Yes, but earned — you hold the stronger hand, and the win comes through leverage, not luck.",
        "you are stronger than the situation, and that is exactly the trap — spend leverage, not strength",
        "Use leverage, not force.",
    ),
    "drain": RelationCopy(
        "Your energy is flowing out of you faster than it returns — this situation lives on your giving.",
        "the block is over-giving: you are carrying costs that are not yours to carry, and the outflow is quietly hollowing out your position",
        "the moment you stop over-giving, the flow reverses in your favor",
        [
            "put a boundary on it this week: name one thing you stop doing or paying for, and let the other side feel it",
            "ask for something back within 48 hours — one concrete return before you give another inch",
            "cut the giving to what is strictly needed for two weeks, and watch who steps up when your effort stops covering the gap",
        ],
        "Not as asked — what you want will cost more than it returns right now; renegotiate the terms before you commit.",
        "every extra round of giving costs double now — decide what is enough, deliver exactly that, and stop",
        "Protect your energy like a budget.",
    ),
    "attack": RelationCopy(
        "The external pressure in this reading is real, and it is aimed squarely at your position.",
        "the block is your instinct to prove strength inside a fight shaped by someone else — meeting it head-on only feeds it",
        "the pressure eases as soon as you stop standing in its line",
        [
            "do not counter-attack; step sideways this week — reduce exposure, buy time, and change the ground the fight stands on",
            "protect the core first: within 48 hours, secure the one thing you cannot afford to lose, then let the noise pass",
            "choose one channel — the person or route that actually decides this — and work only that, quietly, for the next two weeks",
        ],
        "Not this way — forcing it now backfires; the same goal stays reachable once the ground changes.",
        "the pressure is built to make you move first — stillness plus one well-chosen channel beats three reactive ones",
        "Choose your ground before you speak.",
    ),
}


# ── 应期 (timing window) ─────────────────────────────────────
# Shao Yong reads "when" from the trigram numbers and the speed
# of the body/use dynamic: generation moves fast, overcoming slow.

RELATION_SPEED: Dict[Relation, float] = {
    "support": 0.5,
    "peer": 0.8,
    "control": 1.2,
    "drain": 1.6,
    "attack": 1.6,
}

TIMING_TAIL: Dict[Relation, str] = {
    "support": "the window is open, so move inside it",
    "peer": "steady motion inside that window pays",
    "control": "it lands when you make the decisive push, not before",
    "drain": "it lands once you stop over-giving",
    "attack": "it lands after the pressure passes, not during",
}


def timing_window(hex_result, relation: Relation) -> str:
    """Returns the timing window string for an Interpretation."""
    base = hex_result.upperTrigram + hex_result.lowerTrigram + hex_result.movingYao
    mid = base * RELATION_SPEED[relation]
    low = max(2, round(mid * 0.7))
    high = max(low + 3, round(mid * 1.4))
    tail = TIMING_TAIL[relation]

    if high <= 14:
        return f"Expect the turn within {low}\u2013{high} days — {tail}."
    if high <= 42:
        wl = max(1, round(low / 7))
        wh = max(wl + 1, round(high / 7))
        return f"Expect movement within {wl}\u2013{wh} weeks — {tail}."
    ml = max(1, round(low / 30))
    mh = max(ml + 1, round(high / 30))
    return f"Expect the shift within {ml}\u2013{mh} months — {tail}."


def clean_question(q: str) -> str:
    """Trim a question for quoting; keeps the original wording intact."""
    t = re.sub(r"\s+", " ", q.strip())
    if len(t) <= 110:
        return t
    return re.sub(r"[,;:\s]+\S*$", "", t[:107]) + "\u2026"
