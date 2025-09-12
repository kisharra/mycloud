from dataclasses import dataclass
from typing import Any, Dict
from django.contrib.auth import authenticate, login
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.db.models import Count, Sum
from django.http import JsonResponse
from .models import User, StoredFile
from .validators import validate_login, validate_email_fmt, validate_password_strength

@dataclass
class JsonOk:
    data: Dict[str, Any]
    status: int = 200
    def to_response(self) -> JsonResponse:
        return JsonResponse(self.data, status=self.status)
    
def user_to_json(u: User, with_admin=False):
    d = {
        'id': u.id,
        'username': u.username,
        'full_name': u.full_name,
        'email': u.email,
        'is_admin': bool(u.is_staff),
    }
    if with_admin:
        d['storage_rel_path'] = u.storage_rel_path
    return d


def file_to_json(f: StoredFile):
    return {
        'id': f.id,
        'owner_id': f.owner_id,
        'original_name': f.original_name,
        'size': f.size,
        'mime_type': f.mime_type,
        'comment': f.comment,
        'uploaded_at': f.uploaded_at.isoformat(),
        'last_downloaded_at': f.last_downloaded_at.isoformat() if f.last_downloaded_at else None,
        'public': bool(f.public_token),
    }


def validate_registration(payload: Dict[str, Any]):
    username = (payload.get('username') or '').strip()
    full_name = (payload.get('full_name') or '').strip()
    email = (payload.get('email') or '').strip()
    password = payload.get('password') or ''
    validate_login(username)
    validate_email_fmt(email)
    validate_password_strength(password)
    if not full_name:
        raise ValidationError('Укажите полное имя')
    if User.objects.filter(username=username).exists():
        raise ValidationError('Логин уже используется')
    if User.objects.filter(email=email).exists():
        raise ValidationError('Email уже используется')
    return username, full_name, email, password


def do_register(request):
    import json
    try:
        payload = json.loads(request.body.decode('utf-8'))
        username, full_name, email, password = validate_registration(payload)
        user = User.objects.create(
            username=username,
            full_name=full_name,
            email=email,
            password=make_password(password),
        )
        login(request, user)
        return JsonOk({'user': user_to_json(user)}).to_response()
    except ValidationError as e:
        return JsonResponse({'detail': str(e)}, status=400)
    except Exception:
        return JsonResponse({'detail': 'Ошибка регистрации'}, status=400)


def do_login(request):
    import json
    data = json.loads(request.body.decode('utf-8'))
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    user = authenticate(request, username=username, password=password)
    if not user:
        return JsonResponse({'detail': 'Неверные логин или пароль'}, status=400)
    login(request, user)
    return JsonOk({'user': user_to_json(user)}).to_response()


def users_list_with_stats():
    qs = User.objects.all()
    stats = (StoredFile.objects
             .values('owner_id')
             .annotate(count=Count('id'), total=Sum('size')))
    stat_map = {s['owner_id']: s for s in stats}
    res = []
    for u in qs:
        s = stat_map.get(u.id, {'count': 0, 'total': 0})
        d = user_to_json(u, with_admin=True)
        d['files_count'] = s['count'] or 0
        d['files_total'] = int(s['total'] or 0)
        res.append(d)
    return res