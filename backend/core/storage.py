import os
from pathlib import Path
from django.conf import settings


def user_root(user_id: int) -> Path:
    return Path(settings.FILE_STORAGE_ROOT) / str(user_id)

def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)

def subdir_for(stored_name: str) -> str:
    return stored_name[:2]

def save_file(user_id: int, stored_name: str, content) -> str:
    rel_dir = f"{user_id}/{subdir_for(stored_name)}"
    abs_dir = Path(settings.FILE_STORAGE_ROOT) / rel_dir
    ensure_dir(abs_dir)
    abs_path = abs_dir / stored_name
    with open(abs_path, 'wb') as f:
        for chunk in content.chunks():
            f.write(chunk)
    return rel_dir

def absolute_path(rel_path: str) -> Path:
    return Path(settings.FILE_STORAGE_ROOT) / rel_path

def delete_file_safe(rel_path: str) -> None:
    try:
        absolute_path(rel_path).unlink(missing_ok=True)
    except Exception:
        pass