from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
# Register your models here.

class AllocationExpenseAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug":("name",)}

admin.site.register(User, UserAdmin)
admin.site.register(Lease)
admin.site.register(RentalRate)
admin.site.register(Budget)
admin.site.register(Allocation)
admin.site.register(AllocationExpense, AllocationExpenseAdmin)
admin.site.register(AllocationVote)

