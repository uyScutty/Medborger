from rest_framework.permissions import BasePermission, IsAuthenticated


class IsPremiumOrFreeContent(BasePermission):
    """Allow access if user is premium OR the object is marked is_free."""

    message = "Opgrader til Premium for at se dette indhold."

    def has_object_permission(self, request, view, obj):
        if getattr(obj, "is_free", False):
            return True
        return request.user.is_authenticated and request.user.is_premium
