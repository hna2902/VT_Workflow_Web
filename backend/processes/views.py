from rest_framework import viewsets
from .models import Category, AssetItem, Workflow
from .serializers import CategorySerializer, AssetItemSerializer, WorkflowSerializer

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
        # Example URL: /api/assets/?category=1
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