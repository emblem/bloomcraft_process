# bloomcraft_process

```
virtualenv -p python3 venv
. venv/bin/activate
pip install django django-redis-sessions django-invitations django-websocket-redis redis django-bootstrap-form django-registration
```
Django backend : bloomcraft_process/*
Elm client : client/elm/*

cd bloomcraft_process; python manage.py runserver
cd client; brunch