from rest_framework import viewsets
from .models import Category, AssetItem
from .serializers import CategorySerializer, AssetItemSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    # 1. Define the data source
    queryset = Category.objects.all()
    # 2. Define the translator
    serializer_class = CategorySerializer

class AssetItemViewSet(viewsets.ModelViewSet):
    queryset = AssetItem.objects.all()
    serializer_class = AssetItemSerializer

    # 💡 ADVANCED: Customizing the Queryset for Filtering
    # Why do we need this? Frontend doesn't always want ALL assets in the company.
    # Often, they only want assets belonging to a specific category (e.g., clicking on "Modem" category).
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