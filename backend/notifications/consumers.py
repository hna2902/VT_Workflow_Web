import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
            return

        # Set group name
        self.group_name = f"user_{user.id}"

        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        user = self.scope['user']
        if not user.is_anonymous:
            # Leave group
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # Receive group message
    async def send_notification(self, event):
        message = event['message']

        # Send WebSocket message
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': message
        }))
