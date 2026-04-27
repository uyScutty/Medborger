from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class CookieJWTAuthentication(JWTAuthentication):
    """Read the JWT access token from an HttpOnly cookie instead of the Authorization header."""

    def authenticate(self, request):
        cookie_name = getattr(settings, "JWT_COOKIE_NAME", "access_token")
        raw_token = request.COOKIES.get(cookie_name)
        if raw_token is None:
            return None
        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            return None
        return self.get_user(validated_token), validated_token
