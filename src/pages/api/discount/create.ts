import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

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

    // Validate required fields
    if (!code || !discountType || discountAmount === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code, discount type, and amount are required' 
      });
    }

    // Get admin client
    const supabaseAdmin = getSupabaseAdmin();

    // Create the discount code using admin client
    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .insert({
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_amount: parseFloat(discountAmount),
        description: description || null,
        min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
        is_active: true,
        current_uses: 0
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error creating discount code:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 