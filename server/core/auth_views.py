from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib.auth import logout
from .serializers import do_register, do_login
from django.middleware.csrf import get_token
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

def csrf_token(request):
    """
    Возвращает CSRF-токен в JSON и ставит его в cookie
    """
    return JsonResponse({"csrfToken": get_token(request)})

@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})

@require_POST
def register(request):
    return do_register(request)

@require_POST
def login_view(request):
    return do_login(request)

@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({'ok': True})

@login_required
def me(request):
    u = request.user
    return JsonResponse({
        "id": u.id,
        "username": u.username,
        "full_name": u.get_full_name(),
        "email": u.email,
        "is_admin": u.is_staff,
    })