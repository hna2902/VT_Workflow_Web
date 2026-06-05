from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetItemViewSet, CategoryViewSet, ProcessImageViewSet, ProcessViewSet, WorkflowViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'assets', AssetItemViewSet, basename='asset')
router.register(r'workflows', WorkflowViewSet, basename='workflow')
router.register(r'processes', ProcessViewSet, basename='process')
router.register(r'process-images', ProcessImageViewSet, basename='process-image')
urlpatterns = [
    path('', include(router.urls)),
    
]