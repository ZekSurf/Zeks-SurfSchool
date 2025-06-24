import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Discount code ID is required' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    if (req.method === 'DELETE') {
      // Delete discount code using admin client
      const { error } = await supabaseAdmin
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting discount code:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to delete discount code' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Discount code deleted successfully' 
      });
    }

    if (req.method === 'PUT') {
      const updateData = req.body;
      
      // Remove any fields that shouldn't be updated
      const allowedFields = [
        'code', 'discount_type', 'discount_amount', 'description', 
        'min_order_amount', 'max_uses', 'is_active', 'expires_at'
      ];
      
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {} as any);

      // Add updated_at timestamp
      filteredData.updated_at = new Date().toISOString();

      // Update discount code using admin client
      const { data, error } = await supabaseAdmin
        .from('discount_codes')
        .update(filteredData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating discount code:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update discount code' 
        });
      }

      return res.status(200).json({
        success: true,
        data: data,
        message: 'Discount code updated successfully'
      });
    }

  } catch (error) {
    console.error('Error in discount manage API:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 