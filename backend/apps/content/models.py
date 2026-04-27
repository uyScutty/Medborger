from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Emoji or icon identifier")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "content_category"
        ordering = ["order", "name"]
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name


class Question(models.Model):
    class Difficulty(models.TextChoices):
        EASY = "easy", "Let"
        MEDIUM = "medium", "Mellem"
        HARD = "hard", "Svær"

    text = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="questions")
    difficulty = models.CharField(max_length=10, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    explanation = models.TextField(help_text="Shown after the user answers")
    image = models.ImageField(upload_to="questions/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_free = models.BooleanField(
        default=False,
        help_text="Available without a premium subscription",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "content_question"
        ordering = ["category", "id"]

    def __str__(self) -> str:
        return self.text[:80]


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "content_choice"
        ordering = ["order"]

    def __str__(self) -> str:
        marker = "✓" if self.is_correct else "✗"
        return f"{marker} {self.text[:60]}"


class OfficialExam(models.Model):
    """A historical official indfødsretsprøven exam."""

    class Month(models.IntegerChoices):
        JANUARY = 1, "Januar"
        AUGUST = 8, "August"

    title = models.CharField(max_length=200)
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField(choices=Month.choices)
    description = models.TextField(blank=True)
    pass_score = models.PositiveSmallIntegerField(default=32, help_text="Minimum correct answers to pass")
    total_time_minutes = models.PositiveSmallIntegerField(default=45)
    is_free = models.BooleanField(default=False, help_text="Accessible on free tier")
    is_published = models.BooleanField(default=True)
    questions = models.ManyToManyField(Question, through="OfficialExamQuestion", related_name="official_exams")

    class Meta:
        db_table = "content_official_exam"
        ordering = ["-year", "-month"]
        unique_together = ("year", "month")

    def __str__(self) -> str:
        return self.title


class OfficialExamQuestion(models.Model):
    exam = models.ForeignKey(OfficialExam, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.PROTECT)
    order = models.PositiveSmallIntegerField()

    class Meta:
        db_table = "content_official_exam_question"
        ordering = ["order"]
        unique_together = ("exam", "order")
