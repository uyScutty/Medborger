from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0002_subcategory_bilingual_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="text_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="choice",
            name="text_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
