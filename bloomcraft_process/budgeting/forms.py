from django.contrib.auth.forms import UserCreationForm
from django.forms import ModelMultipleChoiceField, CheckboxSelectMultiple, EmailField, Form
from registration.forms import RegistrationForm
from django.utils.translation import ugettext_lazy as _
from django.utils.safestring import mark_safe
from django.forms import SelectMultiple

from .models import User, Lease

class CustomUserCreationForm(UserCreationForm):
    """
    A form that creates a user, with no privileges, from the given email and
    password.
    """

    def __init__(self, *args, **kargs):
        super(CustomUserCreationForm, self).__init__(*args, **kargs)

    class Meta:
        model = User
        fields = ("email",)

        
class CustomRegistrationForm(RegistrationForm):
    email = EmailField(
        label = _("Email Address"),
        required=True
    )

    lease = ModelMultipleChoiceField(queryset=Lease.objects.order_by("name"),
                                     help_text = 'Hold down "Control", or "Command" on a Mac, to select more than one.',
                                     label = "Your Lease or Leases",
                                     widget = SelectMultiple(attrs ={'size':'15'}))

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "lease", 'has_signed_agreements')
        labels = {'has_signed_agreements': 'I Have Signed the Agreements'}
        help_texts = {'has_signed_agreements':
                      mark_safe('Have you signed the <a href="https://bloomcraft.space/agreements/">Bloomcraft Agreements</a>? (You can do it online right now)') }
