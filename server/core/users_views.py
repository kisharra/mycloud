import shutil
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from .models import User
from .perms import require_auth, require_admin
from .serializers import users_list_with_stats, user_to_json
from .storage import absolute_path

@require_http_methods(["GET"])
@require_auth
@require_admin
def list_users(request):
    return JsonResponse({'users': users_list_with_stats()})

@require_http_methods(["DELETE"])
@require_auth
@require_admin
def delete_user(request, user_id: int):
    u = get_object_or_404(User, pk=user_id)
    rel = u.storage_rel_path or str(u.id)
    abs_dir = absolute_path(rel)
    u.delete()
    try:
        shutil.rmtree(abs_dir, ignore_errors=True)
    except Exception:
        pass
    return JsonResponse({'ok': True})

@require_http_methods(["POST"])
@require_auth
@require_admin
def toggle_admin(request, user_id: int):
    u = get_object_or_404(User, pk=user_id)
    u.is_staff = not u.is_staff
    u.save(update_fields=['is_staff'])
    return JsonResponse({'user': user_to_json(u)})