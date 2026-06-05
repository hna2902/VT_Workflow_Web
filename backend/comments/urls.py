from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommentViewSet, CommentImageViewSet

router = DefaultRouter()
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'comment-images', CommentImageViewSet, basename='comment-image')

urlpatterns = [
    path('', include(router.urls)),
]