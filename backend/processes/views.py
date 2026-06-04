from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    # 1. Define the data source
    queryset = Category.objects.all()
    # 2. Define the translator
    serializer_class = CategorySerializer