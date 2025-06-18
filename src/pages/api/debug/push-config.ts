import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

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
    
    // Check if subscriptions file exists
    const subscriptionsFile = path.join(process.cwd(), 'data', 'push-subscriptions.json');
    let subscriptionCount = 0;
    let subscriptions = [];
    
    try {
      if (fs.existsSync(subscriptionsFile)) {
        const data = fs.readFileSync(subscriptionsFile, 'utf8');
        subscriptions = JSON.parse(data);
        subscriptionCount = subscriptions.length;
      }
    } catch (error) {
      console.error('Error reading subscriptions file:', error);
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
        hasSubscriptionsFile: fs.existsSync(subscriptionsFile),
        filePath: subscriptionsFile,
        recentSubscriptions: subscriptions.slice(-3).map(sub => ({
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