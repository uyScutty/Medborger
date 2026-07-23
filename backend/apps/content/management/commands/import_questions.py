"""
Import questions from a JSON file.

Usage:
    python manage.py import_questions path/to/questions.json
    python manage.py import_questions path/to/questions.json --dry-run

JSON format (array of question objects):
[
  {
    "question_id": "2016_s_01",          # unique reference string (not stored)
    "test_info": {                        # optional — links to an OfficialExam
      "year": 2016,
      "season": "sommer"                  # "sommer" | "vinter"
    },
    "category_id": "hverdagsliv_arbejdsmarked",
    "subcategory_id": "ligestilling_familie",
    "question_text": "Hvor mange uger...",
    "options": [
      {"id": "A", "text": "12 uger"},
      {"id": "B", "text": "18 uger"},
      {"id": "C", "text": "24 uger"}
    ],
    "current_correct_option": "B",
    "original_correct_option": "A",       # optional
    "current_status": "Opdateret",        # "Gyldig" | "Opdateret" | "Udgået"
    "explanation": "...",                  # plain text fallback
    "explanation_sentences": [            # bilingual — preferred
      {"da": "...", "en": "...", "ar": "..."}
    ],
    "correct_answer_summary": {           # emphasized final line
      "da": "...", "en": "...", "ar": "..."
    },
    "historical_note_sentences": [        # only for status=Opdateret
      {"da": "...", "en": "...", "ar": "..."}
    ],
    "is_free": false,
    "difficulty": "medium"                # "easy" | "medium" | "hard"
  }
]
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.content.models import (
    Category, Choice, OfficialExam, OfficialExamQuestion, Question, Subcategory,
)

SEASON_TO_MONTH = {"sommer": 8, "vinter": 1}
SEASON_MONTH_NAME = {"sommer": "August", "vinter": "Januar"}

STATUS_MAP = {
    "Gyldig": Question.Status.VALID,
    "Opdateret": Question.Status.UPDATED,
    "Udgået": Question.Status.RETIRED,
    "valid": Question.Status.VALID,
    "updated": Question.Status.UPDATED,
    "retired": Question.Status.RETIRED,
}


class Command(BaseCommand):
    help = "Import questions from a JSON file"

    def add_arguments(self, parser):
        parser.add_argument("json_file", type=str, help="Path to the JSON file")
        parser.add_argument("--dry-run", action="store_true", help="Validate without saving")
        parser.add_argument("--update", action="store_true", help="Update existing questions (matched by text)")

    def handle(self, *args, **options):
        path = Path(options["json_file"])
        if not path.exists():
            raise CommandError(f"File not found: {path}")

        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            raise CommandError(f"Invalid JSON: {e}") from e

        if not isinstance(data, list):
            raise CommandError("JSON must be an array of question objects.")

        dry_run = options["dry_run"]
        update = options["update"]
        created = updated = skipped = errors = 0

        with transaction.atomic():
            for i, item in enumerate(data, start=1):
                ref = item.get("question_id", f"index {i}")
                try:
                    result = self._import_one(item, update=update, dry_run=dry_run)
                    if result == "created":
                        created += 1
                    elif result == "updated":
                        updated += 1
                    else:
                        skipped += 1
                except Exception as exc:
                    self.stderr.write(self.style.ERROR(f"  [{ref}] ERROR: {exc}"))
                    errors += 1

            if dry_run:
                transaction.set_rollback(True)
                self.stdout.write(self.style.WARNING("DRY RUN — no changes saved."))

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created: {created}  Updated: {updated}  Skipped: {skipped}  Errors: {errors}"
            )
        )

    def _import_one(self, item: dict, *, update: bool, dry_run: bool) -> str:
        ref = item.get("question_id", "?")

        # Category
        cat_slug = item.get("category_id", "")
        try:
            category = Category.objects.get(slug=cat_slug)
        except Category.DoesNotExist:
            raise ValueError(f"Category slug '{cat_slug}' not found")

        # Subcategory (optional)
        subcategory = None
        sub_slug = item.get("subcategory_id", "")
        if sub_slug:
            subcategory, _ = Subcategory.objects.get_or_create(
                slug=sub_slug,
                defaults={"category": category, "name": sub_slug.replace("_", " ").title()},
            )

        # Status
        raw_status = item.get("current_status", "Gyldig")
        status = STATUS_MAP.get(raw_status, Question.Status.VALID)

        question_text = item["question_text"]

        # Check for existing
        existing = Question.objects.filter(text=question_text).first()
        if existing and not update:
            self.stdout.write(f"  [{ref}] SKIP (already exists)")
            return "skipped"

        options_list = item.get("options", [])
        correct_letter = item.get("current_correct_option", "")
        original_letter = item.get("original_correct_option", "")

        # Find original correct text for historical note
        original_correct_text = ""
        if original_letter:
            for opt in options_list:
                if opt.get("id") == original_letter:
                    original_correct_text = opt.get("text", "")
                    break

        q_kwargs = dict(
            category=category,
            subcategory=subcategory,
            difficulty=item.get("difficulty", Question.Difficulty.MEDIUM),
            is_free=item.get("is_free", False),
            status=status,
            explanation=item.get("explanation", ""),
            explanation_sentences=item.get("explanation_sentences", []),
            correct_answer_summary=item.get("correct_answer_summary", {}),
            historical_note_sentences=item.get("historical_note_sentences", []),
            original_correct_text=original_correct_text,
        )

        if existing:
            for attr, val in q_kwargs.items():
                setattr(existing, attr, val)
            question = existing
            if not dry_run:
                question.save()
            action = "updated"
        else:
            question = Question(text=question_text, **q_kwargs)
            if not dry_run:
                question.save()
            action = "created"

        # Choices
        if not dry_run:
            if existing:
                question.choices.all().delete()
            for order, opt in enumerate(options_list):
                letter = opt.get("id", "")
                Choice.objects.create(
                    question=question,
                    text=opt["text"],
                    is_correct=(letter == correct_letter),
                    order=order,
                    option_letter=letter,
                )

        # OfficialExam link
        test_info = item.get("test_info")
        if test_info and not dry_run:
            year = test_info.get("year")
            season = test_info.get("season", "").lower()
            month = SEASON_TO_MONTH.get(season)
            if year and month:
                month_name = SEASON_MONTH_NAME.get(season, "")
                exam, _ = OfficialExam.objects.get_or_create(
                    year=year, month=month,
                    defaults={
                        "title": f"Indfødsretsprøven {month_name} {year}",
                        "season": season,
                    },
                )
                number = test_info.get("number", 0)
                OfficialExamQuestion.objects.get_or_create(
                    exam=exam, question=question,
                    defaults={"order": number},
                )

        self.stdout.write(f"  [{ref}] {action.upper()}")
        return action
