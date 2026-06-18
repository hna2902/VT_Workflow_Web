import uuid
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from core import settings

# Category table
# High-level asset classifications managed exclusively by Admins
class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True)
    leader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,blank=True,related_name='managed_categories')
    status = models.CharField(max_length=50, default='Active')
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# AssetItem table
# Specific equipment or enterprise asset belonging to a Category
class AssetItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=50)
    image = models.ImageField(upload_to='assets/images/', blank=True, null=True)
    status = models.CharField(max_length=50, default='Active')
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

@receiver(post_delete, sender=AssetItem)
def delete_asset_item_image(sender, instance, **kwargs):
    """Delete file from filesystem when AssetItem object is deleted."""
    if instance.image:
        instance.image.delete(save=False)
    
# Workflow table
# Standalone maintenance or repair routines bound to an AssetItem
class Workflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(AssetItem, on_delete=models.CASCADE, related_name='workflow')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image_file = models.ImageField(upload_to='workflows/images/', blank=True, null=True)
    video_file = models.FileField(upload_to='workflows/videos/', blank=True, null=True)
    document_file = models.FileField(upload_to='workflows/documents/', blank=True, null=True)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item.title} - {self.name}"

@receiver(post_delete, sender=Workflow)
def delete_workflow_files(sender, instance, **kwargs):
    """Delete files from filesystem when Workflow object is deleted."""
    if instance.image_file:
        instance.image_file.delete(save=False)
    if instance.video_file:
        instance.video_file.delete(save=False)
    if instance.document_file:
        instance.document_file.delete(save=False)
    
# Process table
# Detailed step-by-step procedures within an overarching Workflow
class Process(models.Model):
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='process')
    name = models.CharField(max_length=255)
    step = models.PositiveIntegerField()
    content = models.TextField()
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Enforces ascending order based on the step sequence number
        ordering = ['step']
        unique_together = ['workflow', 'step']

    def __str__(self):
        return f"Step {self.step}: {self.name}"
    
# ProcessImage table
# Illustrative multimedia assets linked to a specific Process step
class ProcessImage(models.Model):
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='processImg')
    image_file = models.FileField(upload_to='processes/images/', null=True, blank=True)
    caption = models.CharField(max_length=255, null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.process.name}"

@receiver(post_delete, sender=ProcessImage)
def delete_process_file(sender, instance, **kwargs):
    """Delete file from filesystem when ProcessImage object is deleted."""
    if instance.image_file:
        instance.image_file.delete(save=False)
