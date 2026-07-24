from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0004_factsheet"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="factsheet",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="questions",
                to="content.factsheet",
            ),
        ),
    ]
