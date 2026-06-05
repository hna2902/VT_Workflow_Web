from rest_framework import serializers

from backend.comments.models import Comment, CommentImage

class CommentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentImage
        fields = '__all__'
        read_only_fields = ['create_at']

class CommentSerializer(serializers.ModelSerializer):
    images = CommentImageSerializer(source='commentimage_set', many=True, read_only=True)
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['create_at']
    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Comment content cannot be empty.")
        return value