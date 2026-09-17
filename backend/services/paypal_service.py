# ─────────────────────────────────────────────────────────────
# PayPal service — Orders API v2 (one-time capture).
#
# Flow:
#   1. create_order()         → POST /v2/checkout/orders → approval URL
#   2. user approves on PayPal → redirects back with ?token=ORDER_ID
#   3. capture_order()         → POST .../capture → grant entitlements
#
# Products map directly to USD amounts (no price IDs needed):
#   unlock         $2.99  → unlock one question
#   monthly        $6.99  → 30-day membership (one-time, no auto-renew)
#   followup-pack  $0.99  → 5 follow-up credits
# ─────────────────────────────────────────────────────────────
import logging
from typing import Optional

import httpx

from config import get_settings
from db import supabase as db

logger = logging.getLogger("answer_card.paypal")
settings = get_settings()

BASE_URL = (
    "https://api-m.sandbox.paypal.com"
    if settings.paypal_mode == "sandbox"
    else "https://api-m.paypal.com"
)

PRODUCT_AMOUNT = {
    "unlock": settings.unlock_usd,
    "monthly": settings.monthly_usd,
    "followup-pack": settings.followup_pack_usd,
}

PRODUCT_NAME = {
    "unlock": "Answer Unlock",
    "monthly": "Monthly Membership",
    "followup-pack": "Follow-up Pack",
}


def _access_token() -> str:
    """Fetch a short-lived OAuth access token from PayPal."""
    resp = httpx.post(
        f"{BASE_URL}/v1/oauth2/token",
        auth=(settings.paypal_client_id, settings.paypal_secret),
        data={"grant_type": "client_credentials"},
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def _headers() -> dict:
    token = _access_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def create_order(product: str, question_id: Optional[str] = None) -> dict:
    """
    Creates a PayPal order and returns {"approvalUrl": ..., "orderId": ...}.
    """
    if not (settings.paypal_client_id and settings.paypal_secret):
        # Dev mode with no PayPal configured — return a mock success URL.
        logger.warning("PayPal not configured — returning mock checkout for %s", product)
        return {
            "approvalUrl": f"{settings.frontend_url}/profile?checkout=success&product={product}",
            "orderId": "mock_order",
        }

    amount = PRODUCT_AMOUNT.get(product)
    if amount is None:
        raise ValueError(f"Unknown product: {product}")

    return_url = f"{settings.frontend_url}/profile?checkout=success&product={product}"
    if question_id:
        return_url += f"&question={question_id}"
    cancel_url = f"{settings.frontend_url}/profile?checkout=cancelled"

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "USD",
                    "value": f"{amount:.2f}",
                },
                "description": PRODUCT_NAME[product],
                "custom_id": f"{product}:{question_id or ''}",
            }
        ],
        "application_context": {
            "return_url": return_url,
            "cancel_url": cancel_url,
            "brand_name": "Answer Card",
            "user_action": "PAY_NOW",
        },
    }

    resp = httpx.post(
        f"{BASE_URL}/v2/checkout/orders",
        headers=_headers(),
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    order = resp.json()

    approval_url = next(
        (link["href"] for link in order.get("links", []) if link["rel"] == "approve"),
        None,
    )
    if not approval_url:
        raise RuntimeError(f"No approve link in PayPal order response: {order}")

    logger.info("PayPal order %s created for product=%s", order["id"], product)
    return {"approvalUrl": approval_url, "orderId": order["id"]}


def capture_order(order_id: str) -> dict:
    """
    Captures an approved PayPal order and grants entitlements.
    Returns {"ok": True, "product": ..., "questionId": ...} or raises.
    """
    if order_id == "mock_order":
        # Dev mode: in the mock flow the frontend never calls capture
        # (it applies entitlements locally from the redirect params).
        # This branch only exists so the endpoint doesn't 500 in tests.
        return {"ok": True, "product": None, "questionId": None}

    resp = httpx.post(
        f"{BASE_URL}/v2/checkout/orders/{order_id}/capture",
        headers=_headers(),
        timeout=30,
    )
    resp.raise_for_status()
    capture = resp.json()

    status = capture.get("status")
    if status not in ("COMPLETED", "PARTIALLY_COMPLETED"):
        raise RuntimeError(f"PayPal capture status not completed: {status}")

    # Parse product + question from custom_id.
    custom_id = (
        capture.get("purchase_units", [{}])[0].get("custom_id", "")
        or ""
    )
    product, _, question_id = custom_id.partition(":")
    question_id = question_id or None

    grant_entitlements(product, question_id)
    logger.info("PayPal order %s captured: product=%s question=%s", order_id, product, question_id)
    return {"ok": True, "product": product, "questionId": question_id}


def grant_entitlements(product: str, question_id: Optional[str]) -> None:
    """Updates the user's entitlements after a successful payment."""
    user_id = "local"
    user = db.get_user(user_id) or {}

    if product == "monthly":
        db.update_user(user_id, {"plan": "monthly"})
        logger.info("User %s upgraded to monthly", user_id)

    elif product == "followup-pack":
        new_credits = user.get("followupCredits", 0) + settings.followup_pack_credits
        db.update_user(user_id, {"followupCredits": new_credits})
        logger.info(
            "User %s credited %d follow-up credits (total=%d)",
            user_id,
            settings.followup_pack_credits,
            new_credits,
        )

    elif product == "unlock":
        if question_id:
            db.update_question_unlocked(question_id, True)
            logger.info("Question %s unlocked for user %s", question_id, user_id)
        else:
            logger.warning("Unlock payment without questionId")
    else:
        logger.warning("Unknown product in payment: %s", product)


def handle_webhook_event(event: dict) -> None:
    """Processes a PayPal webhook event (PAYMENT.CAPTURE.COMPLETED)."""
    etype = event.get("event_type", "")
    if etype != "PAYMENT.CAPTURE.COMPLETED":
        logger.info("Ignoring PayPal webhook type: %s", etype)
        return

    resource = event.get("resource", {})
    custom_id = resource.get("custom_id", "") or ""
    product, _, question_id = custom_id.partition(":")
    question_id = question_id or None

    logger.info("PayPal webhook capture completed: product=%s", product)
    grant_entitlements(product, question_id)
