from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.middleware import csrf
from django.core import serializers
import json
import pprint

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
            'username' : user.username,
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
                "admin_name" : rate.lease.admin.get_full_name()
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
        userJson['username'] = request.user.username

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
            "username" : user.username,
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
def expense_view(request, slug):
    allocation = current_allocation()
    expenses = RankedAllocator().allocate_funds(allocation, request.user)

    expense = [e for e in expenses if e.slug == slug][0]
    
    return JsonResponse({'expense' : expense_to_json(expense)})

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
                              user = request.user,
                              expense = expense)

        try:
            existingVote = AllocationVote.objects.get(expense=expense, user=request.user)
            vote.id = existingVote.id
        except AllocationVote.DoesNotExist:
            pass

        vote.save()

        return JsonResponse({"result": "Thanks for voting :)"})
        
