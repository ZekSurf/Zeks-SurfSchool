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

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(SUBSCRIPTIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

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
    ensureDataDirectory();
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
    console.log('✅ Subscriptions saved:', subscriptions.length);
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
    const subscription: PushSubscriptionData = req.body;

    // Validate subscription data
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid subscription data' 
      });
    }

    // Load existing subscriptions
    const subscriptions = loadSubscriptions();

    // Remove any existing subscription with the same endpoint
    const filteredSubscriptions = subscriptions.filter(
      sub => sub.endpoint !== subscription.endpoint
    );

    // Add the new subscription
    filteredSubscriptions.push({
      ...subscription,
      subscriptionTime: new Date().toISOString()
    });

    // Save updated subscriptions
    saveSubscriptions(filteredSubscriptions);

    console.log('✅ New push subscription registered:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      userAgent: subscription.userAgent?.substring(0, 100) + '...'
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Subscription saved successfully',
      total: filteredSubscriptions.length
    });

  } catch (error) {
    console.error('❌ Error handling push subscription:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 