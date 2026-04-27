from rest_framework import serializers

from .models import Category, Choice, OfficialExam, OfficialExamQuestion, Question


class CategorySerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "icon", "order", "question_count")


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ("id", "text", "order")


class ChoiceWithAnswerSerializer(ChoiceSerializer):
    """Includes is_correct — only sent after a question is answered."""

    class Meta(ChoiceSerializer.Meta):
        fields = ChoiceSerializer.Meta.fields + ("is_correct",)


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Question
        fields = ("id", "text", "category", "category_name", "difficulty", "image", "is_free", "choices")


class QuestionWithExplanationSerializer(QuestionSerializer):
    """Includes choices with correct-answer flags and the explanation."""

    choices = ChoiceWithAnswerSerializer(many=True, read_only=True)

    class Meta(QuestionSerializer.Meta):
        fields = QuestionSerializer.Meta.fields + ("explanation",)


class OfficialExamListSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source="questions.count", read_only=True)

    class Meta:
        model = OfficialExam
        fields = (
            "id",
            "title",
            "year",
            "month",
            "description",
            "pass_score",
            "total_time_minutes",
            "is_free",
            "question_count",
        )


class OfficialExamDetailSerializer(OfficialExamListSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta(OfficialExamListSerializer.Meta):
        fields = OfficialExamListSerializer.Meta.fields + ("questions",)
