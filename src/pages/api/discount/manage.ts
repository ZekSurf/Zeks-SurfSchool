import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Discount code ID is required' });
  }

  try {
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

    } else {
      // Update discount code using admin client
      const { 
        code, 
        discountType, 
        discountAmount, 
        description, 
        minOrderAmount, 
        maxUses, 
        isActive,
        expiresAt 
      } = req.body;

      // Basic validation
      if (code && typeof code !== 'string') {
        return res.status(400).json({ error: 'Code must be a string' });
      }

      if (discountType && discountType !== 'percentage' && discountType !== 'fixed') {
        return res.status(400).json({ 
          error: 'Discount type must be either "percentage" or "fixed"' 
        });
      }

      if (discountAmount && (typeof discountAmount !== 'number' || discountAmount <= 0)) {
        return res.status(400).json({ 
          error: 'Discount amount must be a positive number' 
        });
      }

      if (discountType === 'percentage' && discountAmount && discountAmount > 100) {
        return res.status(400).json({ 
          error: 'Percentage discount cannot exceed 100%' 
        });
      }

      // Build update object with only provided fields
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (code !== undefined) updateData.code = code.toUpperCase();
      if (discountType !== undefined) updateData.discount_type = discountType;
      if (discountAmount !== undefined) updateData.discount_amount = discountAmount;
      if (description !== undefined) updateData.description = description;
      if (minOrderAmount !== undefined) updateData.min_order_amount = minOrderAmount;
      if (maxUses !== undefined) updateData.max_uses = maxUses;
      if (isActive !== undefined) updateData.is_active = isActive;
      if (expiresAt !== undefined) updateData.expires_at = expiresAt;

      const { data, error } = await supabaseAdmin
        .from('discount_codes')
        .update(updateData)
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