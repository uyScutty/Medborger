"""
Creates the official category/subcategory structure for Medborger.

Usage:
    python manage.py seed_categories
"""

from django.core.management.base import BaseCommand

from apps.content.models import Category, Subcategory

STRUCTURE = [
    {
        "slug": "demokrati_retssamfund",
        "name": "Det danske demokrati og retssamfund",
        "icon": "🏛️",
        "order": 0,
        "subcategories": [
            {"slug": "grundlov_rettigheder", "name": "Grundloven & Menneskerettigheder", "order": 0},
            {"slug": "folketing_regering",   "name": "Folketinget, Regeringen & Valg",   "order": 1},
            {"slug": "domstole_politi",      "name": "Domstolene & Politiet",             "order": 2},
            {"slug": "lokaldemokrati",       "name": "Kommuner & Regioner",               "order": 3},
        ],
    },
    {
        "slug": "hverdagsliv_arbejdsmarked",
        "name": "Det danske samfund, hverdagsliv og arbejdsmarked",
        "icon": "🤝",
        "order": 1,
        "subcategories": [
            {"slug": "arbejdsmarked",     "name": "Den Danske Model & Arbejdsmarkedet", "order": 0},
            {"slug": "uddannelse_boern",  "name": "Uddannelse & Børnepasning",          "order": 1},
            {"slug": "sundhed_velfaerd",  "name": "Sundhedsvæsen & Velfærd",            "order": 2},
            {"slug": "ligestilling_familie", "name": "Kønsligestilling & Familien",    "order": 3},
        ],
    },
    {
        "slug": "kultur_historie",
        "name": "Dansk kultur, historie og traditioner",
        "icon": "🎭",
        "order": 2,
        "subcategories": [
            {"slug": "historie",              "name": "Danmarks Historie & Milepæle",        "order": 0},
            {"slug": "traditioner",           "name": "Helligdage & Traditioner",             "order": 1},
            {"slug": "foreningsliv_kultur",   "name": "Foreningsliv, Frivillighed & Sprog",  "order": 2},
            {"slug": "kongehus_rigsfaellesskab", "name": "Kongehuset & Rigsfællesskabet",    "order": 3},
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the category and subcategory structure"

    def handle(self, *args, **options):
        for cat_data in STRUCTURE:
            subs = cat_data.pop("subcategories")
            cat, created = Category.objects.update_or_create(
                slug=cat_data["slug"],
                defaults=cat_data,
            )
            action = "Created" if created else "Updated"
            self.stdout.write(f"  {action} category: {cat.name}")

            for sub_data in subs:
                sub, sub_created = Subcategory.objects.update_or_create(
                    slug=sub_data["slug"],
                    defaults={"category": cat, **sub_data},
                )
                sub_action = "  +" if sub_created else "  ~"
                self.stdout.write(f"    {sub_action} {sub.name}")

        self.stdout.write(self.style.SUCCESS("Categories seeded."))
