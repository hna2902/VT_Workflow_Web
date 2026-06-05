from multiprocessing import Process

from rest_framework import serializers
from .models import Category, AssetItem, ProcessImage, Workflow

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
    
class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = '__all__'
        read_only_fields = ['create_at']
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Workflow title cannot be empty or contain only spaces.")
        return value

class ProcessImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessImage
        field = '__all__'
        read_only_fields = ['create_at']

class ProcessSerializer(serializers.ModelSerializer):
    workflow_title = serializers.CharField(source='workflow.title', read_only=True)
    images = ProcessImageSerializer(source='processimage_set', many=True, read_only=True)
    class Meta:
        model = Process
        fields = '__all__'
        read_only_fields = ['create_at']
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Process title cannot be empty")
        return value

