import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { payment_intent } = req.query;

  return res.status(200).json({
    success: true,
    message: 'Redirect test endpoint reached',
    payment_intent: payment_intent,
    timestamp: new Date().toISOString()
  });
} 