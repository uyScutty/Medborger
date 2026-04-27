import stripe
from django.conf import settings
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User

from .models import Payment, SubscriptionPlan
from .serializers import SubscriptionPlanSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlanListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True)
        return Response(SubscriptionPlanSerializer(plans, many=True).data)


class CreateCheckoutSessionView(APIView):
    def post(self, request):
        plan_id = request.data.get("plan_id")
        try:
            plan = SubscriptionPlan.objects.get(pk=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({"detail": "Plan ikke fundet."}, status=404)

        user = request.user
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.display_name,
                metadata={"user_id": user.pk},
            )
            user.stripe_customer_id = customer.id
            user.save(update_fields=["stripe_customer_id"])

        frontend_url = settings.FRONTEND_URL if hasattr(settings, "FRONTEND_URL") else "http://localhost:3000"

        if plan.interval == SubscriptionPlan.Interval.ONE_TIME:
            session = stripe.checkout.Session.create(
                customer=user.stripe_customer_id,
                payment_method_types=["card"],
                line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
                mode="payment",
                success_url=f"{frontend_url}/konto?success=1",
                cancel_url=f"{frontend_url}/priser?canceled=1",
                metadata={"user_id": user.pk, "plan_id": plan.pk},
            )
        else:
            session = stripe.checkout.Session.create(
                customer=user.stripe_customer_id,
                payment_method_types=["card"],
                line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
                mode="subscription",
                success_url=f"{frontend_url}/konto?success=1",
                cancel_url=f"{frontend_url}/priser?canceled=1",
                metadata={"user_id": user.pk, "plan_id": plan.pk},
            )

        return Response({"url": session.url})


class CustomerPortalView(APIView):
    def post(self, request):
        user = request.user
        if not user.stripe_customer_id:
            return Response({"detail": "Ingen abonnement fundet."}, status=400)

        frontend_url = settings.FRONTEND_URL if hasattr(settings, "FRONTEND_URL") else "http://localhost:3000"

        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=f"{frontend_url}/konto",
        )
        return Response({"url": session.url})


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=400)

        event_type = event["type"]

        if event_type == "checkout.session.completed":
            self._handle_checkout_completed(event["data"]["object"])
        elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
            self._handle_subscription_change(event["data"]["object"])

        return Response({"status": "ok"})

    def _handle_checkout_completed(self, session):
        user_id = session.get("metadata", {}).get("user_id")
        if not user_id:
            return
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return

        user.subscription_tier = User.SubscriptionTier.PREMIUM
        user.subscription_expires_at = None  # set by subscription update event
        user.save(update_fields=["subscription_tier", "subscription_expires_at"])

    def _handle_subscription_change(self, subscription):
        customer_id = subscription.get("customer")
        try:
            user = User.objects.get(stripe_customer_id=customer_id)
        except User.DoesNotExist:
            return

        sub_status = subscription.get("status")
        if sub_status == "active":
            user.subscription_tier = User.SubscriptionTier.PREMIUM
            period_end = subscription.get("current_period_end")
            if period_end:
                user.subscription_expires_at = timezone.datetime.fromtimestamp(period_end, tz=timezone.utc)
        else:
            user.subscription_tier = User.SubscriptionTier.FREE
            user.subscription_expires_at = None

        user.save(update_fields=["subscription_tier", "subscription_expires_at"])
