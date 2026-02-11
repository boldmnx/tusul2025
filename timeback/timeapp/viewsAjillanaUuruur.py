
import random
from collections import defaultdict
from django.http import HttpResponse, JsonResponse
from .models import *
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os
from django.conf import settings
from reportlab.lib.styles import getSampleStyleSheet

from reportlab.lib.units import cm

DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri',]
# TIMES = ['08:00-09:30', '09:40-11:10', '11:20-12:50',
#          '13:20-14:50', '15:00-16:30', '16:40-18:10']

TIMES = ['09:40-11:10', '11:20-12:50',
         '13:20-14:50', '15:00-16:30',]


teacher_days_off = {
    "П.Зоригтбаатар": ["Mon"],
    "Б.Алтантүлхүүр": ["Tue"],
    "Н.Ринчмаа": ["Wed"],
    "Х.Сувд-Эрдэнэ": ["Thu"],
    "Б.Цэнд-Аюуш": ["Fri"],
}
def is_conflict(schedule, new):
    nd, nt, nr, course = new
    teacher = course["teacher"]
    groups = set(course["group_list"])
    lesson_type = course["lesson_type"]

    for (d, t, r, c) in schedule:
        if d == nd and t == nt:

            # ❗ Багш давхцах бол ямар ч үед болохгүй
            if c["teacher"] == teacher:
                return True

            # ❗ Өрөө давхцах бол ямар ч үед болохгүй
            if r["id"] == nr["id"]:
                return True

            # 🔴 Group давхцлыг ЗӨВХӨН лекц БИШ үед шалгана
            if lesson_type != "лекц":
                if groups & set(c["group_list"]):
                    return True

    return False


def generate_schedules(courses, num_schedules=1):
    # ---------- ROOM MAP ----------
    rooms = list(Room.objects.all().values("room_type", "room_number"))
    room_map = defaultdict(list)
    for r in rooms:
        for rid in r["room_number"]:
            room_map[r["room_type"]].append({"id": rid})

    # ---------- ALL SLOTS ----------
    all_slots = [(d, t) for d in DAYS for t in TIMES]

    # ---------- BUILD BLOCKS ----------
    blocks = build_course_blocks(courses)

    schedules = []
    used_lecture_days = set()
    teacher_lecture_days = defaultdict(set)

    # Lecture-үүдэд зориулсан slot generator
    def lecture_slot_generator():
        fresh_days = [d for d in DAYS if d not in used_lecture_days]
        used_days = [d for d in DAYS if d in used_lecture_days]
        ordered_days = fresh_days + used_days
        for d in ordered_days:
            for t in TIMES:
                yield d, t

    # 🔹 Block priority: Lecture-тэй block-ууд түрүүлнэ
    blocks.sort(key=block_priority)

    # 🔹 priority ижил block-уудыг random
    i = 0
    while i < len(blocks):
        j = i
        while j < len(blocks) and block_priority(blocks[j]) == block_priority(blocks[i]):
            j += 1
        random.shuffle(blocks[i:j])
        i = j

    for _ in range(num_schedules):
        schedule = []

        for block in blocks:
            # Lecture-тэй block
            lecture_course = next(
                (c for c in block if c["lesson_type"] == "лекц"), None)

            if lecture_course:
                placed = False
                for day, time in lecture_slot_generator():
                    # Багшийн амралтын өдөр шалгах
                    if lecture_course["teacher"] in teacher_days_off and day in teacher_days_off[lecture_course["teacher"]]:
                        continue
                    # Нэг багшид нэг өдөр лекц
                    if day in teacher_lecture_days[lecture_course["teacher"]]:
                        continue

                    for room in room_map["лекц"]:
                        entry = (day, time, room, lecture_course)
                        if is_conflict(schedule, entry):
                            continue

                        # ✅ Lecture орлоо
                        used_lecture_days.add(day)
                        teacher_lecture_days[lecture_course["teacher"]].add(
                            day)
                        temp_entries = [entry]
                        lecture_slot_index = all_slots.index((day, time))
                        next_slot = lecture_slot_index + 1

                        # Lecture-д хамааралтай Sem/Lab дараалалтай оруулах
                        for c in block:
                            if c == lecture_course:
                                continue
                            placed_child = False
                            while next_slot < len(all_slots):
                                d, t = all_slots[next_slot]
                                if c["teacher"] in teacher_days_off and d in teacher_days_off[c["teacher"]]:
                                    next_slot += 1
                                    continue
                                for r in room_map[c["lesson_type"]]:
                                    e = (d, t, r, c)
                                    if not is_conflict(schedule + temp_entries, e):
                                        temp_entries.append(e)
                                        placed_child = True
                                        next_slot += 1
                                        break
                                if placed_child:
                                    break
                                next_slot += 1
                            if not placed_child:
                                placed = False
                                break

                        if len(temp_entries) == len(block):
                            schedule.extend(temp_entries)
                            placed = True
                            break
                    if placed:
                        break
                if not placed:
                    suggestion = find_available_slot(
                        schedule, lecture_course, all_slots, room_map, teacher_days_off)
                    if suggestion:
                        day, time, room, _ = suggestion
                        print(
                            f"⚠️ '{lecture_course['name']}' Давхцал гарлаа эсвэл бүх slot дүүрсэн байна. хичээлийг санал болгож буй сул slot: {day} {time}, өрөө {room['id']}")

            # Lecture-гүй block → standalone Seminar/Lab/Practic
            else:
                # Хэрвээ block-д ямар нэг курс slots_per_week-тэй байвал
                if any(c.get("slots_per_week") for c in block):
                    for c in block:
                        occurrences = c.get("slots_per_week", 1)
                        used_days_for_c = set()
                        occ_count = 0
                        while occ_count < occurrences:
                            for day, time in all_slots:
                                if day in used_days_for_c:
                                    continue
                                if c["teacher"] in teacher_days_off and day in teacher_days_off[c["teacher"]]:
                                    continue
                                for r in room_map[c["lesson_type"]]:
                                    entry = (day, time, r, c)
                                    if not is_conflict(schedule, entry):
                                        schedule.append(entry)
                                        used_days_for_c.add(day)
                                        occ_count += 1
                                        break
                                if occ_count >= occurrences:
                                    break
                else:
                    # slots_per_week null → нэг өдөрт дараалалтай оруулах
                    placed = False
                    for day in DAYS:
                        temp_entries = []
                        next_slot_index = 0
                        while next_slot_index < len(TIMES) and len(temp_entries) < len(block):
                            time = TIMES[next_slot_index]
                            next_slot_index += 1
                            for c in block:
                                if c in [e[3] for e in temp_entries]:
                                    continue
                                if c["teacher"] in teacher_days_off and day in teacher_days_off[c["teacher"]]:
                                    continue
                                for r in room_map[c["lesson_type"]]:
                                    entry = (day, time, r, c)
                                    if not is_conflict(schedule + temp_entries, entry):
                                        temp_entries.append(entry)
                                        break
                            if len(temp_entries) == len(block):
                                schedule.extend(temp_entries)
                                placed = True
                                break
                        if placed:
                            break

                    if not placed:
                        print(
                            f"⚠️ Хичээлийг '{lecture_course['name']}' байрлуулах боломжгүй. Давхцал гарлаа эсвэл бүх slot дүүрсэн байна. Шинэ цаг нэмэх үү")
        schedule.sort(key=lambda x: (DAYS.index(x[0]), TIMES.index(x[1])))
        schedules.append(schedule)

    return schedules


