import { supabase, DiscountCodeRow } from './supabase';

export interface DiscountValidationResult {
  isValid: boolean;
  discount?: {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    amount: number;
    description?: string;
  };
  error?: string;
}

export interface ApplyDiscountResult {
  success: boolean;
  discountAmount: number;
  finalAmount: number;
  error?: string;
}

class DiscountService {
  /**
   * Validate a discount code
   */
  async validateDiscountCode(code: string, orderAmount: number): Promise<DiscountValidationResult> {
    try {
      if (!code || !code.trim()) {
        return {
          isValid: false,
          error: 'Please enter a discount code'
        };
      }

      // Query the discount code from Supabase
      const { data: discountCode, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !discountCode) {
        return {
          isValid: false,
          error: 'Invalid discount code'
        };
      }

      // Check if code has expired
      if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
        return {
          isValid: false,
          error: 'This discount code has expired'
        };
      }

      // Check if code has reached max uses
      if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
        return {
          isValid: false,
          error: 'This discount code has reached its usage limit'
        };
      }

      // Check minimum order amount
      if (discountCode.min_order_amount && orderAmount < discountCode.min_order_amount) {
        return {
          isValid: false,
          error: `Minimum order amount of $${discountCode.min_order_amount} required for this discount`
        };
      }

      return {
        isValid: true,
        discount: {
          id: discountCode.id,
          code: discountCode.code,
          type: discountCode.discount_type as 'percentage' | 'fixed',
          amount: discountCode.discount_amount,
          description: discountCode.description
        }
      };

    } catch (error) {
      console.error('Error validating discount code:', error);
      return {
        isValid: false,
        error: 'Unable to validate discount code. Please try again.'
      };
    }
  }

  /**
   * Apply discount and calculate final amount
   */
  async applyDiscount(discountId: string, orderAmount: number): Promise<ApplyDiscountResult> {
    try {
      // Get the discount code details
      const { data: discountCode, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('id', discountId)
        .single();

      if (error || !discountCode) {
        return {
          success: false,
          discountAmount: 0,
          finalAmount: orderAmount,
          error: 'Discount code not found'
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (discountCode.discount_type === 'percentage') {
        discountAmount = (orderAmount * discountCode.discount_amount) / 100;
      } else {
        discountAmount = discountCode.discount_amount;
      }

      // Ensure discount doesn't exceed order amount
      discountAmount = Math.min(discountAmount, orderAmount);
      const finalAmount = Math.max(0, orderAmount - discountAmount);

      // Increment usage count
      const { error: updateError } = await supabase
        .from('discount_codes')
        .update({ 
          current_uses: discountCode.current_uses + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', discountId);

      if (updateError) {
        console.error('Error updating discount usage:', updateError);
        // Continue anyway - don't fail the discount application
      }

      return {
        success: true,
        discountAmount,
        finalAmount
      };

    } catch (error) {
      console.error('Error applying discount:', error);
      return {
        success: false,
        discountAmount: 0,
        finalAmount: orderAmount,
        error: 'Unable to apply discount. Please try again.'
      };
    }
  }

  /**
   * Create a new discount code (for admin use)
   */
  async createDiscountCode(discountData: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountAmount: number;
    description?: string;
    minOrderAmount?: number;
    maxUses?: number;
    expiresAt?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .insert({
          code: discountData.code.toUpperCase(),
          discount_type: discountData.discountType,
          discount_amount: discountData.discountAmount,
          description: discountData.description,
          min_order_amount: discountData.minOrderAmount || 0,
          max_uses: discountData.maxUses,
          expires_at: discountData.expiresAt
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating discount code:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create discount code' 
      };
    }
  }
}

export const discountService = new DiscountService(); 