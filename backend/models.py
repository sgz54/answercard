# ─────────────────────────────────────────────────────────────
# Pydantic models — mirror frontend src/types/index.ts exactly
# so the JSON contract is 1:1 with the React app.
# ─────────────────────────────────────────────────────────────
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ── Enums ────────────────────────────────────────────────────
QuestionType = Literal["relationship", "career", "decision", "other"]
CastMode = Literal["time", "coin"]
PlanId = Literal["free", "monthly"]
ProductId = Literal["unlock", "monthly", "followup-pack"]

# CoinThrow = [3,3,2] style triple (heads=3, tails=2)
CoinThrow = List[int]


class LunarDate(BaseModel):
    year: int
    month: int
    day: int
    hourBranch: int


class HexagramResult(BaseModel):
    primaryNo: int
    changedNo: int
    movingYao: int
    lines: List[bool]
    changedLines: List[bool]
    upperTrigram: int
    lowerTrigram: int
    shichenIndex: int
    castMode: CastMode
    coinTosses: Optional[List[CoinThrow]] = None
    lunar: LunarDate


class Interpretation(BaseModel):
    present: str
    block: str
    next: str
    action: str
    verdict: str
    timing: str
    other: Optional[str] = None


class Question(BaseModel):
    id: str
    questionText: str
    questionType: QuestionType
    hexagram: HexagramResult
    interpretation: Interpretation
    isUnlocked: bool = False
    createdAt: str


class FollowUp(BaseModel):
    id: str
    questionId: str
    userMessage: str
    aiResponse: str
    createdAt: str


# ── Request bodies ──────────────────────────────────────────
class AskInput(BaseModel):
    """POST /questions body — matches frontend AskInput."""
    questionText: str
    castTime: str  # ISO 8601
    coinTosses: Optional[List[CoinThrow]] = None


class FollowUpInput(BaseModel):
    """POST /questions/{id}/follow-ups body."""
    message: str
    # Optional prior history for grounding (the frontend already sends context).
    history: Optional[List[FollowUp]] = None


# ── Payment requests/responses ───────────────────────────────
class CheckoutRequest(BaseModel):
    product: ProductId
    questionId: Optional[str] = None


class CheckoutResponse(BaseModel):
    url: str  # PayPal approval URL to redirect to
    sessionId: str  # PayPal order ID


class CaptureResponse(BaseModel):
    ok: bool
    product: Optional[ProductId] = None
    isUnlocked: Optional[bool] = None


class PurchaseResult(BaseModel):
    ok: bool
    plan: Optional[PlanId] = None
    isUnlocked: Optional[bool] = None
    followupCredits: Optional[int] = None
