import mimetypes
from datetime import datetime
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .perms import require_auth
from .models import StoredFile, User
from .storage import save_file, absolute_path, delete_file_safe

@require_http_methods(["GET"])
@require_auth
def list_files(request):
    user = request.user
    user_id = request.GET.get('user_id')
    if user_id and user.is_staff:
        target = get_object_or_404(User, pk=int(user_id))
    else:
        target = user
    files = StoredFile.objects.filter(owner=target)
    return JsonResponse({'files': [
        {
            'id': f.id,
            'owner_id': f.owner_id,
            'original_name': f.original_name,
            'size': f.size,
            'mime_type': f.mime_type,
            'comment': f.comment,
            'uploaded_at': f.uploaded_at.isoformat(),
            'last_downloaded_at': f.last_downloaded_at.isoformat() if f.last_downloaded_at else None,
            'public': bool(f.public_token),
        } for f in files
    ]})

@require_http_methods(["POST"])
@require_auth
def upload_file(request):
    f = request.FILES.get('file')
    if not f:
        return JsonResponse({'detail': 'Прикрепите файл'}, status=400)
    comment = (request.POST.get('comment') or '').strip()
    stored_name = StoredFile.new_storage_name()
    rel_dir = save_file(request.user.id, stored_name, f)
    mime = f.content_type or mimetypes.guess_type(f.name)[0] or 'application/octet-stream'
    sf = StoredFile.objects.create(
        owner=request.user,
        original_name=f.name,
        stored_name=stored_name,
        mime_type=mime,
        size=f.size,
        comment=comment,
        rel_dir=rel_dir,
    )
    return JsonResponse({'file': {
        'id': sf.id,
        'original_name': sf.original_name,
        'size': sf.size,
        'mime_type': sf.mime_type,
        'comment': sf.comment,
        'uploaded_at': sf.uploaded_at.isoformat(),
        'public': False,
    }}, status=201)

@require_http_methods(["PATCH"])
@require_auth
def update_file(request, file_id: int):
    import json
    sf = get_object_or_404(StoredFile, pk=file_id)
    if not (request.user.is_staff or sf.owner_id == request.user.id):
        return JsonResponse({'detail': 'Недостаточно прав'}, status=403)
    data = json.loads(request.body.decode('utf-8'))
    changed = False
    new_name = data.get('original_name')
    if new_name:
        sf.original_name = new_name.strip()[:255]
        changed = True
    if 'comment' in data:
        sf.comment = (data.get('comment') or '').strip()[:500]
        changed = True
    if changed:
        sf.save()
    return JsonResponse({'file': {
        'id': sf.id,
        'original_name': sf.original_name,
        'comment': sf.comment,
    }})

@require_http_methods(["DELETE"])
@require_auth
def delete_file(request, file_id: int):
    sf = get_object_or_404(StoredFile, pk=file_id)
    if not (request.user.is_staff or sf.owner_id == request.user.id):
        return JsonResponse({'detail': 'Недостаточно прав'}, status=403)
    delete_file_safe(sf.rel_path)
    sf.delete()
    return JsonResponse({'ok': True})

@require_http_methods(["GET"])
@require_auth
def download_file(request, file_id: int):
    sf = get_object_or_404(StoredFile, pk=file_id)
    if not (request.user.is_staff or sf.owner_id == request.user.id):
        return JsonResponse({'detail': 'Недостаточно прав'}, status=403)
    abs_path = absolute_path(sf.rel_path)
    if not abs_path.exists():
        raise Http404()
    sf.last_downloaded_at = datetime.utcnow()
    sf.save(update_fields=['last_downloaded_at'])
    resp = FileResponse(open(abs_path, 'rb'), content_type=sf.mime_type)
    resp["Content-Disposition"] = f"attachment; filename*=UTF-8''{sf.original_name}"
    return resp

@require_http_methods(["POST"])
@require_auth
def publish_file(request, file_id: int):
    sf = get_object_or_404(StoredFile, pk=file_id)
    if not (request.user.is_staff or sf.owner_id == request.user.id):
        return JsonResponse({'detail': 'Недостаточно прав'}, status=403)
    if not sf.public_token:
        sf.public_token = StoredFile.new_public_token()
        sf.save(update_fields=['public_token'])
    return JsonResponse({'public_url': f"/public/{sf.public_token}"})