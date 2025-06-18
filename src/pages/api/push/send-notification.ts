import { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  subscriptionTime?: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  bookingId?: string;
  customerName?: string;
  beach?: string;
  lessonDate?: string;
  lessonTime?: string;
}

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'push-subscriptions.json');

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@zekssurf.com', // Your email
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('⚠️ VAPID keys not configured - push notifications will not work');
}

// Load existing subscriptions
const loadSubscriptions = (): PushSubscriptionData[] => {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading subscriptions:', error);
  }
  return [];
};

// Save subscriptions (to remove invalid ones)
const saveSubscriptions = (subscriptions: PushSubscriptionData[]) => {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
  } catch (error) {
    console.error('❌ Error saving subscriptions:', error);
  }
};

// Send notification to a single subscription
const sendToSubscription = async (
  subscription: PushSubscriptionData, 
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> => {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log('✅ Notification sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send notification:', error?.message || error);
    
    // If subscription is invalid (410 status), mark for removal
    if (error?.statusCode === 410 || error?.statusCode === 404) {
      return { success: false, error: 'invalid_subscription' };
    }
    
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // Check if VAPID keys are configured
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(500).json({ 
      success: false, 
      error: 'Push notifications not configured - VAPID keys missing' 
    });
  }

  try {
    const notificationData: NotificationPayload = req.body;

    // Validate required fields
    if (!notificationData.title || !notificationData.body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and body are required' 
      });
    }

    // Load subscriptions
    const subscriptions = loadSubscriptions();
    
    if (subscriptions.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No subscriptions found',
        sent: 0,
        failed: 0 
      });
    }

    console.log(`📱 Sending notification to ${subscriptions.length} devices...`);

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(subscription => sendToSubscription(subscription, notificationData))
    );

    // Process results
    let sent = 0;
    let failed = 0;
    const validSubscriptions: PushSubscriptionData[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          sent++;
          validSubscriptions.push(subscriptions[index]);
        } else {
          failed++;
          // Only keep subscription if it's not marked as invalid
          if (result.value.error !== 'invalid_subscription') {
            validSubscriptions.push(subscriptions[index]);
          }
        }
      } else {
        failed++;
        validSubscriptions.push(subscriptions[index]);
      }
    });

    // Update subscriptions file if we removed any invalid ones
    if (validSubscriptions.length !== subscriptions.length) {
      saveSubscriptions(validSubscriptions);
      console.log(`🧹 Removed ${subscriptions.length - validSubscriptions.length} invalid subscriptions`);
    }

    console.log(`✅ Notification results: ${sent} sent, ${failed} failed`);

    return res.status(200).json({ 
      success: true, 
      message: `Notification sent to ${sent} devices`,
      sent,
      failed,
      total: subscriptions.length
    });

  } catch (error) {
    console.error('❌ Error sending push notifications:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 