from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from .models import Comment, CommentImage
from .serializers import CommentSerializer, CommentImageSerializer

class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        workflow_id = self.request.query_params.get('workflow')
        if workflow_id:
            queryset = queryset.filter(workflow_id=workflow_id)
        return queryset
        
    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)
        
        # Send notification
        try:
            from django.contrib.auth import get_user_model
            from notifications.models import Notification
            
            User = get_user_model()
            workflow = comment.workflow
            sender_name = self.request.user.name or self.request.user.username
            message = f"{sender_name} đã bình luận trong quy trình '{workflow.name}'"
            
            # Notify opted-in users
            users_to_notify = set(User.objects.filter(notif_enabled=True))
            
            # Exclude author
            if self.request.user in users_to_notify:
                users_to_notify.remove(self.request.user)
                
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            for u in users_to_notify:
                Notification.objects.create(user=u, message=message)
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{u.id}",
                        {
                            "type": "send_notification",
                            "message": message
                        }
                    )
        except Exception as e:
            print("Failed to send notification:", e)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        comment_id = response.data.get('id')
        if comment_id:
            comment = Comment.objects.get(id=comment_id)
            print("request.FILES:", request.FILES)
            images = request.FILES.getlist('images[]')
            if not images:
                images = request.FILES.getlist('images')
            if images:
                for image in images:
                    CommentImage.objects.create(comment=comment, img_url=image)
                # Re-serialize with images
                from rest_framework.response import Response
                from rest_framework import status
                serializer = self.get_serializer(comment)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return response

    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bạn không có quyền sửa bình luận này.")
        
        response = super().update(request, *args, **kwargs)
        
        deleted_image_ids = request.data.getlist('deleted_images[]')
        if deleted_image_ids:
            CommentImage.objects.filter(id__in=deleted_image_ids, comment=comment).delete()
        
        images = request.FILES.getlist('images[]')
        if not images:
            images = request.FILES.getlist('images')
        if images:
            for image in images:
                CommentImage.objects.create(comment=comment, img_url=image)
            from rest_framework.response import Response
            from rest_framework import status
            serializer = self.get_serializer(comment)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        return response

    def partial_update(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bạn không có quyền sửa bình luận này.")
            
        response = super().partial_update(request, *args, **kwargs)
        
        deleted_image_ids = request.data.getlist('deleted_images[]')
        if deleted_image_ids:
            CommentImage.objects.filter(id__in=deleted_image_ids, comment=comment).delete()
        
        images = request.FILES.getlist('images[]')
        if not images:
            images = request.FILES.getlist('images')
        if images:
            for image in images:
                CommentImage.objects.create(comment=comment, img_url=image)
            from rest_framework.response import Response
            from rest_framework import status
            serializer = self.get_serializer(comment)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        return response

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != request.user and request.user.role != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bạn không có quyền xóa bình luận này.")
        return super().destroy(request, *args, **kwargs)
    
class CommentImageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CommentImage.objects.all()
    serializer_class = CommentImageSerializer
    parser_classes = [MultiPartParser, FormParser]