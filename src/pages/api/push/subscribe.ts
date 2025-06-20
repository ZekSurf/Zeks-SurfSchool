import { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const subscription: PushSubscriptionData = req.body;

    // Validate subscription data
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid subscription data' 
      });
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .single();

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          user_agent: subscription.userAgent,
          updated_at: new Date().toISOString()
        })
        .eq('endpoint', subscription.endpoint);

      if (updateError) {
        console.error('❌ Error updating push subscription:', updateError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update subscription' 
        });
      }

      // SECURITY: Removed subscription logging - contains endpoint data
    } else {
      // Insert new subscription
      const { error: insertError } = await supabase
        .from('push_subscriptions')
        .insert({
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          user_agent: subscription.userAgent
        });

      if (insertError) {
        console.error('❌ Error saving push subscription:', insertError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to save subscription' 
        });
      }

      // SECURITY: Removed subscription logging - contains endpoint data
    }

    // Get total subscription count
    const { count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({ 
      success: true, 
      message: 'Subscription saved successfully',
      total: count || 0
    });

  } catch (error) {
    console.error('❌ Error handling push subscription:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 