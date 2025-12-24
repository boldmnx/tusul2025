from django.db import models


class Teacher(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Room(models.Model):
    ROOM_TYPES = [
        ('лекц', 'Лекц'),
        ('лаб', 'Лаб'),
        ('семинар', 'Семинар'),
    ]
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    room_number = models.JSONField(default=list)

    
    # class Meta:
    #     unique_together = ('room_type', 'room_number')


    def __str__(self):
        return f"{self.room_number} ({self.room_type})"


class ClassGroup(models.Model):
    hutulbur = models.CharField(max_length=100)
    group_name = models.CharField(max_length=20)
    damjaa = models.IntegerField()

    def __str__(self):
        return f"{self.hutulbur} {self.group_name}"


class Course(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    lesson_type = models.CharField(max_length=20)
    available_room_types = models.JSONField(default=list)
    group_list = models.ManyToManyField(ClassGroup,blank=True)

    def __str__(self):
        return f'{self.name}({self.lesson_type})' 


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
