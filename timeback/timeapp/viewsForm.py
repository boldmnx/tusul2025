import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Teacher, Room, ClassGroup, Course
from timeback.settings import sendResponse

# ---------------- Teacher ----------------


def addTeacher(request, data):
    try:
        name = data.get("name")
        if not name:
            return sendResponse(4009)
        obj = Teacher.objects.create(name=name)
        return sendResponse(200, {"id": obj.id})
    except Exception as e:
        print("TEACHER ADD:", e)
        return sendResponse(5001)


def listTeacher(request, data):
    try:
        data_list = list(Teacher.objects.all().values("id", "name"))
        return sendResponse(200, data_list)
    except Exception as e:
        print("TEACHER LIST:", e)
        return sendResponse(5001)


def updateTeacher(request, data):
    try:
        tid = data.get("id")
        name = data.get("name")
        if not tid or not name:
            return sendResponse(4009)
        t = Teacher.objects.filter(id=tid).first()
        if not t:
            return sendResponse(4004)
        t.name = name
        t.save()
        return sendResponse(200)
    except Exception as e:
        print("TEACHER UPDATE:", e)
        return sendResponse(5001)


def deleteTeacher(request, data):
    try:
        tid = data.get("id")
        Teacher.objects.filter(id=tid).delete()
        return sendResponse(200)
    except:
        return sendResponse(5001)

# ---------------- Room ----------------


def listRoom(request, data):
    try:
        data_list = list(Room.objects.all().values(
            "id", "room_type", "room_number"))
        return sendResponse(200, data_list)
    except:
        return sendResponse(5001)


def addRoom(request, data):
    try:
        room_type = data.get("room_type")
        room_numbers = data.get("room_number")  # React-аас ирж байгаа массив

        if not room_type or not room_numbers:
            return sendResponse(4009)

        r = Room.objects.filter(room_type=room_type).first()

        if r:
            # Давхардуулж нэмэхээс сэргийлэх
            existing = r.room_number or []
            for n in room_numbers:
                if n not in existing:
                    existing.append(n)
            r.room_number = existing
            r.save()
        else:
            r = Room.objects.create(
                room_type=room_type, room_number=room_numbers)

        return sendResponse(200, {"id": r.id})

    except Exception as e:
        print("ROOM ADD:", e)
        return sendResponse(5001)


def updateRoom(request, data):
    try:
        rid = data.get("id")
        room_type = data.get("room_type")
        room_numbers = data.get("room_number")  # React-аас массив ирнэ
        if not rid or not room_type or not room_numbers:
            return sendResponse(4009)

        r = Room.objects.filter(id=rid).first()
        if not r:
            return sendResponse(4004)

        r.room_type = room_type

        # Давхардуулалгүй шинэ жагсаалт
        existing = r.room_number or []
        for n in room_numbers:
            if n not in existing:
                existing.append(n)
        r.room_number = existing
        r.save()

        return sendResponse(200)
    except Exception as e:
        print("ROOM UPDATE:", e)
        return sendResponse(5001)


def deleteRoom(request, data):
    try:
        rid = data.get("id")
        Room.objects.filter(id=rid).delete()
        return sendResponse(200)
    except:
        return sendResponse(5001)

# ---------------- ClassGroup ----------------


def addClassGroup(request, data):
    try:
        hutulbur = data.get("hutulbur")
        group_name = data.get("group_name")
        damjaa = data.get("damjaa")
        if not hutulbur or not group_name or damjaa is None:
            return sendResponse(4009)
        obj = ClassGroup.objects.create(
            hutulbur=hutulbur, group_name=group_name, damjaa=int(damjaa))
        return sendResponse(200, {"id": obj.id})
    except Exception as e:
        print("CLASSGROUP ADD:", e)
        return sendResponse(5001)


def listClassGroup(request, data):
    try:
        data_list = list(ClassGroup.objects.all().values(
            "id", "hutulbur", "group_name", "damjaa"))
        return sendResponse(200, data_list)
    except:
        return sendResponse(5001)


