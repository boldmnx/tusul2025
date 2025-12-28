
import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-o33yhh_7hx9=l*^r$z!jm(i0%_6$2wqew6-cd&8_cj)^rj^tbd'

DEBUG = True

ALLOWED_HOSTS = []


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'timeapp',
    'accounts',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'timeback.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'timeapp/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'timeback.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


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

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
STATICFILES_DIRS = [
    BASE_DIR / "static",  # таны проект доторх static folder
]

STATIC_ROOT = BASE_DIR / "staticfiles"


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = False  # development-д

def sendResponse(statusCode, data=[], action=None):
    resJson = {}
    resJson['action'] = action
    resJson['resultCode'] = statusCode
    resJson['resultMessage'] = statusMessage[statusCode]
    resJson['data'] = data
    resJson['size'] = len(data)
    resJson['curDate'] = datetime.datetime.now().strftime('%Y/%m/%d %T')
    return resJson


statusMessage = {
    1000: 'Бүртгэлтэй хэрэглэгч байна',
    1001: 'Token-ний хугацаа дууссан эсвэл хүчингүй token байна',
    1002: 'Баталгаажсан хэрэглэгч байна',
    1004: 'Бүртгэлгүй хэрэглэгч байна',

    200: 'Success',
    204: 'No Content',
    301: "Bad request",

    404: "Not found",
    4000: 'Invalid Method',
    4001: 'Invalid Json',
    4002: 'Action Missing',
    4003: 'Invalid Action',
    4004: 'Key дутуу',
    4005: 'Database Error',
    4006: '`pid` байхгүй байна',
    4007: 'Password буруу байна',
    4008: 'Бүртгэлээ баталгаажуулна уу',
    4009: 'Action key байхнүй байна',

    5000: 'Server Error',
    5004: 'Register Service дотоод алдаа',
}
