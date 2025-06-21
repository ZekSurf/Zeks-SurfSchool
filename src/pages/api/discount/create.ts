import { NextApiRequest, NextApiResponse } from 'next';
import { discountService } from '@/lib/discountService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      code, 
      discountType, 
      discountAmount, 
      description, 
      minOrderAmount, 
      maxUses, 
      expiresAt 
    } = req.body;

    // Basic validation
    if (!code || !discountType || !discountAmount) {
      return res.status(400).json({ 
        error: 'Code, discount type, and discount amount are required' 
      });
    }

    if (discountType !== 'percentage' && discountType !== 'fixed') {
      return res.status(400).json({ 
        error: 'Discount type must be either "percentage" or "fixed"' 
      });
    }

    if (typeof discountAmount !== 'number' || discountAmount <= 0) {
      return res.status(400).json({ 
        error: 'Discount amount must be a positive number' 
      });
    }

    if (discountType === 'percentage' && discountAmount > 100) {
      return res.status(400).json({ 
        error: 'Percentage discount cannot exceed 100%' 
      });
    }

    const result = await discountService.createDiscountCode({
      code,
      discountType,
      discountAmount,
      description,
      minOrderAmount,
      maxUses,
      expiresAt
    });

    if (result.success) {
      return res.status(201).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error creating discount code:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 