from django.db import transaction
from django.http import HttpResponseForbidden, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.shortcuts import render
from django.views import View
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required
from registration.backends.hmac.views import RegistrationView
from django.middleware import csrf
from django.core import serializers
from django.utils import timezone
import json
import pprint
import random
import string

from django.http import HttpResponseRedirect

from .allocation import allocation_to_json, expense_to_json, RankedAllocator

from .models import *

@csrf_exempt
def login_view(request):
    data = json.loads(request.body.decode('utf-8'))
    credentials = data['credentials']
    user = authenticate(request, username = credentials['username'], password = credentials['password'])

    response = {}
    
    if user is not None:
        login(request, user)        
        response['user'] = {
            'username' : user.email,
            'fullname' : user.get_full_name(),
            }
    else:
        response['user'] = None

    response['auth_token'] = csrf.get_token(request)

    return JsonResponse(response)

@login_required
def logout_view(request):
    logout(request)

    response = {
        'user' : None,
        'auth_token' : csrf.get_token(request)
        }
    
    return JsonResponse(response)

class Register(RegistrationView):
    def create_inactive_user(self, form):
        new_user = form.save(commit=False)        
        new_user.is_active = False
        new_user.save()
        
        leases = form.cleaned_data['lease']
        for lease in leases:
            lease.members.add(new_user)
            lease.save()

        self.send_activation_email(new_user)
                    
        return new_user

class ExpenseDeleteView(UserPassesTestMixin, DeleteView):
    template_name = 'budgeting/expense_delete.html'
    success_url = '/process#expense'

    model = AllocationExpense

    def test_func(self):
        return self.request.user == self.get_object().owner

    def handle_no_permission(self):
        return HttpResponseForbidden()


    
class ExpenseEditView(UserPassesTestMixin, UpdateView):
    template_name = 'budgeting/expense_edit.html'
    
    def get_success_url(self):
        return '/process#expense/view/' + self.kwargs.get('slug')

    def test_func(self):
        return self.request.user == self.get_object().owner

    def handle_no_permission(self):
        return HttpResponseForbidden()

    model = AllocationExpense
    fields = ('name', 'partial_allowed', 'excess_allowed', 'requested_funds', 'detail_text')

    
class ExpenseCreationView(LoginRequiredMixin, CreateView):
    template_name = 'budgeting/expense_creation.html'
    success_url = '/process#expense'

    model = AllocationExpense
    fields = ('name', 'requested_funds', 'partial_allowed', 'excess_allowed', 'detail_text')

    def form_valid(self, form):
        self.object = form.save(commit = False)
        self.object.current_allocated_funds = 0
        self.object.slug = slugify(self.object.name)
        self.object.owner = self.request.user
        self.object.save()
        self.object.allocations.add(current_allocation())
        self.object.save()        
        # do something with self.object
        # remember the import: from django.http import HttpResponseRedirect
        return HttpResponseRedirect(self.get_success_url())


        
        

@require_http_methods(["GET"])
@login_required
def budget_view(request):
    budget = current_budget()

    rental_rates = RentalRate.objects.filter(budget = budget)
    budget = {
        "core_expenses" : budget.core_expenses,
        "leases" :
        [
            {
                "proposed_rent" : rate.rent,
                "current_rent" : rate.lease.rent,
                "name" : rate.lease.name,
                "admin_name" : rate.lease.admin.get_full_name() if rate.lease.admin else None
            }
            for rate in rental_rates
        ]
        , "lease_member" : [lease.name for lease in request.user.lease_set.all()]
        }

    try:
        budget['lease_admin'] = request.user.lease_admin.name
    except Lease.DoesNotExist:
        pass

    
    return JsonResponse({"budget" : budget})

def user_view(request):
    userJson = {}
    
    if request.user.is_authenticated():
        userJson['username'] = request.user.email

    return JsonResponse(userJson)

