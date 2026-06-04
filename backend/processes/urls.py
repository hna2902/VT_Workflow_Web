from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetItemViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'assets', AssetItemViewSet, basename='asset')
urlpatterns = [
    path('', include(router.urls)),
    
]