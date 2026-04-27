from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import ChangePasswordSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


def _set_auth_cookies(response: Response, refresh: RefreshToken) -> None:
    access = refresh.access_token
    response.set_cookie(
        settings.JWT_COOKIE_NAME,
        str(access),
        max_age=int(access.lifetime.total_seconds()),
        httponly=settings.JWT_COOKIE_HTTPONLY,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )
    response.set_cookie(
        settings.JWT_REFRESH_COOKIE_NAME,
        str(refresh),
        max_age=int(refresh.lifetime.total_seconds()),
        httponly=settings.JWT_COOKIE_HTTPONLY,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(settings.JWT_COOKIE_NAME)
    response.delete_cookie(settings.JWT_REFRESH_COOKIE_NAME)


class AuthThrottle(AnonRateThrottle):
    rate = "10/minute"


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        _set_auth_cookies(response, refresh)
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        from django.contrib.auth import authenticate

        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response({"detail": "Email og adgangskode er påkrævet."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({"detail": "Forkert email eller adgangskode."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"detail": "Kontoen er deaktiveret."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data)
        _set_auth_cookies(response, refresh)
        return response


class LogoutView(APIView):
    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
        response = Response({"detail": "Logget ud."})
        _clear_auth_cookies(response)
        if raw_refresh:
            try:
                token = RefreshToken(raw_refresh)
                token.blacklist()
            except TokenError:
                pass
        return response


class TokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
        if not raw_refresh:
            return Response({"detail": "Ingen refresh token."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(raw_refresh)
            response = Response({"detail": "Token fornyet."})
            _set_auth_cookies(response, refresh)
            return response
        except TokenError:
            response = Response({"detail": "Ugyldig eller udløbet refresh token."}, status=status.HTTP_401_UNAUTHORIZED)
            _clear_auth_cookies(response)
            return response


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"current_password": "Forkert adgangskode."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        # Invalidate all existing tokens
        RefreshToken.for_user(user)
        response = Response({"detail": "Adgangskode ændret."})
        _clear_auth_cookies(response)
        return response
