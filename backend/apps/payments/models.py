from django.conf import settings
from django.db import models


class SubscriptionPlan(models.Model):
    class Interval(models.TextChoices):
        MONTHLY = "month", "Månedlig"
        YEARLY = "year", "Årlig"
        ONE_TIME = "one_time", "Engangsbeløb"

    name = models.CharField(max_length=100)
    stripe_price_id = models.CharField(max_length=100, unique=True)
    price_dkk = models.DecimalField(max_digits=8, decimal_places=2)
    interval = models.CharField(max_length=10, choices=Interval.choices)
    is_active = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "payments_subscription_plan"
        ordering = ["order"]

    def __str__(self) -> str:
        return f"{self.name} ({self.price_dkk} DKK)"


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Afventer"
        SUCCEEDED = "succeeded", "Gennemført"
        FAILED = "failed", "Fejlet"
        REFUNDED = "refunded", "Refunderet"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="payments")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    stripe_payment_intent_id = models.CharField(max_length=200, unique=True)
    stripe_subscription_id = models.CharField(max_length=200, blank=True)
    amount_dkk = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments_payment"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.email} — {self.plan.name} — {self.status}"
