# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-07-19 21:26
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budgeting', '0020_tutorial_show_on_help_page'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='has_signed_agreements',
            field=models.BooleanField(default=False, help_text='Has this user signed the agreements?', verbose_name='agreements'),
        ),
    ]
