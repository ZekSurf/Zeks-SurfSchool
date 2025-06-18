import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Simulate a booking notification
    const notificationPayload = {
      title: '🏄‍♂️ Test Booking Notification!',
      body: `John Test booked a lesson at San Onofre on ${new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })} at 9:00 AM`,
      bookingId: 'test-booking-123',
      customerName: 'John Test',
      beach: 'San Onofre',
      lessonDate: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      lessonTime: '9:00 AM',
      data: {
        url: '/staff-portal-a8f3e2b1c9d7e4f6',
        confirmationNumber: 'TEST-123456-7890',
        bookingId: 'test-booking-123'
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
        details: pushResult
      });
    } else {
      const pushError = await pushResponse.text();
      console.error('❌ Test push notification failed:', pushError);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send test notification',
        details: pushError,
        status: pushResponse.status
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