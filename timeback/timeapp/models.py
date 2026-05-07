from django.db import models
from django.contrib.auth.models import User

# models.py


class Teacher(models.Model):
    name = models.CharField(max_length=100)
    ovog = models.CharField(max_length=50, blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    photo = models.ImageField(upload_to="teachers/", blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)

    days_off = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.ovog} {self.name}"


class Room(models.Model):
    ROOM_TYPES = [
        ('лекц', 'Лекц'),
        ('лаб', 'Лаб'),
        ('семинар', 'Семинар'),
        ('практик', 'Практик'),
    ]
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    room_number = models.JSONField(default=list)

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, )  # ← эзэмшигч

    # class Meta:
    #     unique_together = ('room_type', 'room_number')

    def __str__(self):
        return f"{self.room_number} ({self.room_type})"


class ClassGroup(models.Model):
    hutulbur = models.CharField(max_length=100)
    group_name = models.CharField(max_length=20)
    damjaa = models.IntegerField()
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, )  # ← эзэмшигч

    def __str__(self):
        return f"{self.hutulbur} {self.group_name}"


class Course(models.Model):
    LESSON_TYPES = [
        ('лекц', 'Лекц'),
        ('семинар', 'Семинар'),
        ('лаб', 'Лаб'),
        ('практик', 'Практик'),
    ]

    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPES)

    # ⭐ лекцийн дараа сем лаб ороход хэрэгтээ
    parent_lecture = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='children'
    )
    # ✅ нэг хичээл 7хоногт 3удаа ороход хэрэгтэ нэг ангид Жнь: Англи хэл
    slots_per_week = models.PositiveSmallIntegerField(
        null=True,    # DB-д хоосон байж болно
        blank=True,   # Form/Validation-д хоосон байж болно
        default=None
    )

    available_room_types = models.JSONField(default=list)
    group_list = models.ManyToManyField(ClassGroup, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=2)

    def __str__(self):
        return f'{self.name} ({self.lesson_type})'


class Schedule(models.Model):

    DAYS = [
        ('Mon', 'Даваа'),
        ('Tue', 'Мягмар'),
        ('Wed', 'Лхагва'),
        ('Thu', 'Пүрэв'),
        ('Fri', 'Баасан'),
        ('Sat', 'Бямба'),
    ]

    TIMES = [
        ('08:00-09:30', '08:00-09:30'),
        ('09:40-11:10', '09:40-11:10'),
        ('11:20-12:50', '11:20-12:50'),
        ('13:30-15:00', '13:30-15:00'),
        ('15:10-16:40', '15:10-16:40'),
    ]

    day = models.CharField(max_length=10, choices=DAYS)
    time = models.CharField(max_length=20, choices=TIMES)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.day} {self.time} - {self.course.name}"
