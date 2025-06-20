import { NextApiRequest, NextApiResponse } from 'next';
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

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'push-subscriptions.json');

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

// Save subscriptions
const saveSubscriptions = (subscriptions: PushSubscriptionData[]) => {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
    console.log('✅ Subscriptions updated:', subscriptions.length);
  } catch (error) {
    console.error('❌ Error saving subscriptions:', error);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ 
        success: false, 
        error: 'Endpoint is required' 
      });
    }

    // Load existing subscriptions
    const subscriptions = loadSubscriptions();

    // Remove subscription with matching endpoint
    const filteredSubscriptions = subscriptions.filter(
      sub => sub.endpoint !== endpoint
    );

    const removed = subscriptions.length - filteredSubscriptions.length;

    // Save updated subscriptions
    saveSubscriptions(filteredSubscriptions);

    // SECURITY: Removed unsubscription logging - contains endpoint data

    return res.status(200).json({ 
      success: true, 
      message: removed > 0 ? 'Subscription removed successfully' : 'Subscription not found',
      removed: removed > 0,
      total: filteredSubscriptions.length
    });

  } catch (error) {
    console.error('❌ Error handling push unsubscription:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 