from rest_framework import serializers

from .models import Payment, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ("id", "name", "stripe_price_id", "price_dkk", "interval", "order")


class PaymentSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)

    class Meta:
        model = Payment
        fields = ("id", "plan_name", "amount_dkk", "status", "created_at")
