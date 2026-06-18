from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.core import mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import PasswordResetTokenGenerator

User = get_user_model()

class BaseUserTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', 
            password='testpassword123',
            email='testuser@example.com',
            name='Test User',
            role='User'
        )
        self.admin = User.objects.create_user(
            username='adminuser',
            password='adminpassword123',
            email='admin@example.com',
            name='Admin User',
            role='Admin',
            is_superuser=True
        )

class AuthenticationTests(BaseUserTestCase):
    def test_register_user_success(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'password': 'newpassword123',
            'email': 'newuser@example.com',
            'name': 'New User'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login_success(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileUpdateTests(BaseUserTestCase):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.user)

    def test_update_name_success(self):
        url = reverse('update-name')
        response = self.client.patch(url, {'name': 'Updated Name'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, 'Updated Name')

    def test_update_name_empty(self):
        url = reverse('update-name')
        response = self.client.patch(url, {'name': '   '})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_email_success(self):
        url = reverse('update-email')
        response = self.client.patch(url, {'email': 'updated@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'updated@example.com')

    def test_update_email_conflict(self):
        # Create another user
        User.objects.create_user(username='other', password='pw', email='other@example.com')
        url = reverse('update-email')
        response = self.client.patch(url, {'email': 'other@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_success(self):
        url = reverse('change-password')
        data = {
            'currentPassword': 'testpassword123',
            'newPassword': 'newpassword123'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))

    def test_change_password_wrong_current(self):
        url = reverse('change-password')
        data = {
            'currentPassword': 'wrongpassword',
            'newPassword': 'newpassword123'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_toggle_notification(self):
        url = reverse('toggle-notif')
        initial_status = self.user.notif_enabled
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.notif_enabled, initial_status)


class PasswordResetTests(BaseUserTestCase):
    def test_password_reset_request_valid_email(self):
        url = reverse('password_reset')
        response = self.client.post(url, {'email': 'testuser@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Click the link below', mail.outbox[0].body)

    def test_password_reset_request_invalid_email(self):
        url = reverse('password_reset')
        # Even if email doesn't exist, it should return 200 to prevent user enumeration
        response = self.client.post(url, {'email': 'notexist@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm_success(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = PasswordResetTokenGenerator().make_token(self.user)
        url = reverse('password_reset_confirm')
        data = {
            'uidb64': uidb64,
            'token': token,
            'password': 'resetpassword123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('resetpassword123'))

    def test_password_reset_confirm_invalid_token(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        url = reverse('password_reset_confirm')
        data = {
            'uidb64': uidb64,
            'token': 'invalid-token',
            'password': 'resetpassword123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AdminUserTests(BaseUserTestCase):
    def test_admin_get_user_list(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should contain testuser but not adminuser
        self.assertTrue(any(u['username'] == 'testuser' for u in response.data))
        self.assertFalse(any(u['username'] == 'adminuser' for u in response.data))

    def test_non_admin_get_user_list(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_delete_user(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-update-user', kwargs={'pk': self.user.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())

    def test_admin_delete_superuser_fails(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-update-user', kwargs={'pk': self.admin.pk})
        response = self.client.delete(url)
        # Cannot delete superuser/oneself
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
