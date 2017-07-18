# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-07-18 00:06
from __future__ import unicode_literals

import budgeting.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budgeting', '0017_tutorial_route'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='user',
            managers=[
                ('objects', budgeting.models.UserManager()),
            ],
        ),
        migrations.RemoveField(
            model_name='user',
            name='username',
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(error_messages={'unique': 'A user with that email address already exists.'}, max_length=254, unique=True, verbose_name='email address'),
        ),
    ]
