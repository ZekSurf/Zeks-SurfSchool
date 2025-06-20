import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // SECURITY: Disable debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end('Method Not Allowed');
    }

    try {
      // SECURITY: Only allow in development
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
          success: false,
          error: 'Debug endpoints only available in development'
        });
      }

      // Create test notification payload
      const notificationPayload = {
        title: '🧪 Test Notification',
        body: 'This is a test notification from the debug panel',
        icon: '/zek-surf-icon.ico',
        tag: 'test-notification',
        data: {
          url: '/staff-portal-a8f3e2b1c9d7e4f6',
          type: 'test'
        }
      };

      console.log('🧪 Test push notification starting...');
      console.log('📱 Notification payload:', JSON.stringify(notificationPayload, null, 2));

      const pushUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/push/send-notification`;
      console.log('📱 Push URL:', pushUrl);

      const pushResponse = await fetch(pushUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPayload),
      });

      console.log('📱 Push response status:', pushResponse.status);
      console.log('📱 Push response statusText:', pushResponse.statusText);

      if (pushResponse.ok) {
        const pushResult = await pushResponse.json();
        console.log('✅ Test push notification sent successfully:', pushResult);

        return res.status(200).json({
          success: true,
          message: 'Test notification sent successfully',
          result: pushResult
        });
      } else {
        const pushError = await pushResponse.text();
        console.error('❌ Test push notification failed:', pushError);

        return res.status(500).json({
          success: false,
          error: 'Failed to send test notification',
          details: pushError
        });
      }

    } catch (error) {
      console.error('💥 Exception in test push notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
} 