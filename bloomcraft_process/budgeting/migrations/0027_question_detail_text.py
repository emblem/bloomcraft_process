# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-10-15 13:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budgeting', '0026_election_detail_text'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='detail_text',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
    ]
