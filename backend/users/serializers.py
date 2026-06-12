from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Let SimpleJWT handle the core password validation and token generation
        data = super().validate(attrs)
        # createsuperuser command leaves the custom 'role' field empty or default
        user_role = 'Admin' if self.user.is_superuser else self.user.role
        # Fallback to username if name is not provided, avoiding empty strings on UI
        display_name = self.user.name if self.user.name else self.user.username
        # Safely check if the avatar exists before calling .url to prevent Server 500 errors
        avatar_url = self.user.avatar.url if self.user.avatar else None
        # To save Frontend from doing Date parsing
        created_at_str = self.user.create_at.strftime('%d/%m/%Y') if self.user.create_at else 'Mới đây'
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'name': display_name,
            'role': user_role,
            'avatar': avatar_url,
            'created_at': created_at_str,
            'notif_enabled': getattr(self.user, 'notif_enabled', True) 
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'name', 'password', 'email')
        # Prevent returning the hashed password in the API response
        extra_kwargs = {
            'password': {'write_only':True}
        }
    def create(self, validated_data):
        # Use create_user to automatically hash the password securely
        user = User.objects.create_user(
            username=validated_data['username'],
            name=validated_data.get('name',''),
            email=validated_data.get('email',''),
            password=validated_data['password']
        )
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    uidb64 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            # Decode the user ID
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid user ID.")

        # Verify the token
        if not PasswordResetTokenGenerator().check_token(user, attrs['token']):
            raise serializers.ValidationError("The reset token is invalid or has expired.")

        return attrs