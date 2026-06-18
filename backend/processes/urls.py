from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetItemViewSet, CategoryViewSet, ProcessImageViewSet, ProcessViewSet, WorkflowViewSet, WorkflowFileViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'items', AssetItemViewSet, basename='item')
router.register(r'assets', AssetItemViewSet, basename='asset')
router.register(r'workflows', WorkflowViewSet, basename='workflow')
router.register(r'process', ProcessViewSet, basename='process')
router.register(r'process-images', ProcessImageViewSet, basename='process-image')
router.register(r'workflow-files', WorkflowFileViewSet, basename='workflow-file')
urlpatterns = [
    path('', include(router.urls)),
]