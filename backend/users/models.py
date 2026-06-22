import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

# User model
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=50, default='User')
    name = models.CharField(max_length=50)
    notif_enabled = models.BooleanField(default=True)
    avatar = models.ImageField(max_length=500, null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.username
    
@receiver(post_save, sender=User)
def ensure_superuser_is_admin(sender, instance, created, **kwargs):
    if instance.is_superuser and instance.role != 'Admin':
        sender.objects.filter(pk=instance.pk).update(role='Admin')