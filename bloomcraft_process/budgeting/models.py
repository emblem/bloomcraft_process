from django.db import models

class Lease(models.Model):
    #Name of the Leaseholding Entity
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Budget(models.Model):
    start_date = models.DateField()
    core_expenses = models.IntegerField(default=0)

    def __str__(self):
        return str(self.start_date)
    
class RentalRate(models.Model):
    #Monthly rent
    rent = models.IntegerField(default=0)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE)

    def __str__(self):
        return self.lease.name
    
    
