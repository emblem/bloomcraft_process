from django.conf.urls import url, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf import settings
from django.views.static import serve as static_serve

from . import views

urlpatterns = []


urlpatterns += [
    url("^api/login.json", views.login_view),
    url("^api/logout.json", views.logout_view),
    url("^api/budget.json", views.budget_view),
#    url("^api/user.json", views.user_view),
    url("^api/rent.json", views.rent_view),
    url("^api/allocation.json", views.allocation_view),
    url("^api/session.json", views.session_view)
]

if settings.DEBUG:
    urlpatterns += [url(
        r'^elm.js', static_serve, kwargs={'document_root': settings.STATIC_ROOT, 'path': 'elm.js'})]

    urlpatterns += [url(
        r'^(?!api/).*', static_serve, kwargs={'document_root': settings.STATIC_ROOT, 'path': 'index.html'})]



