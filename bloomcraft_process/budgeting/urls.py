from django.conf.urls import url, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf import settings
from django.views.static import serve as static_serve

from . import views

urlpatterns = [
    url('^', include('django.contrib.auth.urls')),
]

if settings.DEBUG:
    urlpatterns += url(
        r'^$', static_serve, kwargs={'document_root': settings.STATIC_ROOT, 'path': 'index.html'}),
