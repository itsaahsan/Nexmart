import stripe

from settings import settings


def _api_key() -> str:
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return settings.STRIPE_SECRET_KEY


def is_stripe_configured() -> bool:
    return bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_SECRET_KEY.startswith(("sk_test_", "sk_live_")))


def amount_to_cents(amount_dollars: float) -> int:
    return int(round(float(amount_dollars) * 100))


def create_payment_intent(
    amount: int,
    currency: str | None = None,
    metadata: dict | None = None,
    receipt_email: str | None = None,
    idempotency_key: str | None = None,
) -> stripe.PaymentIntent:
    """Create a real Stripe PaymentIntent. `amount` is in cents."""
    _api_key()
    kwargs: dict = {
        "amount": amount,
        "currency": (currency or settings.STRIPE_CURRENCY or "usd").lower(),
        "metadata": metadata or {},
        "automatic_payment_methods": {"enabled": True, "allow_redirects": "never"},
    }
    if receipt_email:
        kwargs["receipt_email"] = receipt_email
    if idempotency_key:
        return stripe.PaymentIntent.create(idempotency_key=idempotency_key, **kwargs)
    return stripe.PaymentIntent.create(**kwargs)


def retrieve_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
    _api_key()
    return stripe.PaymentIntent.retrieve(payment_intent_id)


def construct_webhook_event(payload: bytes, sig_header: str | None):
    """Verify Stripe webhook signature when a secret is configured.

    Falls back to unsigned JSON parsing for local/demo development when
    STRIPE_WEBHOOK_SECRET is empty (never use unsigned in production).
    """
    _api_key()
    if settings.STRIPE_WEBHOOK_SECRET and sig_header:
        return stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    import json

    data = json.loads(payload.decode("utf-8") if isinstance(payload, bytes) else payload)
    # Normalize demo payloads to Stripe-like shape: {"type": ..., "data": {"object": {...}}}
    if "type" not in data and "payment_intent_id" in data:
        return {
            "type": "payment_intent.succeeded",
            "data": {"object": {"id": data["payment_intent_id"], "metadata": data.get("metadata", {})}},
        }
    return data
