# ─────────────────────────────────────────────────────────────
# Supabase client singleton.
#
# Tables (see schema.sql):
#   questions   — one row per cast
#   followups   — follow-up Q&A tied to a question
#   users       — entitlement ledger (plan, credits, daily counts)
#
# The service-role key is used server-side; RLS is NOT relied on
# here because all writes come from the trusted backend.
# ─────────────────────────────────────────────────────────────
import logging
from typing import Any, Dict, List, Optional

from config import get_settings

logger = logging.getLogger("answer_card.db")

_settings = get_settings()

# Defer client creation until first use so the server can start
# even when Supabase env vars are absent (dev / dry-run mode).
_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not _settings.supabase_url or not _settings.supabase_service_key:
        logger.warning("Supabase not configured — running in-memory mode (no persistence)")
        return None
    try:
        from supabase import create_client
        _client = create_client(_settings.supabase_url, _settings.supabase_service_key)
        logger.info("Supabase client connected to %s", _settings.supabase_url)
    except Exception as exc:  # pragma: no cover
        logger.error("Failed to create Supabase client: %s", exc)
    return _client


# ── In-memory fallback store (dev only) ──────────────────────
# When Supabase isn't configured, we keep a per-process dict so
# the API still works for local development and tests.
_memory: Dict[str, Dict[str, Any]] = {
    "questions": {},
    "followups": {},
    "users": {},  # keyed by a synthetic user id ("local")
}


def _local_user_id() -> str:
    """No auth in MVP — every request is treated as one local user."""
    return "local"


# ── Questions ────────────────────────────────────────────────

# DB columns are snake_case; the API contract is camelCase. Map
# explicitly (hexagram/interpretation are JSONB blobs, stored as-is).
_Q_TO_ROW = {
    "id": "id",
    "questionText": "question_text",
    "questionType": "question_type",
    "isUnlocked": "is_unlocked",
    "createdAt": "created_at",
}
_Q_FROM_ROW = {v: k for k, v in _Q_TO_ROW.items()}


def _question_to_row(q: Dict[str, Any]) -> Dict[str, Any]:
    row = {db_key: q[api_key] for api_key, db_key in _Q_TO_ROW.items() if api_key in q}
    row["hexagram"] = q["hexagram"]
    row["interpretation"] = q["interpretation"]
    return row


def _question_from_row(row: Dict[str, Any]) -> Dict[str, Any]:
    q = {api_key: row[db_key] for db_key, api_key in _Q_FROM_ROW.items() if db_key in row}
    q["hexagram"] = row["hexagram"]
    q["interpretation"] = row["interpretation"]
    return q


def insert_question(question: Dict[str, Any]) -> Dict[str, Any]:
    client = _get_client()
    if client is None:
        _memory["questions"][question["id"]] = question
        return question
    try:
        client.table("questions").insert(_question_to_row(question)).execute()
    except Exception as exc:
        # Table missing (schema not yet created) — fall back to memory
        # so the dev flow still works. Remove this once schema.sql runs.
        if "Could not find the table" in str(exc):
            logger.warning("questions table missing — falling back to in-memory store")
            _memory["questions"][question["id"]] = question
            return question
        raise
    return question


def get_question(question_id: str) -> Optional[Dict[str, Any]]:
    client = _get_client()
    if client is None:
        return _memory["questions"].get(question_id)
    resp = client.table("questions").select("*").eq("id", question_id).execute()
    return _question_from_row(resp.data[0]) if resp.data else None


def update_question_unlocked(question_id: str, is_unlocked: bool = True) -> None:
    client = _get_client()
    if client is None:
        if question_id in _memory["questions"]:
            _memory["questions"][question_id]["isUnlocked"] = is_unlocked
        return
    client.table("questions").update({"is_unlocked": is_unlocked}).eq("id", question_id).execute()


# ── Follow-ups ───────────────────────────────────────────────

_F_TO_ROW = {
    "id": "id",
    "questionId": "question_id",
    "userMessage": "user_message",
    "aiResponse": "ai_response",
    "createdAt": "created_at",
}
_F_FROM_ROW = {v: k for k, v in _F_TO_ROW.items()}


def insert_followup(followup: Dict[str, Any]) -> Dict[str, Any]:
    client = _get_client()
    if client is None:
        _memory["followups"][followup["id"]] = followup
        return followup
    row = {db_key: followup[api_key] for api_key, db_key in _F_TO_ROW.items() if api_key in followup}
    client.table("followups").insert(row).execute()
    return followup


def list_followups(question_id: str) -> List[Dict[str, Any]]:
    client = _get_client()
    if client is None:
        return [f for f in _memory["followups"].values() if f["questionId"] == question_id]
    resp = client.table("followups").select("*").eq("question_id", question_id).order("created_at").execute()
    return [
        {api_key: row[db_key] for db_key, api_key in _F_FROM_ROW.items() if db_key in row}
        for row in (resp.data or [])
    ]


# ── User entitlements ───────────────────────────────────────

_U_TO_ROW = {
    "id": "id",
    "plan": "plan",
    "followupCredits": "followup_credits",
    "dailyDate": "daily_date",
    "dailyUsed": "daily_used",
}
_U_FROM_ROW = {v: k for k, v in _U_TO_ROW.items()}


def _user_from_row(row: Dict[str, Any]) -> Dict[str, Any]:
    return {api_key: row[db_key] for db_key, api_key in _U_FROM_ROW.items() if db_key in row}


def get_user(user_id: Optional[str] = None) -> Dict[str, Any]:
    uid = user_id or _local_user_id()
    client = _get_client()
    if client is None:
        return _memory["users"].setdefault(uid, {
            "id": uid,
            "plan": "free",
            "followupCredits": 0,
            "dailyDate": "",
            "dailyUsed": 0,
        })
    resp = client.table("users").select("*").eq("id", uid).execute()
    if resp.data:
        return _user_from_row(resp.data[0])
    new = {"id": uid, "plan": "free", "followupCredits": 0, "dailyDate": "", "dailyUsed": 0}
    row = {db_key: new[api_key] for api_key, db_key in _U_TO_ROW.items()}
    client.table("users").insert(row).execute()
    return new


def update_user(user_id: Optional[str], fields: Dict[str, Any]) -> None:
    uid = user_id or _local_user_id()
    client = _get_client()
    row = {db_key: fields[api_key] for api_key, db_key in _U_TO_ROW.items() if api_key in fields}
    if client is None:
        _memory["users"][uid].update(fields)
        return
    client.table("users").update(row).eq("id", uid).execute()
