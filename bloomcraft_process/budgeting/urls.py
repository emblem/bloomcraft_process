from django.conf.urls import url, include
from django.conf.urls.static import static
from django.conf import settings


from . import views

urlpatterns = []

apiurlpatterns = [
    url("^tutorial.json$", views.tutorial_view),
    url("^login.json$", views.login_view),
    url("^logout.json$", views.logout_view),
    url("^budget.json$", views.budget_view),
    url("^rent.json$", views.rent_view),
    url("^allocation.json$", views.allocation_view),
    url("^session.json$", views.session_view),
    url(r"^expenses/(?P<slug>[-\w]+)/expense.json$", views.expense_view),
    url(r"^expenses/(?P<slug>[-\w]+)/vote.json$", views.vote_view),
    url(r"^help.json$", views.help_view),
    url(r"^votes.json$", views.votes_view),
    url(r"^election/(?P<slug>[-\w]+)/vote.json$", views.score_vote_view),
]

urlpatterns += [
    url(r'^api/', include(apiurlpatterns)),
    url(r'^expense/create', views.ExpenseCreationView.as_view()),
    url(r'^expense/edit/(?P<slug>[-\w]+)', views.ExpenseEditView.as_view()),
    url(r'^expense/delete/(?P<slug>[-\w]+)', views.ExpenseDeleteView.as_view()),
    ]





