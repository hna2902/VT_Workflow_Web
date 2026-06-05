from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Category, AssetItem, Workflow, Process, ProcessImage
from .serializers import CategorySerializer, AssetItemSerializer, WorkflowSerializer, ProcessSerializer, ProcessImageSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    # 1. Define the data source
    queryset = Category.objects.all()
    # 2. Define the translator
    serializer_class = CategorySerializer

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
    
class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        asset_item_id = self.request.query_params.get('asset_item')
        if asset_item_id:
            queryset = queryset.filter(asset_item_id=asset_item_id)
        return queryset
    
class ProcessViewSet(viewsets.ModelViewSet):
    queryset = Process.objects.all()
    serializer_class = ProcessSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        workflow_id = self.request.query_params.get('workflow')
        if workflow_id:
            queryset = queryset.filter(workflow_id=workflow_id)
        return queryset


class ProcessImageViewSet(viewsets.ModelViewSet):
    queryset = ProcessImage.objects.all()
    serializer_class = ProcessImageSerializer
    # Enable file upload handling (multipart/form-data)
    parser_classes = [MultiPartParser, FormParser]