from rest_framework import permissions

class IsAdminOrCategoryLeader(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
    def has_object_permission(self, request, view, obj):
        # Safe methods (GET, HEAD, OPTIONS) are allowed for any authenticated user to view the data
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        if hasattr(obj, 'leader'):
            return obj.leader == request.user
        elif hasattr(obj, 'category'):
            return obj.category and obj.category.leader == request.user
        elif hasattr(obj, 'workflow'):
            return obj.workflow and obj.workflow.category and obj.workflow.category.leader == request.user
        elif hasattr(obj, 'process'):
            return obj.process and obj.process.workflow and obj.process.workflow.category and obj.process.workflow.category.leader == request.user
        return False