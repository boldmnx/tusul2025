from django.http import JsonResponse
from ortools.sat.python import cp_model
from collections import defaultdict
import itertools

from .models import Course, Room

DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
TIMES = ['09:40-11:10', '11:20-12:50', '13:30-15:00', '15:10-16:40']

def schedule_view(request):
    data = Course.objects.select_related("teacher").prefetch_related("group_list").all()

    courses = []
    grouped = defaultdict(lambda: {'type': None, 'groups': []})

    # Лекц нэгтгэх
    for item in data:
        group_names = list(item.group_list.values_list("hutulbur","group_name"))
        if item.lesson_type == "лекц":
            key = (item.name, item.teacher.name)
            grouped[key]['type'] = item.available_room_types
            grouped[key]['groups'].append(group_names)
        else:
            courses.append({
                "name": item.name,
                "teacher": item.teacher.name,
                "lesson_type": item.lesson_type,
                "available_room_types": item.available_room_types,
                "group_list": group_names,
            })

    # Consolidated lectures
    for (name, teacher), info in grouped.items():
        all_groups = [g for gl in info['groups'] for g in gl]
        courses.insert(0, {
            "name": name,
            "teacher": teacher,
            "lesson_type": "лекц",
            "available_room_types": info["type"],
            "group_list": all_groups
        })

    # Rooms
    db_rooms = list(Room.objects.all().values("room_type", "room_number","id"))
    rooms = defaultdict(list)
    for r in db_rooms:
        for rid in r["room_number"]:
            real_id = int(rid['id']) if isinstance(rid, dict) else int(rid)
            rooms[r["room_type"]].append(real_id)

    schedules = generate_schedules_ortools(courses, rooms, num_schedules=3)
    return JsonResponse(schedules, safe=False)


def generate_schedules_ortools(courses, rooms, num_schedules=3, time_limit=10):
    model = cp_model.CpModel()
    slot_list = [(d, t) for d in DAYS for t in TIMES]
    n_slots = len(slot_list)
    n = len(courses)

    x_slot = {}
    x_room = {}

    for i, course in enumerate(courses):
        x_slot[i] = model.NewIntVar(0, n_slots-1, f"slot_{i}")
        possible_rooms = []
        for rtype in course.get("available_room_types", []) or []:
            possible_rooms.extend(rooms.get(rtype, []))
        possible_rooms = list(map(int, possible_rooms))
        if not possible_rooms:
            raise ValueError(f"No valid rooms for course {course['name']}")
        x_room[i] = model.NewIntVarFromDomain(cp_model.Domain.FromValues(possible_rooms), f"room_{i}")

    # Teacher conflict
    for i,j in itertools.combinations(range(n),2):
        if courses[i]["teacher"] == courses[j]["teacher"]:
            model.Add(x_slot[i] != x_slot[j])

    # Group conflict
    for i,j in itertools.combinations(range(n),2):
        groups_i = set(courses[i].get("group_list") or [])
        groups_j = set(courses[j].get("group_list") or [])
        if groups_i & groups_j:
            model.Add(x_slot[i] != x_slot[j])

    # Room conflict
    for i,j in itertools.combinations(range(n),2):
        same = model.NewBoolVar(f"same_slot_{i}_{j}")
        model.Add(x_slot[i] == x_slot[j]).OnlyEnforceIf(same)
        model.Add(x_slot[i] != x_slot[j]).OnlyEnforceIf(same.Not())
        model.Add(x_room[i] != x_room[j]).OnlyEnforceIf(same)

    # Lecture -> Lab constraint
    for i, lec in enumerate(courses):
        if lec['lesson_type'] != "лекц":
            continue
        for j, lab in enumerate(courses):
            if lab['lesson_type'] in ["лаб","семинар"] and set(lec['group_list']) & set(lab['group_list']):
                # lab нь лекцийн slot-оос хойш орно
                model.Add(x_slot[j] > x_slot[i])

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = time_limit
    solver.parameters.num_search_workers = 8

    schedules = []
    res = solver.Solve(model)
    if res not in (cp_model.FEASIBLE, cp_model.OPTIMAL):
        return []

    sch = []
    for i in range(n):
        s_val = solver.Value(x_slot[i])
        r_val = solver.Value(x_room[i])
        d,t = slot_list[s_val]
        sch.append({
            "day": d,
            "time": t,
            "room": r_val,
            "name": courses[i]["name"],
            "teacher": courses[i]["teacher"],
            "lesson_type": courses[i]["lesson_type"],
            "groups": courses[i].get("group_list",[]),
        })

    # Өдөр, цагийн дараалалд эрэмбэлэх
    sch.sort(key=lambda x: (DAYS.index(x["day"]), TIMES.index(x["time"])))
    schedules.append(sch)
    return schedules
