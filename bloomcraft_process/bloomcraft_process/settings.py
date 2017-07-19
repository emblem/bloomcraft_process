"""
Django settings for bloomcraft_process project.

Generated by 'django-admin startproject' using Django 1.11.2.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/


# SECURITY WARNING: don't run with debug turned on in production!

try :
    DEBUG = (os.environ['DEBUG'] == "True")
except KeyError:
    DEBUG = False

# SECURITY WARNING: keep the secret key used in production secret!
if DEBUG:
    SECRET_KEY = 'tk2=w*2kb0u4*9-)f&wnjv=gc(7@m78#0)a6l6o_(871!=m@b!'
    ALLOWED_HOSTS = ["*"]
else:
    try :
        print("Running as PROD, so pulling SECRET_KEY from ENV")
        SECRET_KEY = os.environ['SECRET_KEY']
        ALLOWED_HOSTS = ["bloomcraft.space"]
    except KeyError:
        raise Exception("You probably want to run with environment variable DEBUG=True, or set SECRET_KEY")


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
#    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'budgeting.apps.BudgetingConfig',
    'ws4redis',
    'bootstrapform',
]

ACCOUNT_ACTIVATION_DAYS = 3


DEFAULT_FROM_EMAIL = "Bloomcraft Automation <donotreply@bloomcraft.space>"
EMAIL_TIMEOUT = 15

SITE_ID=1

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bloomcraft_process.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, "templates")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.static',
                'ws4redis.context_processors.default'
            ],
        },
    },
]

WSGI_APPLICATION = 'bloomcraft_process.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'US/Eastern'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_URL = '/process/static/'
STATIC_ROOT = '../static'

WEBSOCKET_URL ='/ws/'

WSGI_APPLICATION = 'ws4redis.django_runserver.application'

SESSION_ENGINE = 'redis_sessions.session'
SESSION_REDIS_PREFIX = 'session'

AUTH_USER_MODEL = 'budgeting.User'

APPEND_SLASH = True

if not DEBUG:
    SECURE_HSTS_SECONDS = 3600
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_HSTS_PRELOAD = True

EMAIL_HOST = "ghost.mxroute.com"
EMAIL_PORT = "465"
EMAIL_HOST_USER = "donotreply@bloomcraft.space"
EMAIL_HOST_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
EMAIL_SUBJECT_PREFIX = "[Bloomcraft]"
EMAIL_USE_SSL = "True"

if EMAIL_HOST_PASSWORD == "" and DEBUG == False:
    raise Exception("No Mail Password Found")


LOGIN_REDIRECT_URL = "/process#home"
LOGIN_URL = "/process/accounts/login"
