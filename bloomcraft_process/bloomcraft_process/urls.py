"""bloomcraft_process URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.views.static import serve as static_serve

urlpatterns = [
    url(r'^process/admin/', admin.site.urls),    
    url(r'^process/api/', include('budgeting.urls')),
    url(r'^process/invitations/', include('invitations.urls', namespace='invitations'))    
]

if settings.DEBUG:
    urlpatterns += [url(
        r'^process/elm.js$', static_serve, kwargs={'document_root': settings.STATIC_ROOT, 'path': 'elm.js'})]

    urlpatterns += [url(
        r'^process$', static_serve, kwargs={'document_root': settings.STATIC_ROOT, 'path': 'index.html'})]
