from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from .models import Category, AssetItem, Workflow, WorkflowFile, Process, ProcessImage
from .serializers import CategorySerializer, AssetItemSerializer, WorkflowSerializer, WorkflowFileSerializer, ProcessSerializer, ProcessImageSerializer
from .permissions import IsAdminOrCategoryLeader


class CategoryViewSet(viewsets.ModelViewSet):
    # 1. Define the data source
    queryset = Category.objects.all()
    # 2. Define the translator
    serializer_class = CategorySerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class AssetItemViewSet(viewsets.ModelViewSet):
    queryset = AssetItem.objects.all()
    serializer_class = AssetItemSerializer
    def get_queryset(self):
        # 1. Get the base list of all assets
        queryset = super().get_queryset()
        # 2. Extract the 'category' parameter from the URL (if it exists)
        category_id = self.request.query_params.get('category')
        # 3. If a category ID was provided, filter the list before returning it
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_queryset(self):
        queryset = super().get_queryset()
        item_id = self.request.query_params.get('item')
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        return queryset
    def get_permissions(self):
        # Global admins can create, but category leaders can update/delete their own workflows
        if self.action == 'create':
            return [IsAdminUser()] 
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminOrCategoryLeader()]
        return [IsAuthenticated()]

    def _save_workflow_files(self, workflow, request):
        for image in request.FILES.getlist('images[]'):
            WorkflowFile.objects.create(workflow=workflow, file=image, file_type='image')
        for video in request.FILES.getlist('videos[]'):
            WorkflowFile.objects.create(workflow=workflow, file=video, file_type='video')
        for document in request.FILES.getlist('documents[]'):
            WorkflowFile.objects.create(workflow=workflow, file=document, file_type='document')

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        workflow_id = response.data.get('id')
        if workflow_id:
            workflow = Workflow.objects.get(id=workflow_id)
            self._save_workflow_files(workflow, request)
            # Tải lại dữ liệu để trả về danh sách file mới cập nhật
            serializer = self.get_serializer(workflow)
            response.data = serializer.data
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        workflow = self.get_object()
        self._save_workflow_files(workflow, request)
        # Tải lại dữ liệu để trả về danh sách file mới cập nhật
        serializer = self.get_serializer(workflow)
        response.data = serializer.data
        return response

class WorkflowFileViewSet(viewsets.ModelViewSet):
    queryset = WorkflowFile.objects.all()
    serializer_class = WorkflowFileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrCategoryLeader()]
        return [IsAuthenticated()]
    
class ProcessViewSet(viewsets.ModelViewSet):
    queryset = Process.objects.all()
    serializer_class = ProcessSerializer
    # FIX NGẦM 1: Thêm Parser để Backend đọc được formData (chữ + hình) từ Frontend gửi lên
    parser_classes = [MultiPartParser, FormParser, JSONParser] 

    def get_queryset(self):
        queryset = super().get_queryset()
        workflow_id = self.request.query_params.get('workflow')
        if workflow_id:
            queryset = queryset.filter(workflow_id=workflow_id)
        return queryset

    def get_permissions(self):
        # FIX TRÍ MẠNG: Gộp chung quyền tạo (create) và sửa/xóa cho ông Admin/Leader
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrCategoryLeader()]
        return [IsAuthenticated()]
        
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        process_id = response.data.get('id')
        if process_id:
            process = Process.objects.get(id=process_id)
            images = request.FILES.getlist('images[]')
            for image in images:
                ProcessImage.objects.create(process=process, image_file=image)
        return response


class ProcessImageViewSet(viewsets.ModelViewSet):
    queryset = ProcessImage.objects.all()
    serializer_class = ProcessImageSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # FIX NGẦM 2: Phải có chữ "s" (get_permissions) thì Django mới hiểu!
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrCategoryLeader()]
        return [IsAuthenticated()]