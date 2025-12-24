import itertools

times = [
    "08:00-09:30",
    "09:40-11:10",
    "11:20-12:50",
]

days = ["Mon", "Tue"]

rooms = [
    # {"roomType": "лекц", "rooms": [{"id": "102"}, {"id": "205"}]},
    {"roomType": "лекц", "rooms": [{"id": "102"}]},
    # {"roomType": "лаб", "rooms": [{"id": "302"}, {"id": "304"}]},
    {"roomType": "лаб", "rooms": [{"id": "302"}]},
    # {"roomType": "семинар", "rooms": [{"id": "301"}, {"id": "305"}]}
    {"roomType": "семинар", "rooms": [{"id": "301"}]}
]

teachers = [
    {"id": 1, "name": "Бадмаа"},
    {"id": 2, "name": "Сүхбат"}
]

classes = [
    {"id": 1, "hutulbur": "Программын инженер", "group": "1-1",  "damjaa": 1},
    {"id": 2, "hutulbur": "Программын инженер", "group": "1-2",  "damjaa": 1},
    {"id": 3, "hutulbur": "Мэдээллийн систем", "group": "1",  "damjaa": 1},
    {"id": 4, "hutulbur": "Программын инженер", "group": "2-1",  "damjaa": 2},
    {"id": 5, "hutulbur": "Программын инженер", "group": "2-2",  "damjaa": 2},
    {"id": 6, "hutulbur": "Мэдээллийн систем", "group": "1",  "damjaa": 2},
]

courses = [
    {"name": "Вебийн үндэс", "teacher_id": 1, "sessions": "лекц",
     "availableRoomType": ["лекц", "семинар"], "group_list": [1, 2, 3]},
    # 1
    {"name": "Вебийн үндэс", "teacher_id": 1, "sessions": "лаб",
     "availableRoomType": ["лаб"], "group_list": [1]},
    # 2
    {"name": "Вебийн үндэс", "teacher_id": 1, "sessions": "лаб",
     "availableRoomType": ["лаб"], "group_list": [2]},
    # 3
    {"name": "Вебийн үндэс", "teacher_id": 1, "sessions": "лаб",
     "availableRoomType": ["лаб"], "group_list": [3]},
    # 4
    # {"name": "QQQQQQQQQQQQQQQ", "teacher_id": 2, "sessions": "семинар",
    #  "availableRoomType": ["семинар"], "group_list": [1, 2]},
    # # 5
    # {"name": "QQQQQQQQQQQQQQQ", "teacher_id": 2, "sessions": "лекц",
    #  "availableRoomType": ["лекц"], "group_list": [1]},
    # # 6
    # {"name": "AAAAAAAAAAAAAAA", "teacher_id": 2, "sessions": "лаб",
    #  "availableRoomType": ["лаб"], "group_list": [3]},
    # 7
    # {"name": "HHHHHHHHHHHHHH", "teacher_id": 2, "sessions": "лаб",
    #  "availableRoomType": ["лаб"], "group_list": [2]},
    # 8
]


# Өрөөний төрлөөр mapping
room_map = {r["roomType"]: r["rooms"] for r in rooms}
# room_map:{'лекц': [{'id': '102'}], 'лаб': [{'id': '302'}], 'семинар': [{'id': '301'}]}

# Боломжит бүх slot (өдөр + цаг)
all_slots = [(d, t) for d in days for t in times]
# all_slots:[('Mon', '08:00-09:30'), ('Mon', '09:40-11:10'), ('Mon', '11:20-12:50'),
print(f'#######course{type(room_map)}')


def is_conflict(schedule, new):
    """Шинэ хичээлийг өмнөхүүдтэй харьцуулж зөрчил шалгах"""
    nd, nt, nr, course = new
    teacher = course["teacher_id"]
    groups = set(course["group_list"])

    for (d, t, r, c) in schedule:
        # ижил цаг өдөр дээр шалгах
        if d == nd and t == nt:
            # багш давхцах эсэх
            if c["teacher_id"] == teacher:
                return True
            # өрөө давхцах эсэх
            if r["id"] == nr["id"]:
                return True
            # анги давхцах эсэх
            if groups & set(c["group_list"]):
                return True
    return False


def generate_schedules(courses):
    # course бүрд боломжит хувилбар үүсгэх
    options_per_course = []
    for c in courses:
        opts = []
        for room_type in c["availableRoomType"]:
            for room in room_map[room_type]:
                for day, time in all_slots:
                    opts.append((day, time, room, c))
        options_per_course.append(opts)
    # Cartesian product - course бүрийн сонголтуудыг хослуулах
    all_combinations = itertools.product(*options_per_course)

    valid_schedules = []
    for comb in all_combinations:
        schedule = []
        valid = True
        for entry in comb:
            if is_conflict(schedule, entry):
                valid = False
                break
            schedule.append(entry)
        if valid:
            valid_schedules.append(schedule)

    return valid_schedules


schedules = generate_schedules(courses)

print(f"Нийт боломжит хувилбар: {len(schedules)}\n")

for i, sch in enumerate(schedules[:3], 1):  # эхний 10-г хэвлэе
    print(f"--- Хуваарь {i} ---")
    for d, t, r, c in sch:
        print(
            f"{d} {t} | {c['name']} ({c['sessions']}) | өрөө {r['id']} | багш {c['teacher_id']} | анги {c['group_list']}")
    print()
