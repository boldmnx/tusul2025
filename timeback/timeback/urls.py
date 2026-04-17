
from django.contrib import admin
from django.urls import path
from timeapp import views, viewsForm
from timeapp.views import schedule_view, schedule_pdf_view, teacher_schedule, teacher_schedule_pdf_view,schedule_excel_view
from accounts import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', schedule_view, name='schedule'),
    path('schedule_pdf_view/', schedule_pdf_view, name='schedule_pdf_view'),
    path('teacher_schedule/', teacher_schedule, name='teacher_schedule'),
    path('teacher_schedule_pdf_view/<str:teacher_name>/', teacher_schedule_pdf_view, name='teacher_schedule_pdf_view'),

    path('service/', viewsForm.checkService, name='scheduleForm'),
    path('user_login/', views.user_login, name='user_login'),
    path('user_logout/', views.user_logout, name='user_logout'),
    path('schedule/excel/', schedule_excel_view, name='schedule_excel'),
    path('user_register/', views.user_register, name='user_register'),
    path("api/current_user/", views.current_user, name="current_user"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
