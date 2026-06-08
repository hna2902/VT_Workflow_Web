from django.db import models
from django.conf import settings
# Comment table
class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    workflow = models.ForeignKey('processes.Workflow', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-create_at']
    def __str__(self):
        return f"Comment by {self.user.username} on {self.workflow.name}"
    
# CommentImg table
# Using to store picture for comments
class CommentImage(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='images')
    img_url = models.ImageField(max_length=1000)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.img_url