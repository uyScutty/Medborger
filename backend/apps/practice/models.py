from django.conf import settings
from django.db import models

from apps.content.models import Choice, OfficialExam, Question

PASS_SCORE = 32
TOTAL_QUESTIONS = 40


class ExamAttempt(models.Model):
    class Mode(models.TextChoices):
        PRACTICE = "practice", "Øvelse"
        MOCK_EXAM = "mock_exam", "Prøveeksamen"
        OFFICIAL_EXAM = "official_exam", "Officiel prøve"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attempts")
    official_exam = models.ForeignKey(
        OfficialExam,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="attempts",
    )
    mode = models.CharField(max_length=15, choices=Mode.choices, default=Mode.PRACTICE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveSmallIntegerField(null=True, blank=True)
    total_questions = models.PositiveSmallIntegerField(default=TOTAL_QUESTIONS)
    passed = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = "practice_exam_attempt"
        ordering = ["-started_at"]

    @property
    def is_complete(self) -> bool:
        return self.completed_at is not None

    @property
    def score_percentage(self) -> float | None:
        if self.score is None or self.total_questions == 0:
            return None
        return round(self.score / self.total_questions * 100, 1)

    @property
    def duration_seconds(self) -> int | None:
        if self.completed_at is None:
            return None
        return int((self.completed_at - self.started_at).total_seconds())

    def __str__(self) -> str:
        return f"{self.user.email} — {self.get_mode_display()} — {self.started_at:%Y-%m-%d}"


class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.PROTECT)
    chosen_choice = models.ForeignKey(Choice, null=True, blank=True, on_delete=models.SET_NULL)
    is_correct = models.BooleanField(default=False)
    time_taken_seconds = models.PositiveSmallIntegerField(null=True, blank=True)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "practice_attempt_answer"
        unique_together = ("attempt", "question")

    def save(self, *args, **kwargs):
        if self.chosen_choice:
            self.is_correct = self.chosen_choice.is_correct
        super().save(*args, **kwargs)
