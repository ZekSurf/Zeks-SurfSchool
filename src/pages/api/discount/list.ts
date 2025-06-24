import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin, DiscountCodeRow } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use admin client to get all discount codes (including inactive ones)
    const supabaseAdmin = getSupabaseAdmin();
    const { data: discountCodes, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching discount codes:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch discount codes' 
      });
    }

    // Type the discountCodes array properly to avoid TypeScript errors
    const typedDiscountCodes: DiscountCodeRow[] = discountCodes || [];

    // Calculate statistics
    const stats = {
      total: typedDiscountCodes.length,
      active: typedDiscountCodes.filter((code: DiscountCodeRow) => code.is_active).length,
      expired: typedDiscountCodes.filter((code: DiscountCodeRow) => 
        code.expires_at && new Date(code.expires_at) < new Date()
      ).length,
      reachedLimit: typedDiscountCodes.filter((code: DiscountCodeRow) => 
        code.max_uses && code.current_uses >= code.max_uses
      ).length,
      totalUses: typedDiscountCodes.reduce((sum: number, code: DiscountCodeRow) => sum + code.current_uses, 0)
    };

    return res.status(200).json({
      success: true,
      data: typedDiscountCodes,
      stats
    });

  } catch (error) {
    console.error('Error in discount list API:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 