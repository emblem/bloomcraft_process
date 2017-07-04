from django.conf.urls import url, include
from django.conf.urls.static import static
from django.conf import settings


from . import views

urlpatterns = []


urlpatterns += [
    url("^tutorial.json$", views.tutorial_view),
    url("^login.json$", views.login_view),
    url("^logout.json$", views.logout_view),
    url("^budget.json$", views.budget_view),
#    url("^api/user.json", views.user_view),
    url("^rent.json$", views.rent_view),
    url("^allocation.json$", views.allocation_view),
    url("^session.json$", views.session_view),
    url(r"^expenses/(?P<slug>[-\w]+)/expense.json$", views.expense_view),
    url(r"^expenses/(?P<slug>[-\w]+)/vote.json$", views.vote_view),
]




