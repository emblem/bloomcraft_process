from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
# Register your models here.

admin.site.register(User, UserAdmin)
admin.site.register(Lease)
admin.site.register(RentalRate)
admin.site.register(Budget)
admin.site.register(DiscretionaryAllocation)
admin.site.register(DiscretionaryExpense)
admin.site.register(DiscretionaryVote)

