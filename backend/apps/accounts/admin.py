from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "subscription_tier", "is_premium", "date_joined")
    list_filter = ("subscription_tier", "is_active", "is_staff")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-date_joined",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Abonnement", {"fields": ("subscription_tier", "subscription_expires_at", "stripe_customer_id")}),
    )