def current_budget():
    return Budget.objects.latest('id')

def current_allocation():
    return Allocation.objects.latest('id')

@login_required
@require_http_methods(['POST'])
def rent_view(request):
    lease = request.user.lease_admin
    budget = current_budget()
    rental_rate = RentalRate.objects.get(lease = lease, budget = budget)
    data = json.loads(request.body.decode('utf-8'))

    rental_rate.rent = data['new_rent']
    rental_rate.save()
    
    return JsonResponse({"lease" : lease.name, "rate" : rental_rate.rent })

def session_view(request):
    response = {}
    if request.user.is_authenticated():
        user = request.user
        response['user'] = {
            "username" : user.email,
            "fullname" : user.get_full_name(),
        }
    else :
        response['user'] = None
        
    response['auth_token'] = csrf.get_token(request)

    return JsonResponse(response)

@login_required
def allocation_view(request):
    allocation = current_allocation()
    expenses = RankedAllocator().allocate_funds(allocation, request.user)
    allocation_json = allocation_to_json(allocation, expenses)
    
    return JsonResponse({'allocation' : allocation_json})

@login_required
def votes_view(request):
    allocation = current_allocation()
    expenses = RankedAllocator().allocate_funds(allocation, request.user)    

    voteList = list()
    
    for expense in expenses:
        voteJson = None
        try:
            vote = AllocationVote.objects.get( user = request.user, expense = expense )
            voteJson = vote.toJson()
        except AllocationVote.DoesNotExist:
            pass
        
        voteList.append( {"expense" : expense_to_json(expense), "vote" : voteJson })

    return JsonResponse({'votes' : voteList})

@login_required
def expense_view(request, slug):
    allocation = current_allocation()
    expenses = RankedAllocator().allocate_funds(allocation, request.user)

    expense = [e for e in expenses if e.slug == slug][0]

    return JsonResponse({'expense' : expense_to_json(expense), 'user_is_owner' : request.user.email == expense.owner.email})

@login_required
def vote_view(request, slug):
    if request.method == 'GET':
        expense = AllocationExpense.objects.get(slug = slug)
        try:
            vote = AllocationVote.objects.get(user = request.user, expense = expense)
            vote = vote.toJson()
        except AllocationVote.DoesNotExist:
            vote = None
    

        return JsonResponse({"vote":vote})

    if request.method == 'POST':
        newVote = json.loads(request.body.decode('utf-8'))['vote']

        expense = AllocationExpense.objects.get(slug=slug)
        vote = AllocationVote(weight = newVote['weight'],
                              personal_abs_max = newVote['personal_abs_max'],
                              global_abs_max = newVote['global_abs_max'],
                              personal_pct_max = newVote['personal_pct_max'],
                              rank = newVote['rank'],
                              user = request.user,
                              expense = expense)

        try:
            existingVote = AllocationVote.objects.get(expense=expense, user=request.user)
            vote.id = existingVote.id
        except AllocationVote.DoesNotExist:
            pass

        vote.save()

        return JsonResponse({"result": "Thanks for voting :)"})

    if request.method == 'DELETE':
        try:
            expense = AllocationExpense.objects.get(slug = slug)
            vote = AllocationVote.objects.get(user = request.user, expense = expense)
            vote.delete()
        except (AllocationExpense.DoesNotExist, AllocationVote.DoesNotExist):
            return HttpResponseNotFound()

        return JsonResponse({"result": "success"})

def tutorial_to_json(tutorial):
    return { "header" : tutorial.header,
             "body" : tutorial.body }
    

    
@require_http_methods(["GET"])
def help_view(request):
    help_tutorials = Tutorial.objects.filter( show_on_help_page = True ).order_by( 'header' )

    help_json = [tutorial_to_json(tutorial) for tutorial in help_tutorials]
    
    return JsonResponse({"help": help_json})
    
