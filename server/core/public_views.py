from datetime import datetime
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from .models import StoredFile
from .storage import absolute_path

def public_download(request, token: str):
    sf = get_object_or_404(StoredFile, public_token=token)
    abs_path = absolute_path(sf.rel_path)
    if not abs_path.exists():
        raise Http404()
    sf.last_downloaded_at = datetime.utcnow()
    sf.save(update_fields=['last_downloaded_at'])
    resp = FileResponse(open(abs_path, 'rb'), content_type=sf.mime_type)
    resp["Content-Disposition"] = f"attachment; filename*=UTF-8''{sf.original_name}"
    return resp

