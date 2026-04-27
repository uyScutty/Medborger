from django.urls import path

from . import views

urlpatterns = [
    path("plans/", views.SubscriptionPlanListView.as_view(), name="plan-list"),
    path("checkout/", views.CreateCheckoutSessionView.as_view(), name="checkout"),
    path("portal/", views.CustomerPortalView.as_view(), name="customer-portal"),
    path("webhook/", views.StripeWebhookView.as_view(), name="stripe-webhook"),
]
