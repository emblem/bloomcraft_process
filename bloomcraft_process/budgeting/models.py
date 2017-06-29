from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver

class User(AbstractUser):
    pass

def get_sentinel_user():
    return get_user_model().objects.get_or_create(username='deleted')[0]

class Lease(models.Model):
    #Name of the Leaseholding Entity
    name = models.CharField(max_length=200)
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

@receiver(models.signals.post_save, sender = Budget)
def create_default_rental_rates(sender, instance, created, *args, **kwargs):
    if not created: return

    for lease in Lease.objects.all():
        RentalRate(rent = lease.rent, budget = instance, lease = lease).save()
    
class RentalRate(models.Model):
    #Monthly rent
    rent = models.IntegerField(default=0)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('lease', 'budget')
    
    def __str__(self):
        return str(self.budget) + " / " + self.lease.name
    
    
