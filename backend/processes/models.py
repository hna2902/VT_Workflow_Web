import uuid
from django.db import models
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
    status = models.CharField(max_length=50, default='Active')
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
# Workflow table
# Standalone maintenance or repair routines bound to an AssetItem
class Workflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(AssetItem, on_delete=models.CASCADE, related_name='workflow')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item.title} - {self.name}"
    
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

    def __str__(self):
        return f"Step {self.step}: {self.name}"
    
# ProcessImage table
# Illustrative multimedia assets linked to a specific Process step
class ProcessImage(models.Model):
    process = models.ForeignKey(Process, on_delete=models.CASCADE, related_name='processImg')
    img_url = models.CharField(max_length=1000, null=True, blank=True)
    caption = models.CharField(max_length=255, null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.process.name}"
    
