import stripe

from settings import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_payment_intent(amount: int, currency: str = "usd", metadata: dict = None) -> stripe.PaymentIntent:
    return stripe.PaymentIntent.create(
        amount=amount,
        currency=currency,
        metadata=metadata or {},
    )


def retrieve_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
    return stripe.PaymentIntent.retrieve(payment_intent_id)
