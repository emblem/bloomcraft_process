from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
# Register your models here.

class AllocationExpenseAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug":("name",)}

class TutorialAdmin(admin.ModelAdmin):
    filter_horizontal = ['seen_by']

class LeaseAdmin(admin.ModelAdmin):
    filter_horizontal = ['members']

admin.site.register(User, UserAdmin)
admin.site.register(Lease, LeaseAdmin)
admin.site.register(RentalRate)
admin.site.register(Budget)
admin.site.register(Allocation)
admin.site.register(AllocationExpense, AllocationExpenseAdmin)
admin.site.register(AllocationVote)
admin.site.register(Tutorial, TutorialAdmin)

