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

from .models import *

@csrf_exempt
@ensure_csrf_cookie
def login_view(request):
    data = json.loads(request.body.decode('utf-8'))
    user = authenticate(request, username = data['username'], password = data['password'])

    response = {}
    
    if user is not None:
        login(request, user)
        response['logged_in'] = True
        response['username'] = user.username
    else:
        response['logged_in'] = False

    response['csrf_token'] = csrf.get_token(request)

    return JsonResponse(response)

def logout_view(request):
    logout(request)
    return HttpResponse()

@require_http_methods(["GET"])
def budget_view(request):
    budget = current_budget()

    rental_rates = RentalRate.objects.filter(budget = budget)
    
    budgetJson = {
        "core_expenses" : budget.core_expenses,
        "rents" : [{"rent" : rate.rent, "lease" : rate.lease.name} for rate in rental_rates]
    }
    return JsonResponse(budgetJson)

def user_view(request):
    userJson = {}
    
    if request.user.is_authenticated():
        userJson['username'] = request.user.username

    return JsonResponse(userJson)

def current_budget():
    return Budget.objects.latest('id')

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

