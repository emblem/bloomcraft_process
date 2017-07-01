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
            'auth_token' : csrf.get_token(request)
            }
    else:
        response['user'] = None

    return JsonResponse(response)

@login_required
def logout_view(request):
    logout(request)
    return HttpResponse()

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
