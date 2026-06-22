from rest_framework import permissions

class IsAdminOrCategoryLeader(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check login
        if not bool(request.user and request.user.is_authenticated):
            return False

        # Handle POST permissions
        if request.method == 'POST':
            if request.user.is_staff:
                return True
                
            # Extract parent ID
            workflow_id = request.data.get('workflow')
            if workflow_id:
                from processes.models import Workflow
                workflow = Workflow.objects.filter(id=workflow_id).first()
                if workflow:
                    # Check workflow permission
                    return workflow.item.category.leader == request.user
            
            category_id = request.data.get('category')
            if category_id:
                from processes.models import Category
                category = Category.objects.filter(id=category_id).first()
                if category:
                    return category.leader == request.user

            item_id = request.data.get('item')
            if item_id:
                from processes.models import AssetItem
                item = AssetItem.objects.filter(id=item_id).first()
                if item and item.category:
                    return item.category.leader == request.user
            
            return True

        return True
    def has_object_permission(self, request, view, obj):
        # Safe methods allowed
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
            
        if hasattr(obj, 'leader'):
            return obj.leader == request.user
        elif hasattr(obj, 'category'):
            return obj.category and obj.category.leader == request.user
        elif hasattr(obj, 'item'):
            return obj.item and obj.item.category and obj.item.category.leader == request.user
        elif hasattr(obj, 'workflow'):
            return obj.workflow and obj.workflow.item and obj.workflow.item.category and obj.workflow.item.category.leader == request.user
        elif hasattr(obj, 'process'):
            return obj.process and obj.process.workflow and obj.process.workflow.item and obj.process.workflow.item.category and obj.process.workflow.item.category.leader == request.user
            
        return False