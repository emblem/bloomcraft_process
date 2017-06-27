from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
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
    
    if user is not None:
        login(request, user)
        logged_in = True
    else:
        logged_in = False

    csrf_token = csrf.get_token(request)    

    return JsonResponse({'csrf_token' : csrf_token,
                         'logged_in' : logged_in,
                         'username' : user.username })

def logout_view(request):
    logout(request)
    return HttpResponse()

@require_http_methods(["GET"])
def budget_view(request):
    budget = Budget.objects.latest('id')

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
