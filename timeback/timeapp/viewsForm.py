import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Teacher, Room, ClassGroup, Course
from timeback.settings import sendResponse
from django.contrib.auth.decorators import login_required

# ---------------- Teacher ----------------


def addTeacher(request, data):
    try:
        name = data.get("name")
        if not name:
            return sendResponse(4009)

        days_off = data.get("days_off", [])
        if isinstance(days_off, str):
            try:
                days_off = json.loads(days_off)
            except:
                days_off = []

        t = Teacher.objects.create(
            name=name,
            ovog=data.get("ovog", ""),
            age=data.get("age") or None,
            email=data.get("email", ""),
            phone=data.get("phone", ""),
            days_off=days_off,
            user=request.user,
        )

        # Photo
        if "photo" in request.FILES:
            t.photo = request.FILES["photo"]
            t.save()

        return sendResponse(200, {"id": t.id})
    except Exception as e:
        print("TEACHER ADD ERROR:", e)
        return sendResponse(5001)

# List


def listTeacher(request, data):
    try:
        teachers = Teacher.objects.filter(user=request.user).values(
            "id", "name", "ovog", "age", "email", "phone", "photo", "days_off",
        )
        data = []
        for t in teachers:
            if t["photo"]:
                t["photo_url"] = request.build_absolute_uri(
                    '/media/' + str(t["photo"]))
            else:
                t["photo_url"] = None

            data.append(t)

        return JsonResponse(sendResponse(200, data))
    except Exception as e:
        print("TEACHER LIST ERROR:", e)
        return JsonResponse(sendResponse(5001))


# def updateTeacher(request, data):
#     try:
#         tid = request.POST.get("id")
#         if not tid:
#             return JsonResponse(sendResponse(4009))

#         t = Teacher.objects.filter(id=tid, user=request.user).first()
#         if not t:
#             return JsonResponse(sendResponse(4004))

#         t.name = data.get("name", t.name) or t.name
#         t.ovog = data.get("ovog", t.ovog) or ""
#         t.email = data.get("email", t.email) or ""
#         t.phone = data.get("phone", t.phone) or ""
#         age = data.get("age")
#         if age is None or age in ("", "null"):
#             t.age = t.age  # хуучин утгаа хадгална
#         else:
#             t.age = int(age)

#         # 📸 Photo update
#         if "photo" in request.FILES:
#             t.photo = request.FILES["photo"]

#         t.save()
#         return JsonResponse(sendResponse(200))
#     except Exception as e:
#         print("TEACHER UPDATE ERROR:", e)
#         return JsonResponse(sendResponse(5001))


def updateTeacher(request, data):
    try:
        tid = request.POST.get("id")
        if not tid:
            return JsonResponse(sendResponse(4009))

        t = Teacher.objects.filter(id=tid, user=request.user).first()
        if not t:
            return JsonResponse(sendResponse(4004))
        
        days_off = data.get("days_off")
        if days_off is not None:
            if isinstance(days_off, str):
                try:
                    days_off = json.loads(days_off)
                except:
                    days_off = []
            t.days_off = days_off


        t.name = data.get("name", t.name) or t.name
        t.ovog = data.get("ovog", t.ovog) or ""
        t.email = data.get("email", t.email) or ""
        t.phone = data.get("phone", t.phone) or ""
        
        age = data.get("age")
        if age is None or age in ("", "null"):
            t.age = t.age  # хуучин утгаа хадгална
        else:
            t.age = int(age)

        # 📸 Photo update
        if "photo" in request.FILES:
            t.photo = request.FILES["photo"]

        t.save()
        return JsonResponse(sendResponse(200))
    except Exception as e:
        print("TEACHER UPDATE ERROR:", e)
        return JsonResponse(sendResponse(5001))

# Delete


def deleteTeacher(request, data):
    try:
        tid = request.POST.get("id")
        Teacher.objects.filter(id=tid, user=request.user).delete()
        return JsonResponse(sendResponse(200))
    except Exception as e:
        print("TEACHER DELETE ERROR:", e)
        return JsonResponse(sendResponse(5001))
# ---------------- Room ----------------


def listRoom(request, data):
    try:
        data_list = list(Room.objects.filter(user=request.user).values(
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

        r = Room.objects.filter(user=request.user, room_type=room_type).first()

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
                room_type=room_type, room_number=room_numbers, user=request.user)

        return sendResponse(200, {"id": r.id})

    except Exception as e:
        print("ROOM ADD:", e)
        return sendResponse(5001)


def updateRoom(request, data):
    try:
        rid = data.get("id")
        room_type = data.get("room_type")
        # React-аас ирж байгаа массив [{id: "101"}, ...]
        room_numbers = data.get("room_number")

        if not rid or not room_type or not room_numbers:
            return sendResponse(4009)

        # зөвхөн өөрийн Room-г засах
        r = Room.objects.filter(id=rid, user=request.user).first()
        if not r:
            return sendResponse(4004)

        r.room_type = room_type

        # Шинэ array-г шууд set хийх
        r.room_number = room_numbers
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
            hutulbur=hutulbur, group_name=group_name, damjaa=int(damjaa), user=request.user)
        return sendResponse(200, {"id": obj.id})
    except Exception as e:
        print("CLASSGROUP ADD:", e)
        return sendResponse(5001)


def listClassGroup(request, data):
    try:
        data_list = list(ClassGroup.objects.filter(user=request.user).values(
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
            name=name, teacher_id=teacher_id, lesson_type=lesson_type, available_room_types=room_types, user=request.user)
        if groups:
            course.group_list.set(groups)
        return sendResponse(200, {"id": course.id})
    except Exception as e:
        print("COURSE ADD:", e)
        return sendResponse(5001)


def listCourse(request, data):
    try:
        data_list = []
        for c in Course.objects.filter(user=request.user):
            data_list.append({
                "id": c.id,
                "name": c.name,
                "lesson_type": c.lesson_type,
                "teacher": {
                    "id": c.teacher.id,
                    "name": c.teacher.name
                },
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
@login_required
def checkService(request):

    if request.method == "OPTIONS":
        return JsonResponse({"ok": True})

    if request.method != "POST":
        return JsonResponse(sendResponse(4003))

    try:
        if request.content_type == "application/json":
            data = json.loads(request.body)
        else:
            data = request.POST.dict()
    except:
        data = {}

    action = data.get("action")

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
        # JSON response-ийг шалгаж, хэрвээ sendResponse буцаасан бол
        if isinstance(result, dict):
            return JsonResponse(result)
        return result
    return JsonResponse(sendResponse(4003))
