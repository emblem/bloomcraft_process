# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-10-15 00:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budgeting', '0025_auto_20171014_2049'),
    ]

    operations = [
        migrations.AddField(
            model_name='election',
            name='detail_text',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
    ]
