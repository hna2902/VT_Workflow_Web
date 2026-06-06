from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from .models import Category, AssetItem, Workflow, Process, ProcessImage
from .serializers import CategorySerializer, AssetItemSerializer, WorkflowSerializer, ProcessSerializer, ProcessImageSerializer
from .permissions import IsAdminOrCategoryLeader


class CategoryViewSet(viewsets.ModelViewSet):
    # 1. Define the data source
    queryset = Category.objects.all()
    # 2. Define the translator
    serializer_class = CategorySerializer
    def get_permission(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class AssetItemViewSet(viewsets.ModelViewSet):
    queryset = AssetItem.objects.all()
    serializer_class = AssetItemSerializer
    def get_queryset(self):
        # 1. Get the base list of all assets
        queryset = super().get_queryset()
        # 2. Extract the 'category' parameter from the URL (if it exists)
        category_id = self.request.query_params.get('category')
        # 3. If a category ID was provided, filter the list before returning it
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset
    def get_permission(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        asset_item_id = self.request.query_params.get('asset_item')
        if asset_item_id:
            queryset = queryset.filter(asset_item_id=asset_item_id)
        return queryset
    def get_permission(self):
        # Global admins can create, but category leaders can update/delete their own workflows
        if self.action == 'create':
            return [IsAdminUser()] 
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminOrCategoryLeader()]
        return [IsAuthenticated()]
    
class ProcessViewSet(viewsets.ModelViewSet):
    queryset = Process.objects.all()
    serializer_class = ProcessSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        workflow_id = self.request.query_params.get('workflow')
        if workflow_id:
            queryset = queryset.filter(workflow_id=workflow_id)
        return queryset
    def get_permissions(self):
        if self.action == 'create':
            return [IsAdminUser()] 
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminOrCategoryLeader()]
        return [IsAuthenticated()]

class ProcessImageViewSet(viewsets.ModelViewSet):
    queryset = ProcessImage.objects.all()
    serializer_class = ProcessImageSerializer
    # Enable file upload handling (multipart/form-data)
    parser_classes = [MultiPartParser, FormParser]
    def get_permission(self):
        if self.action == 'create':
            return [IsAdminUser()] 
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminOrCategoryLeader()]
        return [IsAuthenticated()]