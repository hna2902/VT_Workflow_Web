from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by user
        queryset = queryset.filter(user=self.request.user)
        
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        return queryset
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['patch'])
    def mark_all_read(self, request):
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        count = notifications.count()
        notifications.update(is_read=True)
        return Response({'status': f'{count} notifications marked as read'})