from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import CustomTokenObtainPairView
from .views import (
    PasswordResetConfirmView, 
    PasswordResetRequestView, 
    RegisterView, 
    ToggleNotifView,
    UpdateEmailView, 
    ChangePasswordView, 
    UpdateAvatarView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh_'),

    path('update-email/', UpdateEmailView.as_view(), name='update-email'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-avatar/', UpdateAvatarView.as_view(), name='update-avatar'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('toggle-notif/', ToggleNotifView.as_view(), name='toggle-notif'),
]