def build_course_blocks(courses):
    blocks = []
    used_ids = set()

    lecture_map = defaultdict(list)
    for c in courses:
        if c.get("parent_lecture"):
            lecture_map[c["parent_lecture"]].append(c)

    for lec in courses:
        if lec["lesson_type"] == "лекц":
            block = [lec]

            children = lecture_map.get(lec["id"], [])
            sems = [c for c in children if c["lesson_type"] == "семинар"]
            labs = [c for c in children if c["lesson_type"] == "лаб"]

            block.extend(sems)
            block.extend(labs)

            blocks.append(block)
            used_ids.update(c["id"] for c in block)

    # Lecture-гүй block (нэр ижил)
    name_map = defaultdict(list)
    for c in courses:
        if c["id"] not in used_ids:
            name_map[c["name"]].append(c)

    for items in name_map.values():
        items.sort(key=lambda x: {"лекц": 0, "семинар": 1, "лаб": 2, "практик": 3}[
                   x["lesson_type"]])
        blocks.append(items)

    return blocks


def block_priority(block):
    """
    Lecture-тэй block → 0
    Lecture-гүй block → 1
    """
    for c in block:
        if c["lesson_type"] == "лекц":
            return 0
    return 1


def find_available_slot(schedule, course, all_slots, room_map, teacher_days_off):
    """
    Давхцалгүйгээр орох боломжтой slot хайна.
    Хэрвээ олдвол (day, time, room) буцаана, олдохгүй бол None.
    """
    for day, time in all_slots:
        if course["teacher"] in teacher_days_off and day in teacher_days_off[course["teacher"]]:
            continue
        for r in room_map[course["lesson_type"]]:
            entry = (day, time, r, course)
            if not is_conflict(schedule, entry):
                return entry
    return None


