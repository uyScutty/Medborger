from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Choice, FactSheet, OfficialExam, OfficialExamQuestion, Question


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4
    fields = ("order", "text", "is_correct")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon", "order")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("order",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("short_text", "category", "difficulty", "is_free", "is_active", "created_at")
    list_filter = ("category", "difficulty", "is_free", "is_active")
    search_fields = ("text", "explanation")
    inlines = [ChoiceInline]
    list_editable = ("is_free", "is_active")

    @admin.display(description="Spørgsmål")
    def short_text(self, obj):
        return obj.text[:80]


@admin.register(FactSheet)
class FactSheetAdmin(admin.ModelAdmin):
    list_display = ("factsheet_id", "number", "da_title", "category", "subcategory", "is_premium", "order")
    list_filter = ("category", "subcategory", "is_premium")
    list_editable = ("is_premium", "order")
    search_fields = ("factsheet_id",)
    ordering = ("order", "number")

    @admin.display(description="Titel (DA)")
    def da_title(self, obj):
        return obj.title.get("da", "—")


class OfficialExamQuestionInline(admin.TabularInline):
    model = OfficialExamQuestion
    extra = 1
    autocomplete_fields = ["question"]


@admin.register(OfficialExam)
class OfficialExamAdmin(admin.ModelAdmin):
    list_display = ("title", "year", "month", "question_count", "is_free", "is_published")
    list_filter = ("year", "month", "is_free", "is_published")
    inlines = [OfficialExamQuestionInline]

    @admin.display(description="Spørgsmål")
    def question_count(self, obj):
        return obj.questions.count()
