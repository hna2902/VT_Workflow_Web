from django.db import models
from django.conf import settings
# Comment model
class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    workflow = models.ForeignKey('processes.Workflow', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-create_at']
    def __str__(self):
        return f"Comment by {self.user.username} on {self.workflow.name}"
    
# Comment image model
class CommentImage(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='images')
    img_url = models.FileField(upload_to='comments/images/', max_length=1000)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.img_url.name if self.img_url else "No File"

from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=CommentImage)
def delete_comment_file(sender, instance, **kwargs):
    """Delete file from filesystem when CommentImage object is deleted."""
    if instance.img_url:
        instance.img_url.delete(save=False)