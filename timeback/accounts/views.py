import json
import uuid
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from accounts.forms import RegisterForm, AccountsForm
from accounts.models import Account
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
# CSRF-г frontend fetch-д зориулж хааж байна


@csrf_exempt
def user_login(request):
    if request.method == 'GET':
        return JsonResponse({"message": "Login endpoint. Use POST."})

    if request.method == 'OPTIONS':
        return JsonResponse({"ok": True, "message": "Preflight OK"})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            login_input = data.get('email')
            password = data.get('password')
        except:
            return JsonResponse({"success": False, "message": "Invalid data"}, status=400)

        user = None

        # Email-ээр login
        try:
            user_obj = User.objects.get(email=login_input)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

        # Phone-оор login
        if user is None:
            try:
                acc = Account.objects.get(phone_number=login_input)
                user = authenticate(
                    username=acc.user.username, password=password)
            except Account.DoesNotExist:
                user = None

        if user is not None:
            login(request, user)
            return JsonResponse({"success": True, "message": "Logged in", "user": {"email": user.email}})
        else:
            return JsonResponse({"success": False, "message": "Invalid email / phone or password"}, status=401)

    return JsonResponse({"success": False, "message": "Only POST allowed"}, status=405)


@login_required
def current_user(request):
    user = request.user
    # Овгийн эхний үсэг авах (хоосон тохиолдолд хамгаална)
    last_initial = user.last_name[0].upper() + "." if user.last_name else ""

    # Нэр + овгийн эхний үсэг
    display_name = f"{last_initial} {user.first_name}".strip()
    return JsonResponse({
        "user": {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "display_name": display_name,
        }
    })


@csrf_exempt
def user_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except:
            return JsonResponse({"success": False, "message": "Invalid data"}, status=400)

        user_form = RegisterForm(data)
        account_form = AccountsForm(data)

        if user_form.is_valid() and account_form.is_valid():
            user = user_form.save(commit=False)
            # user.username = uuid.uuid4().hex[:30]
            # email-г username болгож хадгалах
            user.username = user_form.cleaned_data['email']

            user.set_password(user_form.cleaned_data['password'])
            user.save()

            account = account_form.save(commit=False)
            account.user = user
            account.save()

            return JsonResponse({"success": True, "message": "Account created successfully"})
        else:
            errors = {}
            for field, errs in user_form.errors.items():
                errors[field] = errs
            for field, errs in account_form.errors.items():
                errors[field] = errs
            return JsonResponse({"success": False, "errors": errors}, status=400)

    return JsonResponse({"success": False, "message": "Only POST allowed"}, status=405)


@csrf_exempt
def user_logout(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"success": True, "message": "Logged out"})
    return JsonResponse({"success": False, "message": "Only POST allowed"}, status=405)
