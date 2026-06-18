from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Category, AssetItem, Workflow, Process

User = get_user_model()

class BaseProcessTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='adminuser', password='pw', role='Admin', is_superuser=True, is_staff=True
        )
        self.leader = User.objects.create_user(
            username='leaderuser', password='pw', role='User'
        )
        self.normal_user = User.objects.create_user(
            username='normaluser', password='pw', role='User'
        )
        self.category = Category.objects.create(
            title='Test Category', leader=self.leader
        )
        self.item = AssetItem.objects.create(
            category=self.category, title='Test Item'
        )
        self.workflow = Workflow.objects.create(
            item=self.item, name='Test Workflow'
        )

class CategoryTests(BaseProcessTestCase):
    def test_get_categories(self):
        self.client.force_authenticate(user=self.normal_user)
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_create_category(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('category-list')
        response = self.client.post(url, {'title': 'New Category'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 2)

    def test_non_admin_create_category_fails(self):
        self.client.force_authenticate(user=self.leader)
        url = reverse('category-list')
        response = self.client.post(url, {'title': 'New Category'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_delete_category(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('category-detail', kwargs={'pk': self.category.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Category.objects.count(), 0)

class AssetItemTests(BaseProcessTestCase):
    def test_get_items(self):
        self.client.force_authenticate(user=self.normal_user)
        url = reverse('item-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_create_item(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('item-list')
        response = self.client.post(url, {'category': self.category.pk, 'title': 'New Item'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AssetItem.objects.count(), 2)

    def test_leader_create_item_fails(self):
        self.client.force_authenticate(user=self.leader)
        url = reverse('item-list')
        response = self.client.post(url, {'category': self.category.pk, 'title': 'New Item'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_normal_user_create_item_fails(self):
        self.client.force_authenticate(user=self.normal_user)
        url = reverse('item-list')
        response = self.client.post(url, {'category': self.category.pk, 'title': 'New Item'})
        # Depending on permissions, usually non-leader cannot create
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST])

class WorkflowTests(BaseProcessTestCase):
    def test_get_workflows(self):
        self.client.force_authenticate(user=self.normal_user)
        url = reverse('workflow-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_create_workflow(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('workflow-list')
        response = self.client.post(url, {'item': self.item.pk, 'name': 'New Workflow'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workflow.objects.count(), 2)

class ProcessTests(BaseProcessTestCase):
    def test_create_process(self):
        self.client.force_authenticate(user=self.leader)
        url = reverse('process-list')
        response = self.client.post(url, {
            'workflow': self.workflow.pk,
            'name': 'Step 1',
            'step': 1,
            'content': 'Do this'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Process.objects.count(), 1)
