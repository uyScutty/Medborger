from django.utils import timezone
from rest_framework import serializers

from apps.content.models import Question
from apps.content.serializers import QuestionWithExplanationSerializer

from .models import AttemptAnswer, ExamAttempt


class StartAttemptSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=ExamAttempt.Mode.choices)
    official_exam_id = serializers.IntegerField(required=False, allow_null=True)
    category_slugs = serializers.ListField(child=serializers.SlugField(), required=False)
    num_questions = serializers.IntegerField(min_value=5, max_value=40, default=40)


class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    choice_id = serializers.IntegerField(allow_null=True)
    time_taken_seconds = serializers.IntegerField(required=False, allow_null=True, min_value=0)


class AttemptAnswerResultSerializer(serializers.ModelSerializer):
    question = QuestionWithExplanationSerializer(read_only=True)
    chosen_choice_id = serializers.IntegerField(source="chosen_choice_id", read_only=True)

    class Meta:
        model = AttemptAnswer
        fields = ("question", "chosen_choice_id", "is_correct", "time_taken_seconds")


class ExamAttemptSerializer(serializers.ModelSerializer):
    score_percentage = serializers.FloatField(read_only=True)
    duration_seconds = serializers.IntegerField(read_only=True)
    is_complete = serializers.BooleanField(read_only=True)

    class Meta:
        model = ExamAttempt
        fields = (
            "id",
            "mode",
            "official_exam",
            "started_at",
            "completed_at",
            "score",
            "total_questions",
            "passed",
            "score_percentage",
            "duration_seconds",
            "is_complete",
        )


class AttemptDetailSerializer(ExamAttemptSerializer):
    answers = AttemptAnswerResultSerializer(many=True, read_only=True)

    class Meta(ExamAttemptSerializer.Meta):
        fields = ExamAttemptSerializer.Meta.fields + ("answers",)


class CategoryPerformanceSerializer(serializers.Serializer):
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    total = serializers.IntegerField()
    correct = serializers.IntegerField()
    percentage = serializers.FloatField()
