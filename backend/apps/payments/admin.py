from django.contrib import admin

from .models import Payment, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price_dkk", "interval", "stripe_price_id", "is_active", "order")
    list_editable = ("is_active", "order")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "amount_dkk", "status", "created_at")
    list_filter = ("status", "plan")
    search_fields = ("user__email", "stripe_payment_intent_id")
    readonly_fields = ("created_at", "updated_at")
