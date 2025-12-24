import json
import random
from collections import defaultdict
from django.http import JsonResponse
from django.shortcuts import render
from .models import *

DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
TIMES = [ '09:40-11:10',
         '11:20-12:50', '13:30-15:00', '15:10-16:40']


def schedule_view(request):
    # Course, Teacher, ClassGroup-ийг хамтад нь татах
    data = Course.objects.select_related(
        "teacher").prefetch_related("group_list").all()

    course_list = []
    grouped = defaultdict(
        lambda: {'available_room_types': None, 'group_list': []})

    # Лекцүүдийг нэгтгэх
    for item in data:
        # group_list-ийн names авах
        group_names = list(item.group_list.values_list(
            "hutulbur", "group_name"))

        if item.lesson_type == 'лекц':
            key = (item.name, item.teacher.name, item.lesson_type)
            grouped[key]['available_room_types'] = item.available_room_types
            grouped[key]['group_list'].append(group_names)
        else:
            course_list.append({
                'name': item.name,
                'teacher': item.teacher.name,
                'lesson_type': item.lesson_type,
                'available_room_types': item.available_room_types,
                'group_list': group_names
            })

    # Лекцүүдийг course_list-д нэмэх
    for (name, teacher, lesson_type), values in grouped.items():
        all_groups = []
        for gl in values['group_list']:
            all_groups.extend(gl)  # tuple list -> tuple list
        course_list.insert(0, {
            'name': name,
            'teacher': teacher,
            'lesson_type': lesson_type,
            'available_room_types': values['available_room_types'],
            'group_list': all_groups
        })

    # Schedule үүсгэх
    schedules = generate_schedules(course_list, num_schedules=10)
    formatted_schedules = []

    for i, sch in enumerate(schedules[:1], 1):
        entries = []
        for day, time, room, course in sch:
            entries.append({
                "day": day,
                "time": time,
                "course_name": course["name"],
                "lesson_type": course["lesson_type"],
                "room": room["id"]['id'],
                "teacher": course["teacher"],
                "groups": [f"{hut} ({grp})" for hut, grp in course["group_list"]]
            })
        formatted_schedules.append({
            "schedule_number": i,
            "entries": entries
        })

    # Хэвлэх хэсэг
    for i, sch in enumerate(schedules[:3], 1):
        print(f"--- Хуваарь {i} ---")
        for d, t, r, c in sch:
            group_list_str = [f"{hut} ({grp})" for hut, grp in c['group_list']]
            print(
                f"{d} {t} | {c['name']} ({c['lesson_type']}) | өрөө {r['id']['id']} | багш {c['teacher']} | анги {group_list_str}")
        print()

    return JsonResponse(formatted_schedules, safe=False)


def is_conflict(schedule, new):
    nd, nt, nr, course = new
    teacher = course["teacher"]
    groups = set(course["group_list"])

    for (d, t, r, c) in schedule:
        if d == nd and t == nt:
            if c["teacher"] == teacher:
                return True
            if r["id"] == nr["id"]:
                return True
            if groups & set(c["group_list"]):
                return True
    return False


def generate_schedules(courses, num_schedules=10):
    # Өрөөг room_type-д харгалзуулаад авах
    rooms = list(Room.objects.all().values("room_type", "room_number", "id"))
    room_map = defaultdict(list)
    for r in rooms:
        # room_number нь list учраас тус бүрийн id-г dictionary-д хийх
        for rid in r["room_number"]:
            room_map[r["room_type"]].append({"id": rid})

    all_slots = [(d, t) for d in DAYS for t in TIMES]

    schedules = []
    tries = 0
    max_tries = num_schedules * 3000

    while len(schedules) < num_schedules and tries < max_tries:
        tries += 1
        schedule = []

        random_courses = courses[:]
        random.shuffle(random_courses)

        for course in random_courses:
            placed = False
            for day, time in all_slots:
                for room_type in course['available_room_types']:
                    for room in room_map.get(room_type, []):
                        entry = (day, time, room, course)
                        if not is_conflict(schedule, entry):
                            schedule.append(entry)
                            placed = True
                            break
                    if placed:
                        break
                if placed:
                    break

        if len(schedule) == len(courses) and schedule not in schedules:
            schedule.sort(key=lambda x: (DAYS.index(x[0]), TIMES.index(x[1])))
            schedules.append(schedule)

    return schedules
