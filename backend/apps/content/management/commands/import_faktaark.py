"""
Import faktaark from backend/data/faktaark.json into the FactSheet model.

Usage:
    python manage.py import_faktaark
    python manage.py import_faktaark --file path/to/other.json
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from apps.content.models import Category, FactSheet, Subcategory

DEFAULT_FILE = Path(__file__).resolve().parents[5] / "data" / "faktaark.json"


class Command(BaseCommand):
    help = "Import faktaark from JSON into the FactSheet table"

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=Path,
            default=DEFAULT_FILE,
            help="Path to faktaark JSON file (default: backend/data/faktaark.json)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Validate input without writing to the database",
        )

    def handle(self, *args, **options):
        path: Path = options["file"]
        dry_run: bool = options["dry_run"]

        if not path.exists():
            raise CommandError(f"File not found: {path}")

        with open(path, encoding="utf-8") as f:
            items = json.load(f)

        self.stdout.write(f"Loaded {len(items)} faktaark from {path}")

        created_count = 0
        updated_count = 0

        for item in items:
            factsheet_id = item["factsheet_id"]

            try:
                category = Category.objects.get(slug=item["category_slug"])
            except Category.DoesNotExist:
                self.stderr.write(
                    f"  SKIP {factsheet_id}: unknown category slug '{item['category_slug']}'"
                )
                continue

            subcategory = None
            if item.get("subcategory_slug"):
                try:
                    subcategory = Subcategory.objects.get(slug=item["subcategory_slug"])
                except Subcategory.DoesNotExist:
                    self.stderr.write(
                        f"  WARN {factsheet_id}: unknown subcategory slug '{item['subcategory_slug']}' — leaving blank"
                    )

            defaults = {
                "number": item["number"],
                "category": category,
                "subcategory": subcategory,
                "title": item.get("title", {}),
                "content_markdown": item.get("content_markdown", {}),
                "audio_urls": item.get("audio_urls", {}),
                "is_premium": item.get("is_premium", True),
                "order": item.get("order", item["number"]),
            }

            if dry_run:
                self.stdout.write(f"  DRY {factsheet_id}: {item['title'].get('da', '?')}")
                continue

            _, created = FactSheet.objects.update_or_create(
                factsheet_id=factsheet_id,
                defaults=defaults,
            )
            if created:
                created_count += 1
                self.stdout.write(f"  + {factsheet_id}: {item['title'].get('da', '?')}")
            else:
                updated_count += 1
                self.stdout.write(f"  ~ {factsheet_id}: {item['title'].get('da', '?')}")

        if not dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Done — {created_count} created, {updated_count} updated."
                )
            )
        else:
            self.stdout.write(self.style.WARNING("Dry run — no changes written."))
