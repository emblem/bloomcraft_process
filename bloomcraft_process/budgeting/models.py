from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver

import math

class User(AbstractUser):
    pass

def get_sentinel_user():
    return get_user_model().objects.get_or_create(username='deleted')[0]

class Lease(models.Model):
    #Name of the Leaseholding Entity
    name = models.CharField(max_length=200, unique = True)
    sqft = models.IntegerField(default=0)
    original_rent = models.IntegerField(default=0)
    rent = models.IntegerField(default=0)
    admin = models.OneToOneField(User
                              , on_delete=models.SET(get_sentinel_user)
                              , related_name="lease_admin" )
    members = models.ManyToManyField(User, blank = True)

    def __str__(self):
        return self.name

class Budget(models.Model):
    start_date = models.DateField()
    core_expenses = models.IntegerField(default=0)

    def __str__(self):
        return str(self.start_date)

def current_income():
    return sum(lease.rent for lease in Lease.objects.all())
    
@receiver(models.signals.post_save, sender = Budget)
def create_default_rental_rates(sender, instance, created, *args, **kwargs):
    if not created: return

    budget = instance

    base_change = budget.core_expenses / current_income()
        
    for lease in Lease.objects.all():
        RentalRate(rent = math.ceil(lease.rent * base_change), budget = instance, lease = lease).save()
    
class RentalRate(models.Model):
    #Monthly rent
    rent = models.IntegerField(default=0)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('lease', 'budget')
    
    def __str__(self):
        return str(self.budget) + " / " + self.lease.name

    
class DiscretionaryAllocation(models.Model):
    decision_date = models.DateField()
    amount = models.IntegerField(default=0)

    def __str__(self):
        return str(self.decision_date) + ": $" + str(self.amount)

    
class DiscretionaryExpense(models.Model):
    name = models.CharField(max_length=200, unique = True)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    allocations = models.ManyToManyField(DiscretionaryAllocation)    

    partialAllowed = models.BooleanField(default = True)
    excessAllowed = models.BooleanField(default = False)
    requestedFunds = models.IntegerField()
    allocatedFunds = models.IntegerField()

    def __str__(self):
        return self.name + " by " + self.owner.username
        
        
class DiscretionaryVote(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    expense = models.ForeignKey(DiscretionaryExpense, on_delete = models.CASCADE)

    weight = models.FloatField()
    personal_abs_max = models.IntegerField()
    global_abs_max = models.IntegerField()

    personal_pct_max = models.FloatField()
    global_pct_max = models.FloatField()
    
    class Meta:
        unique_together = ('user', 'expense')

    def __str__(self):
        return "Vote by " + self.user.name + " on " + self.expense.name + " for " + self.expense.allocation
