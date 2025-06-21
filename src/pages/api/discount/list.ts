import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: discountCodes, error } = await supabase
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

    // Calculate statistics
    const stats = {
      total: discountCodes.length,
      active: discountCodes.filter(code => code.is_active).length,
      inactive: discountCodes.filter(code => !code.is_active).length,
      expired: discountCodes.filter(code => 
        code.expires_at && new Date(code.expires_at) < new Date()
      ).length,
      unlimited: discountCodes.filter(code => !code.max_uses).length,
      totalUsage: discountCodes.reduce((sum, code) => sum + (code.current_uses || 0), 0)
    };

    return res.status(200).json({
      success: true,
      data: discountCodes,
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