from django.conf.urls import url, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf import settings
from django.views.static import serve as static_serve

from . import views


urlpatterns = [
    url("^login.json", views.login_view),
    url("^logout.json", views.logout_view),
    url("^budget.json", views.budget_view),
    url("^user.json", views.user_view),
    url("^rent.json", views.rent_view)
]

if settings.DEBUG:
    urlpatterns += [url(
        r'^$', static_serve, kwargs={'document_root': settings.STATIC_ROOT, 'path': 'index.html'})]
    
    urlpatterns += [url(
        r'^elm.js', static_serve, kwargs={'document_root': settings.STATIC_ROOT, 'path': 'elm.js'})]