@require_http_methods(["GET"])
def tutorial_view(request):
    no_tutorial_response = {"tutorial" : None}
    if not request.user.is_authenticated():
        return JsonResponse(no_tutorial_response)

    route = request.GET['route']
    print("Getting tutorial for " + route)

    try:
        tutorial = Tutorial.objects.filter( route = route ).exclude( seen_by = request.user ).latest('id')
    except Tutorial.DoesNotExist:
        return JsonResponse(no_tutorial_response)

    

    tutorial.seen_by.add(request.user)
    tutorial.save()
    
    return JsonResponse({ "tutorial" : tutorial_to_json(tutorial) })

def get_candidates(question):
    c= [ candidate.name for candidate in question.candidate_set.all() ]
    random.shuffle(c)
    return c

def get_questions(election):
    return [  { "name" : question.name,
                "prompt" : question.prompt,
                "candidates" : get_candidates(question) } for question in election.question_set.all() ]


def new_anon_id():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))

def election_to_json(election):
    return {
        "name" : election.name,
        "slug" : election.slug,
        "detail_text" : election.detail_text,
        "questions" : get_questions(election)
        }

@login_required
@transaction.atomic
def score_vote_view(request, slug):
    try:
        election = Election.objects.get(slug = slug)
    except Election.DoesNotExist:
        return JsonResponse({ "status" : "not_allowed",
                              "reason" : "No elections are currently defined" })
        
    if not election.is_live:
        return JsonResponse({ "status" : "not_allowed",
                              "reason": "There is currently no active election" })

    if election.start_time > timezone.now():
        return JsonResponse({ "status" : "not_allowed",
                              "reason": "The " + election.name + " election has not started yet.  It begins " + election.start_time.strftime("%A, %d. %B %Y %I:%M%p %Z") })

    if election.end_time < timezone.now():
        return JsonResponse({ "status" : "not_allowed",
                              "reason": "The " + election.name + " election has ended.  It ended " + election.end_time.strftime("%A, %d. %B %Y %I:%M%p %Z") })
    
    if(request.user.election_set.filter(pk = election.pk).exists()):
        return JsonResponse({ "status" : "not_allowed",
                              "reason": "It appears you've already voted in this election. Please contact stuart@bloomcraft.space if you believe this is incorrect."})

    if request.method == "GET":
        return JsonResponse({'status' : 'success',
                             'election' : election_to_json(election)})

    elif request.method == "POST":
        body = json.loads(request.body.decode('utf-8'))
        if 'submit' in body and body['submit'] == 'confirmed':
            for av in serializers.deserialize("json", request.session['ballot']['anon_id']):
                anon_voter = av
            anon_voter.save()
            pprint.pprint(anon_voter.object.pk)
            for vote in serializers.deserialize("json", request.session['ballot']['votes']):
                vote.object.voter = anon_voter.object
                vote.save()
            election.voters.add(request.user)            
            return JsonResponse({ "status" : "success", "anon_id" : anon_voter.object.name })
            
        ballot = body['ballot']
        anon_voter = AnonymousVoter(name = new_anon_id())
        questions = Question.objects.filter(election = election)
        votes = []
        
        try:
            for vote in ballot['votes']:
                print(vote)
                question = election.question_set.get(name = vote['question'])
                candidate = Candidate.objects.get(question = question, name = vote['candidate'])
                votes.append(ScoreVote(voter = anon_voter, candidate = candidate, score = vote['score']))
        except Exception as e:
            raise e
            return JsonResponse( {"status" : "error", "reason" : "malformed ballot"} )
        request.session['ballot'] = { 'votes' : serializers.serialize("json",votes),
                                      'anon_id' : serializers.serialize("json", [anon_voter]) }
        return JsonResponse( {
            'status' : 'success',
            'election' : election_to_json(election),
            'ballot' : [{'question' : v.candidate.question.name, 'candidate' : v.candidate.name, 'score' : v.score } for v in votes ] })
