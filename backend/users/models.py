import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

# Users table
# Custom User model extending Django's built-in AbstractUser
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=50, default='User')
    name = models.CharField(max_length=50)
    notif_enabled = models.BooleanField(default=True)
    avatar = models.ImageField(max_length=500, null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.username