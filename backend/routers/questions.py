# ─────────────────────────────────────────────────────────────
# Questions router — cast hexagram, generate interpretation,
# store in Supabase, return full Question record.
#
# Endpoints:
#   POST /questions                 → cast + interpret
#   POST /questions/{id}/follow-ups → AI follow-up
#   GET  /questions                 → list user's casts (newest first)
# ─────────────────────────────────────────────────────────────
import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
import pydantic

from models import AskInput, Question, FollowUp, FollowUpInput
from services.divination import cast_by_time, cast_by_coins
from services.interpret import build_interpretation, build_followup_response, infer_question_type
from db import supabase as db

router = APIRouter()
logger = logging.getLogger("answer_card.questions")


def _parse_cast_time(cast_time: str) -> datetime:
    """Parse ISO 8601 → datetime (tz-aware if offset present)."""
    # Strip a trailing Z and replace with +00:00 for fromisoformat compat.
    iso = cast_time.replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(iso)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid castTime: {cast_time}")
    # If tz-naive, assume local time.
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


@router.post("", response_model=Question)
@router.post("/", response_model=Question, include_in_schema=False)
async def ask_question(input: AskInput):
    """Cast a hexagram and generate the interpretation."""
    cast_time = _parse_cast_time(input.castTime)

    # Cast: coin mode if coinTosses provided, else time mode.
    if input.coinTosses:
        hexagram = cast_by_coins(input.coinTosses, cast_time)
    else:
        hexagram = cast_by_time(cast_time)

    # Interpret (DeepSeek primary, local rule system fallback).
    interpretation = await build_interpretation(hexagram, input.questionText)

    question = Question(
        id=str(uuid.uuid4()),
        questionText=input.questionText,
        questionType=infer_question_type(input.questionText),
        hexagram=hexagram,
        interpretation=interpretation,
        isUnlocked=False,
        createdAt=datetime.now(timezone.utc).isoformat(),
    )

    # Persist.
    db.insert_question(question.model_dump(mode="json"))
    logger.info("Question created id=%s primary=%d changed=%d",
                question.id, hexagram["primaryNo"], hexagram["changedNo"])
    return question


@router.post("/{question_id}/follow-ups", response_model=FollowUp)
async def send_followup(question_id: str, input: FollowUpInput):
    """Generate an AI follow-up grounded in the original hexagram."""
    question = db.get_question(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Count existing follow-ups for this question (used for seed variety).
    existing = db.list_followups(question_id)
    history_count = len(existing)

    ai_response = await build_followup_response(
        question, history_count, input.message,
    )

    followup = FollowUp(
        id=str(uuid.uuid4()),
        questionId=question_id,
        userMessage=input.message,
        aiResponse=ai_response,
        createdAt=datetime.now(timezone.utc).isoformat(),
    )
    db.insert_followup(followup.model_dump(mode="json"))
    logger.info("Follow-up created id=%s question=%s", followup.id, question_id)
    return followup


@router.get("", response_model=list[Question])
@router.get("/", response_model=list[Question], include_in_schema=False)
async def list_questions(limit: int = 50):
    """List the user's casts, newest first (capped at `limit`)."""
    client = db._get_client()
    if client is None:
        items = list(db._memory["questions"].values())
        items.sort(key=lambda q: q.get("createdAt", ""), reverse=True)
        return items[:limit]
    resp = client.table("questions").select("*").order("created_at", desc=True).limit(limit).execute()
    return [db._question_from_row(row) for row in (resp.data or [])]
