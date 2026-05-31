from django.db import models
from django.conf import settings

# Notification table
# System alerts emitted to users regarding new comments or changes
class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False)
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-create_at']
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:30]}"