# Generated by Django 5.1.1 on 2024-11-23 01:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0008_remove_costo_calculo_monto_costo_cierre_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='categoria',
            name='sla_horas',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
    ]