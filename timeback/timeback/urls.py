
from django.contrib import admin
from django.urls import path
from timeapp import views, viewsForm
from timeapp.views import schedule_view
from accounts import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', schedule_view, name='schedule'),
    path('service/', viewsForm.checkService, name='scheduleForm'),
    path('user_login/', views.user_login, name='user_login'),
    path('user_logout/', views.user_logout, name='user_logout'),
    path('user_register/', views.user_register, name='user_register'),
    path("api/current_user/", views.current_user, name="current_user"),
]
