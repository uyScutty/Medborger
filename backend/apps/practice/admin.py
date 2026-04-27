from django.contrib import admin

from .models import AttemptAnswer, ExamAttempt


class AttemptAnswerInline(admin.TabularInline):
    model = AttemptAnswer
    readonly_fields = ("question", "chosen_choice", "is_correct", "time_taken_seconds", "answered_at")
    extra = 0


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "mode", "score", "total_questions", "passed", "started_at", "completed_at")
    list_filter = ("mode", "passed")
    search_fields = ("user__email",)
    readonly_fields = ("started_at",)
    inlines = [AttemptAnswerInline]
