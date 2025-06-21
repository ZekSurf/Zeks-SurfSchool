import { NextApiRequest, NextApiResponse } from 'next';
import { discountService } from '@/lib/discountService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, orderAmount } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Discount code is required' });
    }

    if (!orderAmount || typeof orderAmount !== 'number') {
      return res.status(400).json({ error: 'Order amount is required' });
    }

    const result = await discountService.validateDiscountCode(code, orderAmount);

    if (result.isValid) {
      return res.status(200).json({
        success: true,
        discount: result.discount
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error validating discount code:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 