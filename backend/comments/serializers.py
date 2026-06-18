from rest_framework import serializers

from .models import Comment, CommentImage

class CommentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentImage
        fields = '__all__'
        read_only_fields = ['create_at']

class CommentSerializer(serializers.ModelSerializer):
    images = CommentImageSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['create_at', 'user']
    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Comment content cannot be empty.")
        return value