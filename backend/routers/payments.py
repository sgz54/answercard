# ─────────────────────────────────────────────────────────────
# Payments router — PayPal Orders API.
#
#   POST /payments/checkout        → create order, return approval URL
#   POST /payments/capture/{id}    → capture approved order + grant entitlements
#   POST /payments/webhook         → PayPal webhook (PAYMENT.CAPTURE.COMPLETED)
# ─────────────────────────────────────────────────────────────
import json
import logging

from fastapi import APIRouter, Request, HTTPException, Response

from models import CheckoutRequest, CheckoutResponse, CaptureResponse
from services import paypal_service
from config import get_settings

router = APIRouter()
logger = logging.getLogger("answer_card.payments")
settings = get_settings()


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(req: CheckoutRequest):
    """Create a PayPal order for a product and return the approval URL."""
    result = paypal_service.create_order(
        product=req.product,
        question_id=req.questionId,
    )
    return CheckoutResponse(url=result["approvalUrl"], sessionId=result["orderId"])


@router.post("/capture/{order_id}", response_model=CaptureResponse)
async def capture_payment(order_id: str):
    """
    Capture an approved PayPal order and grant entitlements.
    Called by the frontend after PayPal redirects back with ?token=ORDER_ID.
    """
    try:
        result = paypal_service.capture_order(order_id)
    except httpx.HTTPStatusError as exc:
        logger.error("PayPal capture failed: %s", exc)
        raise HTTPException(status_code=402, detail="Payment capture failed")
    except Exception as exc:
        logger.error("PayPal capture error: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc))

    return CaptureResponse(
        ok=True,
        product=result.get("product"),
        isUnlocked=(result.get("product") == "unlock"),
    )


@router.post("/webhook")
async def paypal_webhook(request: Request):
    """
    PayPal webhook endpoint. Verifies the webhook ID and processes
    PAYMENT.CAPTURE.COMPLETED events.
    """
    payload = await request.body()
    try:
        event = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    webhook_id = event.get("webhook_id", "")
    if settings.paypal_webhook_id and webhook_id != settings.paypal_webhook_id:
        logger.warning("Rejecting webhook with mismatched webhook_id")
        raise HTTPException(status_code=400, detail="Unknown webhook")

    paypal_service.handle_webhook_event(event)
    logger.info("PayPal webhook processed (type=%s)", event.get("event_type"))
    return Response(status_code=200)


# Imported here so the module is self-contained; httpx is only used
# for the exception type in capture_payment.
import httpx  # noqa: E402
