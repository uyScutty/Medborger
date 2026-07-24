from django.db.models import Count
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, FactSheet, OfficialExam, Question
from .permissions import IsPremiumOrFreeContent
from .serializers import (
    CategorySerializer,
    FactSheetSerializer,
    OfficialExamDetailSerializer,
    OfficialExamListSerializer,
    QuestionSerializer,
    QuestionWithExplanationSerializer,
)

FREE_QUESTIONS_PER_DAY = 10


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    @method_decorator(cache_page(60 * 15))
    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    def get_queryset(self):
        return Category.objects.annotate(question_count=Count("questions")).order_by("order")


class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category__slug", "difficulty", "is_free"]
    search_fields = ["text"]
    ordering_fields = ["difficulty", "created_at"]

    def get_queryset(self):
        qs = Question.objects.filter(is_active=True).select_related("category").prefetch_related("choices")
        if not self.request.user.is_premium:
            qs = qs.filter(is_free=True)
        return qs


class QuestionDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Question.objects.filter(is_active=True).prefetch_related("choices")
        user = self.request.user
        if not user.is_authenticated or not user.is_premium:
            qs = qs.filter(is_free=True)
        return qs

    def get_serializer_class(self):
        if self.request.query_params.get("with_answer") == "1":
            return QuestionWithExplanationSerializer
        return QuestionSerializer


class OfficialExamListView(generics.ListAPIView):
    serializer_class = OfficialExamListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = OfficialExam.objects.filter(is_published=True)
        user = self.request.user
        if not user.is_authenticated or not user.is_premium:
            qs = qs.filter(is_free=True)
        return qs


class OfficialExamDetailView(generics.RetrieveAPIView):
    serializer_class = OfficialExamDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = OfficialExam.objects.filter(is_published=True).prefetch_related("questions__choices")
        user = self.request.user
        if not user.is_authenticated or not user.is_premium:
            qs = qs.filter(is_free=True)
        return qs


class FactSheetListView(generics.ListAPIView):
    serializer_class = FactSheetSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = FactSheet.objects.select_related("category", "subcategory").order_by("order", "number")
        if not self.request.user.is_premium:
            qs = qs.filter(is_premium=False)
        return qs


class FactSheetDetailView(generics.RetrieveAPIView):
    serializer_class = FactSheetSerializer
    permission_classes = [permissions.IsAuthenticated, IsPremiumOrFreeContent]
    lookup_field = "factsheet_id"

    def get_queryset(self):
        return FactSheet.objects.select_related("category", "subcategory")
