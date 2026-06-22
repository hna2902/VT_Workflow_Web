from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from processes.models import Category, AssetItem, Workflow
from .models import Comment

User = get_user_model()

class BaseCommentTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='adminuser', password='pw', role='Admin', is_superuser=True
        )
        self.user1 = User.objects.create_user(
            username='user1', password='pw', role='User'
        )
        self.user2 = User.objects.create_user(
            username='user2', password='pw', role='User'
        )
        self.category = Category.objects.create(title='Test Category')
        self.item = AssetItem.objects.create(category=self.category, title='Test Item')
        self.workflow = Workflow.objects.create(item=self.item, name='Test Workflow')
        
        self.comment = Comment.objects.create(
            user=self.user1, workflow=self.workflow, content='First comment'
        )

class CommentTests(BaseCommentTestCase):
    def test_get_comments(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('comment-list')
        response = self.client.get(url, {'workflow': self.workflow.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_comment(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('comment-list')
        response = self.client.post(url, {
            'workflow': self.workflow.pk,
            'content': 'New comment'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)
        # Check user auto-assignment
        self.assertEqual(Comment.objects.get(content='New comment').user, self.user2)

    def test_edit_own_comment(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('comment-detail', kwargs={'pk': self.comment.pk})
        response = self.client.patch(url, {'content': 'Edited'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.content, 'Edited')

    def test_edit_others_comment_fails(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('comment-detail', kwargs={'pk': self.comment.pk})
        response = self.client.patch(url, {'content': 'Hacked'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_own_comment(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('comment-detail', kwargs={'pk': self.comment.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)

    def test_admin_delete_others_comment(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('comment-detail', kwargs={'pk': self.comment.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)

    def test_user_delete_others_comment_fails(self):
        self.client.force_authenticate(user=self.user2)
        url = reverse('comment-detail', kwargs={'pk': self.comment.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Comment.objects.count(), 1)
