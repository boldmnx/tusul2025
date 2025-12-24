from django.contrib import admin
from timeapp import models
# Register your models here.


admin.site.register(models.ClassGroup)
admin.site.register(models.Course)
admin.site.register(models.Room)
admin.site.register(models.Teacher)
admin.site.register(models.Schedule)
