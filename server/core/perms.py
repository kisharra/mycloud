from django.http import JsonResponse
from functools import wraps


def require_auth(view):
    @wraps(view)
    def inner(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Требуется аутентификация'}, status=401)
        return view(request, *args, **kwargs)
    return inner

def require_admin(view):
    @wraps(view)
    def inner(request, *args, **kwargs):
        if not request.user.is_staff:
            return JsonResponse({'detail': 'Недостаточно прав'}, status=403)
        return view(request, *args, **kwargs)
    return inner