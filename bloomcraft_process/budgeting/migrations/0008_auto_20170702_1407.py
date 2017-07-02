# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-07-02 18:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budgeting', '0007_auto_20170702_1355'),
    ]

    operations = [
        migrations.RenameField(
            model_name='discretionaryexpense',
            old_name='initialFunds',
            new_name='allocatedFunds',
        ),
        migrations.AddField(
            model_name='discretionaryexpense',
            name='allocations',
            field=models.ManyToManyField(to='budgeting.DiscretionaryAllocation'),
        ),
        migrations.AlterField(
            model_name='discretionaryexpense',
            name='name',
            field=models.CharField(max_length=200, unique=True),
        ),
        migrations.AlterUniqueTogether(
            name='discretionaryexpense',
            unique_together=set([]),
        ),
        migrations.RemoveField(
            model_name='discretionaryexpense',
            name='allocation',
        ),
    ]