def get_formatted_schedules(user):
    from collections import defaultdict

    data = Course.objects.filter(user=user).select_related(
        "teacher").prefetch_related("group_list")

    course_list = []
    grouped = defaultdict(
        lambda: {'available_room_types': None, 'group_list': []})

    for item in data:
        group_names = list(item.group_list.values_list(
            "hutulbur", "group_name"))
        if item.lesson_type == 'лекц':
            key = (item.name, item.teacher.name, item.lesson_type)
            grouped[key]['available_room_types'] = item.available_room_types
            grouped[key]['group_list'].append(group_names)
        else:
            course_list.append({
                'id': item.id,
                'name': item.name,
                'teacher': item.teacher.name,
                'lesson_type': item.lesson_type,
                'available_room_types': item.available_room_types,
                'group_list': group_names,
                'parent_lecture': item.parent_lecture_id,
                'slots_per_week': getattr(item, 'slots_per_week', 1)
            })

    for (name, teacher, lesson_type), values in grouped.items():
        all_groups = []
        for gl in values['group_list']:
            all_groups.extend(gl)
        lec_item = next((i for i in data if i.name == name and i.teacher.name ==
                        teacher and i.lesson_type == 'лекц'), None)
        if lec_item:
            course_list.insert(0, {
                'id': lec_item.id,
                'name': name,
                'parent_lecture': None,
                'teacher': teacher,
                'lesson_type': lesson_type,
                'available_room_types': values['available_room_types'],
                'group_list': all_groups,
                'slots_per_week': getattr(lec_item, 'slots_per_week', 1)
            })

    # 🔹 Schedule үүсгэх
    schedules = generate_schedules(course_list, num_schedules=10)

    # 🔹 Room map-г нэг удаа бэлдэх
    room_map = {lt: list(Room.objects.filter(room_type=lt).values("id", "room_number"))
                for lt in set(c['lesson_type'] for c in course_list)}

    # 🔹 Schedule 1-г авч, бүх ороогүй хичээлийг нэмэх
    schedule = schedules[0]
    scheduled_courses = set(c['name'] for _, _, _, c in schedule)
    unscheduled_courses = [
        c for c in course_list if c['name'] not in scheduled_courses]

    for course_to_add in unscheduled_courses:
        suggestion = find_available_slot(schedule, course_to_add,
                                         [(d, t) for d in DAYS for t in TIMES],
                                         room_map, teacher_days_off)
        if suggestion:
            day, time, room, course = suggestion
            schedule.append((day, time, room, course))
            print(
                f"✅ '{course['name']}' хичээл {day} {time} цагт өрөө {room['id']} -д амжилттай орлоо")
        else:
            print(
                f"❌ '{course_to_add['name']}' хичээлийг оруулах боломжгүй байна")

    # 🔹 Форматласан schedule-г бэлдэх
    formatted_schedules = []
    for i, sch in enumerate(schedules[:1], 1):
        entries = []

        for day, time, room, course in sch:
            room_id = str(room["id"]) if isinstance(
                room["id"], (int, str)) else room["id"].get("id", "")

            entries.append({
                "day": day,
                "time": time,
                "course_name": course["name"],
                "lesson_type": course["lesson_type"],
                "room":  room_id,
                "teacher": course["teacher"],
                "groups": [f"{hut} ({grp})" for hut, grp in course["group_list"]]
            })
        formatted_schedules.append({"schedule_number": i, "entries": entries})

    # 🔹 Console дээр хэвлэх
    print(f"--- Хуваарь 1 ---")
    for day, time, room, course in schedule:
        group_list_str = [f"{hut} ({grp})" for hut,
                          grp in course['group_list']]
        print(
            f"{day} {time} | {course['name']} ({course['lesson_type']}) | өрөө {room['id']} | багш {course['teacher']} | анги {group_list_str}")
    print(f"--- Нийт боломж {len(schedules)} ---")

    # 🔹 Давхцалгүй course-н мэдээлэл
    unique_course_names = set(c['name'] for c in course_list)
    print(f"📌 Хичээлийн тоо: {len(unique_course_names)}")
    scheduled_courses = set(c['name'] for _, _, _, c in schedule)
    print(f"✅ Хувааарт орсон хичээлийн тоо: {len(scheduled_courses)}")
    print(
        f"❌ Хуваарьт ороогүй хичээлийн тоо, нэр: {len(unique_course_names - scheduled_courses)} — {unique_course_names - scheduled_courses}")

    lecture_courses = set(c['name']
                          for c in course_list if c.get('lesson_type') == 'лекц')
    scheduled_lectures = set(c['name'] for _, _, _,
                             c in schedule if c.get('lesson_type') == 'лекц')
    print(f"📘 Нийт лекцийн тоо: {len(lecture_courses)}")
    print(f"✅ Хуваарьт орсон лекцийн тоо: {len(scheduled_lectures)}")

    return formatted_schedules


