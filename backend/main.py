# ─────────────────────────────────────────────────────────────
# Answer Card — FastAPI entrypoint.
#
# Routers:
#   /questions   — cast a hexagram, follow-ups
#   /payments    — PayPal Checkout + Webhook
# ─────────────────────────────────────────────────────────────
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("answer_card")

settings = get_settings()

app = FastAPI(
    title="Answer Card API",
    version="1.0.0",
    description="Mei Hua Yi Shu divination backend — DeepSeek + PayPal",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "answer-card", "version": "1.0.0"}


# Register routers (imported lazily so config errors surface at startup).
from routers import questions, payments  # noqa: E402

app.include_router(questions.router, prefix="/questions", tags=["questions"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])


@app.on_event("startup")
async def _startup() -> None:
    logger.info("Answer Card backend up · DeepSeek=%s · PayPal=%s · Supabase=%s",
                bool(settings.deepseek_api_key),
                bool(settings.paypal_client_id),
                bool(settings.supabase_url))
