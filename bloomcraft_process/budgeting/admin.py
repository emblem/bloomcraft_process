from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import ugettext_lazy as _
from .models import *
from .forms import *
# Register your models here.

class AllocationExpenseAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug":("name",)}

class CandidateInline(admin.TabularInline):
    model = Candidate
    
class ElectionAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug":("name",)}
    inlines = [CandidateInline]
    
class TutorialAdmin(admin.ModelAdmin):
    filter_horizontal = ['seen_by']

class LeaseAdmin(admin.ModelAdmin):
    filter_horizontal = ['members']

class EmailUserAdmin(UserAdmin):
    ordering = ('email',)
    list_display = ('email', 'first_name', 'last_name', 'is_staff')

    # The forms to add and change user instances

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference the removed 'username' field
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name')}
        ),
    )
#    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
admin.site.register(User, EmailUserAdmin)
admin.site.register(Lease, LeaseAdmin)
admin.site.register(RentalRate)
admin.site.register(Budget)
admin.site.register(Allocation)
admin.site.register(AllocationExpense, AllocationExpenseAdmin)
admin.site.register(AllocationVote)
admin.site.register(Tutorial, TutorialAdmin)
admin.site.register(Election, ElectionAdmin)
admin.site.register(ScoreVote)
admin.site.register(Candidate)
admin.site.register(AnonymousVoter)
