from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.hashers import check_password
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.core.mail import send_mail
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import PasswordResetRequestSerializer, RegisterSerializer, SetNewPasswordSerializer
from processes.models import Category
User = get_user_model()

class UserListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role != 'Admin':
            return Response(
                {"detail": "Only Admins can view this list."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.exclude(id=request.user.id).exclude(is_superuser=True).values(
            'id', 'username', 'name', 'email', 'role', 'avatar', 'date_joined'
        )
        return Response(list(users), status=status.HTTP_200_OK)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Allow open registration for unauthenticated users
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                # Generate a secure token and encoded user ID
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = PasswordResetTokenGenerator().make_token(user)
                # Link must point to the Frontend routing
                reset_link = f"http://localhost:5173/reset_password?uid={uidb64}&token={token}"
                send_mail(
                    subject = "Password Reset Request",
                    message = f"Click the link below to reset your password",
                    from_email = "noreply@vtjsc.com",
                    recipient_list=[email],
                    fail_silently = False
                )
            # Always return success even if email doesn't exist
            return Response(
                {"message": "A mail has been sent"},
                status = status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = SetNewPasswordSerializer(data=request.data)
        if serializer.is_valid():
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uidb64']))
            user = User.objects.get(pk=uid)
            
            # Securely hash and save the new password
            user.set_password(serializer.validated_data['password'])
            user.save()
            
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ToggleNotifView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        user.notif_enabled = not user.notif_enabled
        user.save()
        
        return Response({
            "message": "Cập nhật thành công",
            "notif_enabled": user.notif_enabled
        })
    
class UpdateEmailView(APIView):
    # Only logged-in users can access this endpoint.
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        new_email = request.data.get('email')
        # Basic validation to ensure the frontend sends the required data.
        if not new_email:
            return Response({"error": "Email is required"}, status=400)
        # Check if any OTHER user (excluding current user) is using this email.
        if User.objects.filter(email=new_email).exclude(id=request.user.id).exists():
            return Response({"error": "Email này đã được sử dụng bởi một tài khoản khác!"}, status=400) 
        request.user.email = new_email
        request.user.save()
        return Response({
            "message": "Email updated successfully",
            "email": request.user.email
        })

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request):
        user = request.user
        current_password = request.data.get('currentPassword')
        new_password = request.data.get('newPassword')
        if not user.check_password(current_password):
            return Response({"error": "Incorrect current password"}, status=400)
        # set_password() handles the hashing securely.
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully"})
    
class UpdateAvatarView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    def patch(self, request):
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response({"error": "No image file provided"}, status=400)
        request.user.avatar = avatar_file
        request.user.save()
        return Response({
            "message": "Avatar updated successfully",
            "avatar": request.user.avatar.url
        })
    
class UpdateNameView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        new_name = request.data.get('name')
        
        # REASON: Validate to prevent empty names or names with only spaces
        if not new_name or len(new_name.strip()) == 0:
            return Response({"error": "Tên không được để trống"}, status=400)
            
        request.user.name = new_name.strip()
        request.user.save()
        
        return Response({
            "message": "Cập nhật tên thành công",
            "name": request.user.name
        })
    
class AdminUpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'Admin':
            return Response({"detail": "Chỉ Admin mới có quyền này."}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Không tìm thấy người dùng."}, status=status.HTTP_404_NOT_FOUND)
        if 'role' in request.data:
            user.role = request.data['role']
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])
        user.save()
        if 'leader_id' in request.data:
            leader_id = request.data['leader_id']
            Category.objects.filter(leader=user).update(leader=None)
            if leader_id is not None:
                Category.objects.filter(id=leader_id).update(leader=user)

        return Response({"message": "Cập nhật thành công!"}, status=status.HTTP_200_OK)
    
    def delete(self, request, pk):
        if request.user.role != 'Admin':
            return Response({"detail": "Chỉ Admin mới có quyền này."}, status=status.HTTP_403_FORBIDDEN)

        try:
            user_to_delete = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Không tìm thấy người dùng."}, status=status.HTTP_404_NOT_FOUND)

        if request.user.id == user_to_delete.id:
            return Response({"detail": "Bạn không thể tự xóa chính tài khoản của mình!"}, status=status.HTTP_400_BAD_REQUEST)

        if user_to_delete.is_superuser:
            return Response({"detail": "Bất khả xâm phạm! Bạn không thể xóa tài khoản Superuser."}, status=status.HTTP_403_FORBIDDEN)

        user_to_delete.delete()
        return Response({"message": "Đã xóa người dùng thành công!"}, status=status.HTTP_200_OK)
    
class VerifyPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get('password')
        user = authenticate(username=request.user.username, password=password)
        if user:
            return Response({"message": "Verified"}, status=status.HTTP_200_OK)
        return Response({"detail": "Mật khẩu không chính xác."}, status=status.HTTP_400_BAD_REQUEST)