import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

// Define the subscription interface
interface PushSubscription {
  endpoint?: string;
  userAgent?: string;
  subscriptionTime?: string;
  [key: string]: any; // Allow for additional properties
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Check environment variables
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    // Load subscriptions from Supabase
    let subscriptionCount = 0;
    let subscriptions: PushSubscription[] = [];
    
    try {
      const { data: subscriptionRows, error, count } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error loading subscriptions from Supabase:', error);
      } else {
        subscriptionCount = count || 0;
        subscriptions = (subscriptionRows || []).map(row => ({
          endpoint: row.endpoint,
          userAgent: row.user_agent,
          subscriptionTime: row.created_at
        }));
      }
    } catch (error) {
      console.error('Error reading subscriptions from Supabase:', error);
    }

    // Return debug info
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vapidKeys: {
        publicKey: vapidPublicKey ? `${vapidPublicKey.substring(0, 20)}...` : 'NOT_SET',
        privateKey: vapidPrivateKey ? 'SET' : 'NOT_SET',
        clientPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 
          `${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.substring(0, 20)}...` : 'NOT_SET'
      },
      webhookConfig: {
        nextAuthUrl: nextAuthUrl || 'NOT_SET',
        usingFallback: !nextAuthUrl
      },
      subscriptions: {
        count: subscriptionCount,
        hasSupabaseConnection: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        recentSubscriptions: subscriptions.map((sub: PushSubscription) => ({
          endpoint: sub.endpoint?.substring(0, 50) + '...',
          userAgent: sub.userAgent?.substring(0, 50) + '...',
          subscriptionTime: sub.subscriptionTime
        }))
      },
      lastWebhookCall: {
        // This would be set by webhook calls
        timestamp: 'Not tracked yet',
        success: 'Unknown'
      }
    };

    return res.status(200).json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('Error in push config debug:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 