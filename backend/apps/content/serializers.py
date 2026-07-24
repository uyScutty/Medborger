from rest_framework import serializers

from .models import Category, Choice, FactSheet, OfficialExam, OfficialExamQuestion, Question, Subcategory


class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = ("id", "name", "slug")


class CategorySerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)
    subcategories = SubcategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "icon", "order", "question_count", "subcategories")


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ("id", "text", "text_translations", "order")


class ChoiceWithAnswerSerializer(ChoiceSerializer):
    class Meta(ChoiceSerializer.Meta):
        fields = ChoiceSerializer.Meta.fields + ("is_correct",)


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True, default=None)

    class Meta:
        model = Question
        fields = (
            "id", "text", "text_translations", "category", "category_name",
            "subcategory", "subcategory_name",
            "difficulty", "image", "is_free", "status", "choices",
        )


class QuestionWithExplanationSerializer(QuestionSerializer):
    choices = ChoiceWithAnswerSerializer(many=True, read_only=True)

    class Meta(QuestionSerializer.Meta):
        fields = QuestionSerializer.Meta.fields + (
            "explanation",
            "explanation_sentences",
            "correct_answer_summary",
            "historical_note_sentences",
            "original_correct_text",
        )


class OfficialExamListSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(source="questions.count", read_only=True)

    class Meta:
        model = OfficialExam
        fields = (
            "id", "title", "year", "month", "season",
            "description", "pass_score", "total_time_minutes",
            "is_free", "question_count",
        )


class FactSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = FactSheet
        fields = (
            "id", "factsheet_id", "number", "category", "subcategory",
            "title", "content_markdown", "audio_urls", "is_premium", "order",
        )


class OfficialExamDetailSerializer(OfficialExamListSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta(OfficialExamListSerializer.Meta):
        fields = OfficialExamListSerializer.Meta.fields + ("questions",)
