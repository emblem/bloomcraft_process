from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import ugettext_lazy as _
from django.utils.html import format_html_join, format_html
from django.utils.safestring import mark_safe
from .models import *
from .forms import *
# Register your models here.
import pprint

class AllocationExpenseAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug":("name",)}

class CandidateInline(admin.TabularInline):
    model = Candidate

class QuestionInline(admin.TabularInline):
    model = Question

class QuestionAdmin(admin.ModelAdmin):
    inlines = [CandidateInline]
    
class ElectionAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug":("name",)}
    inlines = [QuestionInline]
    readonly_fields = ('voter_summary', 'score_summary', 'voter_summary')

    def voter_summary(self, instance):
        voters = [(voter.first_name + " " + voter.last_name,) for voter in instance.voters.all()]
        return format_html_join(mark_safe('<br/>'), '{}', voters)

    def question_summary(self, question):
        print (question.name)
        result = mark_safe( "<strong>" ) + question.name + mark_safe( "</strong>" )
        print(result)
        scores = []
        for candidate in question.candidate_set.all():
            score = sum([vote.score for vote in candidate.scorevote_set.all()])
            print(score)
            scores.append( (candidate.name, score) )

        result += mark_safe("<ul>")
        result += format_html_join('\n', "<li> {} : {} </li>", scores)
        result += mark_safe("</ul>")
        return result
    
    def score_summary(self, instance):
        result = ""        
        for question in instance.question_set.all():
            result += self.question_summary(question)
            
        return format_html(result)

    def voter_summary(self, instance):
        votes = ScoreVote.objects.filter(candidate__question__election = instance).order_by('voter','candidate__question', 'candidate')
        vote_data = [(vote.voter.name, vote.candidate.question.name, vote.candidate.name, vote.score) for vote in votes]
        return format_html_join(mark_safe("<br/>"), "{} : {} : {} : {}", vote_data)


    voter_summary.short_description = "Who Voted"
    score_summary.short_description = "Results"
    voter_summary.short_description = "Anonymous Votes"
    
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
admin.site.register(Question, QuestionAdmin)
admin.site.register(AnonymousVoter)
