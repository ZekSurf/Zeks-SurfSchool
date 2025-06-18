import { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
import { supabase } from '../../../lib/supabase';

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

// Load subscriptions from Supabase
const loadSubscriptions = async (): Promise<PushSubscriptionData[]> => {
  try {
    const { data: subscriptionRows, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading subscriptions from Supabase:', error);
      return [];
    }

    // Convert Supabase format to expected format
    return (subscriptionRows || []).map(row => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh_key,
        auth: row.auth_key
      },
      userAgent: row.user_agent,
      subscriptionTime: row.created_at
    }));
  } catch (error) {
    console.error('Error loading subscriptions:', error);
    return [];
  }
};

// Remove invalid subscription from Supabase
const removeInvalidSubscription = async (endpoint: string) => {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error removing invalid subscription:', error);
    } else {
      console.log('🧹 Removed invalid subscription:', endpoint.substring(0, 50) + '...');
    }
  } catch (error) {
    console.error('Error removing invalid subscription:', error);
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
      await removeInvalidSubscription(subscription.endpoint);
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

    // Load subscriptions from Supabase
    const subscriptions = await loadSubscriptions();
    
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

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          sent++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }
    });

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