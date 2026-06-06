from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Comment, CommentImage
from .serializers import CommentSerializer, CommentImageSerializer

# Create your views here.
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        process_id = self.request.query_params.get('process')
        if process_id:
            queryset = queryset.filter(process_id=process_id)
        return queryset
    
class CommentImageViewSet(viewsets.ModelViewSet):
    queryset = CommentImage.objects.all()
    serializer_class = CommentImageSerializer
    parser_classes = [MultiPartParser, FormParser]