def updateClassGroup(request, data):
    try:
        gid = data.get("id")
        hutulbur = data.get("hutulbur")
        group_name = data.get("group_name")
        damjaa = data.get("damjaa")
        if not gid or not hutulbur or not group_name or damjaa is None:
            return sendResponse(4009)
        g = ClassGroup.objects.filter(id=gid).first()
        if not g:
            return sendResponse(4004)
        g.hutulbur = hutulbur
        g.group_name = group_name
        g.damjaa = int(damjaa)
        g.save()
        return sendResponse(200)
    except Exception as e:
        print("CLASSGROUP UPDATE:", e)
        return sendResponse(5001)


def deleteClassGroup(request, data):
    try:
        gid = data.get("id")
        ClassGroup.objects.filter(id=gid).delete()
        return sendResponse(200)
    except:
        return sendResponse(5001)

# ---------------- Course ----------------


def addCourse(request, data):
    try:
        name = data.get("name")
        teacher_id = data.get("teacher_id")
        lesson_type = data.get("lesson_type")
        room_types = data.get("available_room_types", [])
        groups = data.get("group_ids", [])
        if not name or not teacher_id or not lesson_type:
            return sendResponse(4009)
        course = Course.objects.create(
            name=name, teacher_id=teacher_id, lesson_type=lesson_type, available_room_types=room_types)
        if groups:
            course.group_list.set(groups)
        return sendResponse(200, {"id": course.id})
    except Exception as e:
        print("COURSE ADD:", e)
        return sendResponse(5001)


def listCourse(request, data):
    try:
        data_list = []
        for c in Course.objects.all():
            data_list.append({
                "id": c.id,
                "name": c.name,
                "lesson_type": c.lesson_type,
                "teacher": c.teacher.name,
                "available_room_types": c.available_room_types,
                "groups": list(c.group_list.values("id", "group_name"))
            })
        return sendResponse(200, data_list)
    except:
        return sendResponse(5001)


def updateCourse(request, data):
    try:
        cid = data.get("id")
        name = data.get("name")
        teacher_id = data.get("teacher_id")
        lesson_type = data.get("lesson_type")
        room_types = data.get("available_room_types", [])
        groups = data.get("group_ids", [])
        if not cid or not name or not teacher_id or not lesson_type:
            return sendResponse(4009)
        c = Course.objects.filter(id=cid).first()
        if not c:
            return sendResponse(4004)
        c.name = name
        c.teacher_id = teacher_id
        c.lesson_type = lesson_type
        c.available_room_types = room_types
        c.save()
        if groups:
            c.group_list.set(groups)
        return sendResponse(200)
    except Exception as e:
        print("COURSE UPDATE:", e)
        return sendResponse(5001)


def deleteCourse(request, data):
    try:
        cid = data.get("id")
        Course.objects.filter(id=cid).delete()
        return sendResponse(200)
    except:
        return sendResponse(5001)

# ---------------- checkService ----------------


@csrf_exempt
def checkService(request):
    if request.method != "POST":
        return JsonResponse(sendResponse(4001))
    try:
        data = json.loads(request.body)
    except:
        return JsonResponse(sendResponse(4001))
    if "action" not in data:
        return JsonResponse(sendResponse(4002))

    action = data["action"]
    actions = {
        "addRoom": addRoom,
        "listRoom": listRoom,
        "updateRoom": updateRoom,
        "deleteRoom": deleteRoom,

        "addTeacher": addTeacher,
        "listTeacher": listTeacher,
        "updateTeacher": updateTeacher,
        "deleteTeacher": deleteTeacher,

        "addClassGroup": addClassGroup,
        "listClassGroup": listClassGroup,
        "updateClassGroup": updateClassGroup,
        "deleteClassGroup": deleteClassGroup,

        "addCourse": addCourse,
        "listCourse": listCourse,
        "updateCourse": updateCourse,
        "deleteCourse": deleteCourse,
    }

    if action in actions:
        result = actions[action](request, data)
        return JsonResponse(result)
    return JsonResponse(sendResponse(4003))
