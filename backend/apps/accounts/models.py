from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    class SubscriptionTier(models.TextChoices):
        FREE = "free", "Gratis"
        PREMIUM = "premium", "Premium"

    email = models.EmailField(unique=True)
    subscription_tier = models.CharField(
        max_length=10,
        choices=SubscriptionTier.choices,
        default=SubscriptionTier.FREE,
    )
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "accounts_user"

    @property
    def is_premium(self) -> bool:
        if self.subscription_tier != self.SubscriptionTier.PREMIUM:
            return False
        if self.subscription_expires_at is None:
            return True
        return self.subscription_expires_at > timezone.now()

    @property
    def display_name(self) -> str:
        return self.get_full_name() or self.email.split("@")[0]

    def __str__(self) -> str:
        return self.email
