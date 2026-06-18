from rest_framework import permissions

class IsAdminOrCategoryLeader(permissions.BasePermission):
    def has_permission(self, request, view):
        # 1. Bắt buộc phải đăng nhập
        if not bool(request.user and request.user.is_authenticated):
            return False

        # 2. VÁ LỖ HỔNG DRF: Xử lý quyền khi tạo mới (POST)
        if request.method == 'POST':
            if request.user.is_staff:
                return True
                
            # Dò tìm Parent ID từ dữ liệu gửi lên để kiểm tra quyền
            workflow_id = request.data.get('workflow')
            if workflow_id:
                from processes.models import Workflow # Import để gọi DB
                workflow = Workflow.objects.filter(id=workflow_id).first()
                if workflow:
                    # Lần ngược lên: Workflow -> AssetItem -> Category -> Leader
                    return workflow.item.category.leader == request.user
            return True # Hoặc False tùy thuộc bạn muốn khóa cứng cỡ nào

        return True
    def has_object_permission(self, request, view, obj):
        # Safe methods (GET, HEAD, OPTIONS) are allowed for any authenticated user to view the data
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
            
        if hasattr(obj, 'leader'):
            # This is Category
            return obj.leader == request.user
        elif hasattr(obj, 'category'):
            # This is AssetItem
            return obj.category and obj.category.leader == request.user
        elif hasattr(obj, 'item'):
            # This is Workflow
            return obj.item and obj.item.category and obj.item.category.leader == request.user
        elif hasattr(obj, 'workflow'):
            # This is Process
            return obj.workflow and obj.workflow.item and obj.workflow.item.category and obj.workflow.item.category.leader == request.user
        elif hasattr(obj, 'process'):
            # This is ProcessImage
            return obj.process and obj.process.workflow and obj.process.workflow.item and obj.process.workflow.item.category and obj.process.workflow.item.category.leader == request.user
            
        return False