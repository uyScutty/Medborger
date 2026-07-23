from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "content_category"
        ordering = ["order", "name"]
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name


class Subcategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="subcategories")
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "content_subcategory"
        ordering = ["order", "name"]
        verbose_name_plural = "subcategories"

    def __str__(self) -> str:
        return f"{self.category.name} › {self.name}"


class Question(models.Model):
    class Difficulty(models.TextChoices):
        EASY = "easy", "Let"
        MEDIUM = "medium", "Mellem"
        HARD = "hard", "Svær"

    class Status(models.TextChoices):
        VALID = "valid", "Gyldig"
        UPDATED = "updated", "Opdateret"
        RETIRED = "retired", "Udgået"

    text = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="questions")
    subcategory = models.ForeignKey(
        Subcategory, null=True, blank=True, on_delete=models.SET_NULL, related_name="questions"
    )
    difficulty = models.CharField(max_length=10, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    image = models.ImageField(upload_to="questions/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_free = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.VALID)
    explanation = models.TextField(blank=True)
    explanation_sentences = models.JSONField(default=list, blank=True)
    correct_answer_summary = models.JSONField(default=dict, blank=True)
    historical_note_sentences = models.JSONField(default=list, blank=True)
    original_correct_text = models.CharField(max_length=255, blank=True)
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
    option_letter = models.CharField(max_length=1, blank=True)

    class Meta:
        db_table = "content_choice"
        ordering = ["order"]

    def __str__(self) -> str:
        marker = "✓" if self.is_correct else "✗"
        return f"{marker} {self.text[:60]}"


class OfficialExam(models.Model):
    title = models.CharField(max_length=200)
    year = models.PositiveSmallIntegerField()
    month = models.PositiveSmallIntegerField(help_text="Numeric month (1=Januar, 8=August, etc.)")
    season = models.CharField(max_length=10, blank=True, help_text="'sommer' or 'vinter' from official naming")
    description = models.TextField(blank=True)
    pass_score = models.PositiveSmallIntegerField(default=32)
    total_time_minutes = models.PositiveSmallIntegerField(default=45)
    is_free = models.BooleanField(default=False)
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
