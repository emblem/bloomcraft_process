# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-07-02 20:14
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('budgeting', '0009_auto_20170702_1441'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='DiscretionaryAllocation',
            new_name='Allocation',
        ),
        migrations.RenameModel(
            old_name='DiscretionaryExpense',
            new_name='AllocationExpense',
        ),
        migrations.RenameModel(
            old_name='DiscretionaryVote',
            new_name='AllocationVote',
        ),
    ]