def teacher_schedule_pdf_view(request, teacher_name):
    data = request.session.get('current_schedule')

    # Монгол TTF font register
    font_path = os.path.join(
        settings.BASE_DIR, 'static/fonts/NotoSans-VariableFont_wdth,wght.ttf')
    pdfmetrics.registerFont(TTFont('Mongol', font_path))

    # PDF response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{teacher_name}_schedule.pdf"'

    # Стиль
    styles = getSampleStyleSheet()
    style_title = styles['Heading1']
    style_title.fontName = 'Mongol'
    style_title.fontSize = 16
    style_title.alignment = 1  # төвлөрүүлсэн

    styleN = styles['Normal']
    styleN.fontName = 'Mongol'
    styleN.fontSize = 10

    doc = SimpleDocTemplate(response, pagesize=landscape(A4))
    elements = []

    # Гарчигт багшийн нэр нэмэх
    title = Paragraph(
        f"{teacher_name} багшийн хуваарь (2024-2025 оны Намрын улирал)", style_title)
    elements.append(title)
    elements.append(Spacer(1, 0.5*cm))

    # Table header
    table_data = [
        [Paragraph("Өдөр", styleN),
         Paragraph("Цаг", styleN),
         Paragraph("Хичээл", styleN),
         Paragraph("Төрөл", styleN),
         Paragraph("Багш", styleN),
         Paragraph("Танхим", styleN),
         Paragraph("Бүлэг", styleN)]
    ]
    if not data or not data[0].get("entries"):
        return HttpResponse("Багшийн хуваарь олдсонгүй.", status=404)

    for entry in data[0]["entries"]:
        if entry["teacher"].strip() == teacher_name.strip():
            table_data.append([
                Paragraph(entry["day"], styleN),
                Paragraph(entry["time"], styleN),
                Paragraph(entry["course_name"], styleN),
                Paragraph(entry["lesson_type"], styleN),
                Paragraph(entry["teacher"], styleN),
                Paragraph(entry["room"], styleN),
                Paragraph(", ".join(entry["groups"]), styleN),
            ])

    col_widths = [50, 60, 200, 60, 120, 50, 200]

    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Mongol'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))

    elements.append(table)
    doc.build(elements)

    return response


def schedule_pdf_view(request):
    # Таны өгөгдөл
    data = request.session.get('current_schedule')

    # Монгол TTF font register
    font_path = os.path.join(
        settings.BASE_DIR, 'static/fonts/NotoSans-VariableFont_wdth,wght.ttf'
    )
    pdfmetrics.registerFont(TTFont('Mongol', font_path))

    # PDF response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="schedule.pdf"'

    # Стиль
    styles = getSampleStyleSheet()

    style_title = styles['Heading1']
    style_title.fontName = 'Mongol'
    style_title.fontSize = 16
    style_title.alignment = 1  # төвлөрүүлсэн

    styleN = styles['Normal']
    styleN.fontName = 'Mongol'
    styleN.fontSize = 10

    # Landscape A4
    doc = SimpleDocTemplate(response, pagesize=landscape(A4))
    elements = []

    # Гарчиг нэмэх
    title = Paragraph("2024-2025 оны Намрын улирал", style_title)
    elements.append(title)
    elements.append(Spacer(1, 0.5*cm))

    # Table header
    table_data = [
        [
            Paragraph("Өдөр", styleN),
            Paragraph("Цаг", styleN),
            Paragraph("Хичээл", styleN),
            Paragraph("Төрөл", styleN),
            Paragraph("Багш", styleN),
            Paragraph("Танхим", styleN),
            Paragraph("Бүлэг", styleN)
        ]
    ]

    # Table body
    for entry in data[0]["entries"]:
        table_data.append([
            Paragraph(entry["day"], styleN),
            Paragraph(entry["time"], styleN),
            Paragraph(entry["course_name"], styleN),
            Paragraph(entry["lesson_type"], styleN),
            Paragraph(entry["teacher"], styleN),
            Paragraph(entry["room"], styleN),
            Paragraph(", ".join(entry["groups"]), styleN),
        ])

    # Column урт тохируулах
    col_widths = [50, 60, 200, 60, 120, 50, 200]

    # Table үүсгэх
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Mongol'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))

    elements.append(table)
    doc.build(elements)

    return response


def schedule_view(request):

    formatted_schedules = get_formatted_schedules(request.user)
    request.session['current_schedule'] = formatted_schedules

    return JsonResponse(formatted_schedules, safe=False)


def teacher_schedule(request):
    formatted_schedules = request.session.get('current_schedule')

    return JsonResponse(formatted_schedules, safe=False)
