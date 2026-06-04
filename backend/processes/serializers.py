from rest_framework import serializers
from .models import Category, AssetItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['create_at']
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Category title cannot be empty or just spaces.")
        return value
    
class AssetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetItem
        fields = '__all__'
        read_only_fields = ['create_at']

    def validate(self, value):
        if not value.strip():
            raise serializers.ValidationError("Asset title cannot be empty")
        return value