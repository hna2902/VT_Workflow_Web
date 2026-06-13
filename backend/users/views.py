from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.hashers import check_password
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.core.mail import send_mail
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import PasswordResetRequestSerializer, RegisterSerializer, SetNewPasswordSerializer

User = get_user_model()

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