import random

from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.content.models import OfficialExam, Question

from .models import AttemptAnswer, ExamAttempt
from .serializers import (
    AttemptDetailSerializer,
    ExamAttemptSerializer,
    StartAttemptSerializer,
    SubmitAnswerSerializer,
)

PASS_SCORE = 32


class StartAttemptView(APIView):
    def post(self, request):
        serializer = StartAttemptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        mode = data["mode"]
        official_exam = None

        if mode == ExamAttempt.Mode.OFFICIAL_EXAM:
            exam_id = data.get("official_exam_id")
            if not exam_id:
                return Response({"detail": "official_exam_id er påkrævet for officiel eksamen."}, status=400)
            try:
                official_exam = OfficialExam.objects.get(pk=exam_id, is_published=True)
                if not official_exam.is_free and not request.user.is_premium:
                    return Response({"detail": "Denne eksamen kræver Premium."}, status=403)
            except OfficialExam.DoesNotExist:
                return Response({"detail": "Eksamen ikke fundet."}, status=404)

        # Build question pool
        if official_exam:
            question_ids = list(official_exam.questions.values_list("id", flat=True).order_by("officialexamquestion__order"))
        else:
            qs = Question.objects.filter(is_active=True)
            if not request.user.is_premium:
                qs = qs.filter(is_free=True)
            category_slugs = data.get("category_slugs", [])
            if category_slugs:
                qs = qs.filter(category__slug__in=category_slugs)
            num = data.get("num_questions", 40)
            question_ids = list(qs.values_list("id", flat=True))
            random.shuffle(question_ids)
            question_ids = question_ids[:num]

        attempt = ExamAttempt.objects.create(
            user=request.user,
            official_exam=official_exam,
            mode=mode,
            total_questions=len(question_ids),
        )

        return Response(
            {
                **ExamAttemptSerializer(attempt).data,
                "question_ids": question_ids,
            },
            status=status.HTTP_201_CREATED,
        )


class SubmitAnswerView(APIView):
    def post(self, request, attempt_id):
        try:
            attempt = ExamAttempt.objects.get(pk=attempt_id, user=request.user)
        except ExamAttempt.DoesNotExist:
            return Response({"detail": "Forsøg ikke fundet."}, status=404)

        if attempt.is_complete:
            return Response({"detail": "Forsøget er allerede afsluttet."}, status=400)

        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            question = Question.objects.prefetch_related("choices").get(pk=data["question_id"])
        except Question.DoesNotExist:
            return Response({"detail": "Spørgsmål ikke fundet."}, status=404)

        chosen_choice = None
        if data.get("choice_id"):
            try:
                chosen_choice = question.choices.get(pk=data["choice_id"])
            except Exception:
                return Response({"detail": "Svarmulighed ikke fundet."}, status=404)

        answer, created = AttemptAnswer.objects.get_or_create(
            attempt=attempt,
            question=question,
            defaults={
                "chosen_choice": chosen_choice,
                "time_taken_seconds": data.get("time_taken_seconds"),
            },
        )

        if not created:
            return Response({"detail": "Allerede besvaret."}, status=400)

        from apps.content.serializers import QuestionWithExplanationSerializer

        return Response(
            {
                "is_correct": answer.is_correct,
                "question": QuestionWithExplanationSerializer(question).data,
            }
        )


class CompleteAttemptView(APIView):
    def post(self, request, attempt_id):
        try:
            attempt = ExamAttempt.objects.prefetch_related("answers").get(pk=attempt_id, user=request.user)
        except ExamAttempt.DoesNotExist:
            return Response({"detail": "Forsøg ikke fundet."}, status=404)

        if attempt.is_complete:
            return Response({"detail": "Forsøget er allerede afsluttet."}, status=400)

        score = attempt.answers.filter(is_correct=True).count()
        passed = score >= PASS_SCORE if attempt.total_questions >= PASS_SCORE else None

        attempt.score = score
        attempt.passed = passed
        attempt.completed_at = timezone.now()
        attempt.save()

        return Response(ExamAttemptSerializer(attempt).data)


class AttemptDetailView(generics.RetrieveAPIView):
    serializer_class = AttemptDetailSerializer

    def get_queryset(self):
        return ExamAttempt.objects.filter(user=self.request.user).prefetch_related("answers__question__choices", "answers__chosen_choice")


class AttemptListView(generics.ListAPIView):
    serializer_class = ExamAttemptSerializer

    def get_queryset(self):
        return ExamAttempt.objects.filter(user=self.request.user, completed_at__isnull=False)


class ProgressView(APIView):
    def get(self, request):
        attempts = ExamAttempt.objects.filter(user=request.user, completed_at__isnull=False)
        total_attempts = attempts.count()
        mock_attempts = attempts.filter(mode__in=[ExamAttempt.Mode.MOCK_EXAM, ExamAttempt.Mode.OFFICIAL_EXAM])

        answers = AttemptAnswer.objects.filter(attempt__user=request.user)
        total_answered = answers.count()
        total_correct = answers.filter(is_correct=True).count()

        category_stats = (
            answers.values("question__category__id", "question__category__name")
            .annotate(total=Count("id"), correct=Count("id", filter=Q(is_correct=True)))
            .order_by("question__category__name")
        )

        categories = [
            {
                "category_id": s["question__category__id"],
                "category_name": s["question__category__name"],
                "total": s["total"],
                "correct": s["correct"],
                "percentage": round(s["correct"] / s["total"] * 100, 1) if s["total"] else 0,
            }
            for s in category_stats
        ]

        return Response(
            {
                "total_attempts": total_attempts,
                "mock_attempts_count": mock_attempts.count(),
                "best_score": mock_attempts.aggregate(best=Avg("score"))["best"],
                "total_answered": total_answered,
                "total_correct": total_correct,
                "accuracy_percentage": round(total_correct / total_answered * 100, 1) if total_answered else 0,
                "category_performance": categories,
            }
        )
