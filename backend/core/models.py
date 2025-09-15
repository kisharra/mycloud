import os
import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    full_name = models.CharField(max_length=255)
    storage_rel_path = models.CharField(max_length=255, default='')  # относительный путь


class StoredFile(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='files'
    )
    original_name = models.CharField(max_length=255)
    stored_name = models.CharField(max_length=64, unique=True)  # UUID
    mime_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    comment = models.CharField(max_length=500, blank=True, default='')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_downloaded_at = models.DateTimeField(null=True, blank=True)
    rel_dir = models.CharField(max_length=255)  # поддиректория относительно FILE_STORAGE_ROOT
    public_token = models.CharField(max_length=64, null=True, blank=True, unique=True)

    class Meta:
        ordering = ['-uploaded_at']

    @property
    def rel_path(self) -> str:
        return os.path.join(self.rel_dir, self.stored_name)

    @staticmethod
    def new_storage_name() -> str:
        return uuid.uuid4().hex

    @staticmethod
    def new_public_token() -> str:
        return uuid.uuid4().hex
