# ─────────────────────────────────────────────────────────────
# Interpretation engine — DeepSeek primary, local rule system fallback.
#
# The local rule system is a Python port of the frontend
# services/interpret.ts and binds every sentence to the user's
# actual question. When DeepSeek is configured, the local output
# is used as structured context for the LLM prompt, and the LLM
# response is returned in the same 7-field shape.
# ─────────────────────────────────────────────────────────────
import json
import logging
import re
from typing import Dict, List, Optional

import httpx

from config import get_settings
from data.hexagrams import HEXAGRAMS
from data.yijing import (
    TRIGRAM_IMAGES,
    body_use_split,
    relation_of,
    YAO_STAGE,
    RELATION_COPY,
    timing_window,
    clean_question,
    RELATIONS,
)

logger = logging.getLogger("answer_card.interpret")
settings = get_settings()

OTHER_RE = re.compile(
    r"\b(he|she|him|her|his|hers|they|them|their)\b"
    r"|\bmy (wife|husband|partner|girlfriend|boyfriend|ex|boss|manager|"
    r"mom|mother|dad|father|friend|bestie|crush|roommate|brother|sister|"
    r"son|daughter|colleague|coworker|landlord|client)\b",
    re.IGNORECASE,
)


def infer_question_type(text: str) -> str:
    t = text.lower()
    if re.search(r"(love|girlfriend|boyfriend|partner|wife|husband|marry|marriage|"
                 r"divorce|crush|date|dating|relationship|break.?up|heartbreak|"
                 r"\bex\b|\btext(ing)?\b|\bher\b|\bhim\b)", t):
        return "relationship"
    if re.search(r"(job|offer|salary|boss|work|career|promotion|interview|"
                 r"resign|quit|startup|colleague|raise|business|company|hire|fire|freelance)", t):
        return "career"
    if re.search(r"(move|moving|buy|sell|house|apartment|invest|relocat|"
                 r"choose|decision|decide|between|sign|contract)", t):
        return "decision"
    return "other"


# ── Local rule system (fallback / context builder) ──────────

def build_local_interpretation(hexagram: dict, question_text: str) -> dict:
    """Python port of buildInterpretation() — the deterministic rule system."""
    q = clean_question(question_text)
    body_no, use_no = body_use_split(_HexProxy(hexagram))
    relation = relation_of(body_no, use_no)
    copy = RELATION_COPY[relation]
    use_image = TRIGRAM_IMAGES[use_no]
    body_image = TRIGRAM_IMAGES[body_no]

    reading = HEXAGRAMS[hexagram["primaryNo"]]
    changed = HEXAGRAMS[hexagram["changedNo"]]
    stage = YAO_STAGE[hexagram["movingYao"]]

    seed = hexagram["primaryNo"] * 7 + hexagram["changedNo"] * 3 + hexagram["movingYao"] + len(question_text)
    action = copy.actions[seed % len(copy.actions)]

    return {
        "present": f"You asked, \u201C{q}\u201D — {use_image.as_situation}. {copy.present_tone}",
        "block": f"The reading is specific here: {copy.block}, and right now {body_image.as_self}.",
        "next": f"{stage} The road ahead bends toward \u201C{changed.keyword}\u201D — {copy.move}.",
        "action": f"On \u201C{q}\u201D — {action}. {reading.virtue}",
        "verdict": copy.verdict,
        "timing": timing_window(_HexProxy(hexagram), relation),
        "other": (
            f"The one you\u2019re asking about comes across as {use_image.as_other}; "
            f"what holds them back is {use_image.holds_back}."
            if OTHER_RE.search(question_text) else None
        ),
    }


class _HexProxy:
    """Light adapter so yijing.py functions accept a plain dict hexagram."""
    def __init__(self, h: dict):
        self.upperTrigram = h["upperTrigram"]
        self.lowerTrigram = h["lowerTrigram"]
        self.movingYao = h["movingYao"]
        self.primaryNo = h["primaryNo"]
        self.changedNo = h["changedNo"]


LEADINS = [
    "Staying in the same reading —",
    "Going one level deeper —",
    "The signs on this have not moved —",
    "Same pattern, sharper focus —",
]


def build_local_followup(question: dict, history_count: int, message: str) -> str:
    body_no, use_no = body_use_split(_HexProxy(question["hexagram"]))
    rel = relation_of(body_no, use_no)
    if rel not in RELATIONS:
        rel = "peer"
    copy = RELATION_COPY[rel]
    m = clean_question(message)
    lead = LEADINS[(history_count + len(m)) % len(LEADINS)]
    return f"{lead} \u201C{m}\u201D — here {copy.followup_deep}. {copy.followup_close}"


