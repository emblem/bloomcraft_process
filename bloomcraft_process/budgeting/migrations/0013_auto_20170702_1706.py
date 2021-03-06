# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-07-02 21:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budgeting', '0012_auto_20170702_1705'),
    ]

    operations = [
        migrations.AlterField(
            model_name='allocationvote',
            name='global_abs_max',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='allocationvote',
            name='global_pct_max',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='allocationvote',
            name='personal_abs_max',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='allocationvote',
            name='personal_pct_max',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
