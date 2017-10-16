from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import six, timezone
from django.dispatch import receiver
from django.template.defaultfilters import slugify
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.validators import ASCIIUsernameValidator, UnicodeUsernameValidator
from django.core.mail import send_mail
from django.core.validators import MaxValueValidator, MinValueValidator

import math

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, first_name, last_name, **extra_fields):
        """
        Creates and saves a User with the given username, email and password.
        """
        email = self.normalize_email(email)
        user = self.model(email=email, first_name = first_name, last_name = last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password, first_name, last_name, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, first_name, last_name, **extra_fields)

    def create_superuser(self, email, password, first_name, last_name, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, first_name, last_name, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    An abstract base class implementing a fully featured User model with
    admin-compliant permissions.

    Username and password are required. Other fields are optional.
    """

    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    email = models.EmailField(_('email address'), blank=False, unique=True,
                              error_messages = { 'unique': _("A user with that email address already exists."),
                              })
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.'),
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )

    has_signed_agreements = models.BooleanField(
        _('agreements'), default=False, help_text=_('Has this user signed the agreements?'))
    
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    objects = UserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        abstract = False

    def clean(self):
        super(AbstractBaseUser, self).clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        "Returns the short name for the user."
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """
        Sends an email to this User.
        """
        send_mail(subject, message, from_email, [self.email], **kwargs)

def get_sentinel_user():
    return get_user_model().objects.get_or_create(email='deleted@deleted.com')[0]

class Lease(models.Model):
    #Name of the Leaseholding Entity
    name = models.CharField(max_length=200, unique = True)
    sqft = models.IntegerField(default=0)
    original_rent = models.IntegerField(default=0)
    rent = models.IntegerField(default=0)
    admin = models.OneToOneField(User
                                 , on_delete=models.SET_NULL
                                 , blank=True
                                 , null=True
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
    name = models.CharField(max_length=200, unique = True,
                            verbose_name = "Name for this expense" )

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    allocations = models.ManyToManyField(Allocation)    

    partial_allowed = models.BooleanField(default = True,
                                          verbose_name = "Willing to accept less than the requested amount?")
    excess_allowed = models.BooleanField(default = False,
                                         verbose_name = "Willing to accept more than the requested amount?")
    
    requested_funds = models.IntegerField(verbose_name = "How much are you requesting?")
    current_allocated_funds = models.IntegerField()
    detail_text = models.TextField(verbose_name = "More information about this expense")

    slug = models.SlugField()

    def __str__(self):
        return self.name + " by " + self.owner.get_full_name()

    def save(self, *args, **kwargs):
        if not self.id:
            # Newly created object, so set slug
            self.slug = slugify(self.name)

        super(AllocationExpense, self).save(*args, **kwargs)
        
        
class AllocationVote(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    expense = models.ForeignKey(AllocationExpense, on_delete = models.CASCADE)

    weight = models.FloatField(default=1)
    rank = models.IntegerField(default=1)
    personal_abs_max = models.IntegerField(blank=True, null=True)
    global_abs_max = models.IntegerField(blank=True, null=True)

    personal_pct_max = models.FloatField(blank=True, null=True)
    global_pct_max = models.FloatField(blank=True, null=True)
    
    class Meta:
        unique_together = ('user', 'expense')

    def __str__(self):
        return "Vote by " + self.user.get_full_name() + " on " + str(self.expense.name) + " <" + str(self.personal_abs_max) + ", "  + str(self.personal_pct_max) + ", "  + str(self.global_abs_max) + ", "  + str(self.global_pct_max) + ">"

    def toJson(self):
        return { "weight" : self.weight,
                 "rank" : self.rank,
                 "personal_abs_max" : self.personal_abs_max,
                 "global_abs_max": self.global_abs_max,
                 "personal_pct_max": self.personal_pct_max,
                 "global_pct_max": self.global_pct_max }

class Tutorial(models.Model):
    seen_by = models.ManyToManyField(User, blank=True)
    header = models.CharField(max_length = 200)
    body = models.TextField()
    route = models.CharField(max_length = 200)
    show_on_help_page = models.BooleanField(default=False)

    def __str__(self):
        return str('"' + self.header + '" on "' + self.route + '"')
                 
                 
### Voting Stuff, someday this should go in its own module

class Election(models.Model):
    name = models.CharField(max_length = 200, unique = True)
    detail_text = models.TextField()
    voters = models.ManyToManyField(User, blank = True)
    slug = models.SlugField()
    is_live = models.BooleanField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.id:
            # Newly created object, so set slug
            self.slug = slugify(self.name)

        super(Election, self).save(*args, **kwargs)

class Question(models.Model):
    name = models.CharField(max_length = 200)
    prompt = models.CharField(max_length = 200)
    election = models.ForeignKey(Election, on_delete = models.CASCADE)
    def __str__(self):
        return self.name
        
class Candidate(models.Model):
    name = models.CharField(max_length = 200)
    question = models.ForeignKey(Question, on_delete = models.CASCADE)
    def __str__(self):
        return self.name

class AnonymousVoter(models.Model):
    name = models.CharField(max_length = 200, unique = True)
    def __str__(self):
        return self.name
    
class ScoreVote(models.Model):
    voter = models.ForeignKey(AnonymousVoter, on_delete = models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete = models.CASCADE)
    score = models.IntegerField(
        default = 0,
        validators = [
            MaxValueValidator(10),
            MinValueValidator(0)
        ])
    def __str__(self):
        return "ScoreVote for " + self.candidate.question.name + "/" + self.candidate.name + " by " + self.voter.name