# ── DeepSeek integration ────────────────────────────────────

_SYSTEM_PROMPT = """You are a street divination reader for Answer Card, a Mei Hua Yi Shu (plum blossom numerology) service.
You receive a hexagram cast and the user's question, plus a structured analysis from the rule system.
Your job: rewrite the analysis into the user's own language — vivid, concrete, never hedged.

Rules:
- Bind every sentence to the user's actual question. Quote their wording back.
- Never use the words "destiny", "fate", or traditional Chinese terms (体用, 生克, 五行).
- Each field must be 1-3 sentences. Specific, not vague.
- The verdict must be an unambiguous lean (Yes / No / Not yet / Wait), never "it depends".
- If the question names a third person (he/she/my boss/my ex), fill "other" with their portrait.
- If no third person is named, set "other" to null.
- Keep the tone of a confident street reader: warm, direct, no mystical jargon.

Return ONLY a JSON object with exactly these keys:
{present, block, next, action, verdict, timing, other}
"""

_FOLLOWUP_SYSTEM_PROMPT = """You are a street divination reader for Answer Card, a Mei Hua Yi Shu (plum blossom numerology) service.
The user is asking a follow-up question about a reading they already received.

Rules:
- Reply in PLAIN prose (2-4 sentences). Never output JSON, lists, or headings.
- Bind your reply to their follow-up message; quote their wording back.
- Stay grounded in the original hexagram's meaning.
- Never use the words "destiny", "fate", or traditional Chinese terms (体用, 生克, 五行).
- Keep the tone of a confident street reader: warm, direct, no mystical jargon.
"""


def _build_user_prompt(hexagram: dict, question_text: str, local: dict) -> str:
    reading = HEXAGRAMS[hexagram["primaryNo"]]
    changed = HEXAGRAMS[hexagram["changedNo"]]
    body_no, use_no = body_use_split(_HexProxy(hexagram))
    relation = relation_of(body_no, use_no)
    return (
        f"User question: {question_text}\n\n"
        f"Primary hexagram #{hexagram['primaryNo']}: {reading.name} — {reading.keyword}.\n"
        f"Changed hexagram #{hexagram['changedNo']}: {changed.name} — {changed.keyword}.\n"
        f"Moving line position: {hexagram['movingYao']} (1=bottom, 6=top).\n"
        f"Body/use relation: {relation}.\n\n"
        f"Rule-system draft (use as context, rewrite in your own words):\n"
        f"{json.dumps(local, indent=2)}\n\n"
        f"Now produce the final 7-field JSON."
    )


async def build_interpretation(hexagram: dict, question_text: str) -> dict:
    """
    Returns an Interpretation dict.
    DeepSeek is primary; local rule system is the fallback when the
    API key is missing or the call fails.
    """
    local = build_local_interpretation(hexagram, question_text)

    if not settings.deepseek_api_key:
        logger.info("DEEPSEEK_API_KEY not set — using local rule system")
        return local

    user_prompt = _build_user_prompt(hexagram, question_text, local)
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.deepseek_base_url}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.deepseek_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.deepseek_model,
                    "messages": [
                        {"role": "system", "content": _SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            # Ensure all 7 keys exist; fall back to local for missing ones.
            for key in ("present", "block", "next", "action", "verdict", "timing"):
                if not parsed.get(key):
                    parsed[key] = local[key]
            parsed.setdefault("other", local.get("other"))
            logger.info("DeepSeek interpretation generated for question len=%d", len(question_text))
            return parsed
    except Exception as exc:
        logger.warning("DeepSeek call failed (%s) — falling back to local rule system", exc)
        return local


async def build_followup_response(
    question: dict,
    history_count: int,
    message: str,
) -> str:
    """DeepSeek-grounded follow-up; local rule system as fallback."""
    local_text = build_local_followup(question, history_count, message)

    if not settings.deepseek_api_key:
        return local_text

    reading = HEXAGRAMS[question["hexagram"]["primaryNo"]]
    prompt = (
        f"Original question: {question['questionText']}\n"
        f"Primary hexagram: {reading.name} — {reading.keyword}.\n"
        f"Rule-system draft for this follow-up: {local_text}\n\n"
        f"User's follow-up message: {message}\n\n"
        f"Reply in 2-4 sentences, same warm direct street-reader voice. "
        f"Bind it to their follow-up message. No mystical jargon, no 'destiny'/'fate'."
    )
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.deepseek_base_url}/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.deepseek_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.deepseek_model,
                    "messages": [
                        {"role": "system", "content": _FOLLOWUP_SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        logger.warning("DeepSeek follow-up failed (%s) — using local text", exc)
        return local_text
