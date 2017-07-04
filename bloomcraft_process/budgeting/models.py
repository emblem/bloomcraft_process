from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.template.defaultfilters import slugify

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

    
class Allocation(models.Model):
    decision_date = models.DateField()
    amount = models.IntegerField(default=0)

    def __str__(self):
        return str(self.decision_date) + ": $" + str(self.amount)

    
class AllocationExpense(models.Model):
    name = models.CharField(max_length=200, unique = True)

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    allocations = models.ManyToManyField(Allocation)    

    partial_allowed = models.BooleanField(default = True)
    excess_allowed = models.BooleanField(default = False)
    requested_funds = models.IntegerField()
    current_allocated_funds = models.IntegerField()
    detail_text = models.TextField()

    slug = models.SlugField()

    def __str__(self):
        return self.name + " by " + self.owner.username

    def save(self, *args, **kwargs):
        if not self.id:
            # Newly created object, so set slug
            self.slug = slugify(self.name)

        super(AllocationExpense, self).save(*args, **kwargs)
        
        
class AllocationVote(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    expense = models.ForeignKey(AllocationExpense, on_delete = models.CASCADE)

    weight = models.FloatField()
    personal_abs_max = models.IntegerField(blank=True, null=True)
    global_abs_max = models.IntegerField(blank=True, null=True)

    personal_pct_max = models.FloatField(blank=True, null=True)
    global_pct_max = models.FloatField(blank=True, null=True)
    
    class Meta:
        unique_together = ('user', 'expense')

    def __str__(self):
        return "Vote by " + self.user.username + " on " + self.expense.name

    def toJson(self):
        return { "weight" : self.weight,
                 "personal_abs_max" : self.personal_abs_max,
                 "global_abs_max": self.global_abs_max,
                 "personal_pct_max": self.personal_pct_max,
                 "global_pct_max": self.global_pct_max }
                 
                 
                 
                 
                 
