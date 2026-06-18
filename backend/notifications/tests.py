from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

class NotificationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', password='pw', role='User'
        )
        self.other_user = User.objects.create_user(
            username='otheruser', password='pw', role='User'
        )
        self.notif1 = Notification.objects.create(
            user=self.user,
            message='Hello',
            is_read=False
        )
        self.notif2 = Notification.objects.create(
            user=self.user,
            message='Warning',
            is_read=True
        )
        self.notif_other = Notification.objects.create(
            user=self.other_user,
            message='Hello',
            is_read=False
        )

    def test_get_notifications(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see their own notifications
        self.assertEqual(len(response.data), 2)

    def test_filter_unread_notifications(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-list')
        response = self.client.get(url, {'is_read': 'false'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.notif1.id)

    def test_mark_as_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-mark-as-read', kwargs={'pk': self.notif1.pk})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_mark_all_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-mark-all-read')
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)
