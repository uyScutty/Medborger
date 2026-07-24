from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0003_question_text_translations_choice_text_translations"),
    ]

    operations = [
        migrations.CreateModel(
            name="FactSheet",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("factsheet_id", models.SlugField(unique=True, help_text="e.g. faktaark_04")),
                ("number", models.PositiveSmallIntegerField()),
                ("title", models.JSONField(default=dict)),
                ("content_markdown", models.JSONField(default=dict)),
                ("audio_urls", models.JSONField(blank=True, default=dict)),
                ("is_premium", models.BooleanField(default=True)),
                ("order", models.PositiveSmallIntegerField(default=0)),
                ("category", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="factsheets", to="content.category")),
                ("subcategory", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="factsheets", to="content.subcategory")),
            ],
            options={
                "db_table": "content_factsheet",
                "ordering": ["order", "number"],
            },
        ),
    ]
