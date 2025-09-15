from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User


@receiver(post_save, sender=User)
def set_storage_rel_path(sender, instance, created, **kwargs):
    if created and not instance.storage_rel_path:
        instance.storage_rel_path = str(instance.id)
        instance.save(update_fields=['storage_rel_path'])
