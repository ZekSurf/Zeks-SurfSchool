import { getSupabaseAdmin } from './supabase';
import { WaiverSignature } from '@/types/booking';

export class WaiverService {
  private static readonly WAIVER_VERSION = 'v1.0';

  /**
   * Get client IP address and user agent for audit trail
   */
  static getClientInfo(req: any) {
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               req.ip ||
               'unknown';
    
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return {
      ip_address: Array.isArray(ip) ? ip[0] : ip,
      user_agent: userAgent
    };
  }

  /**
   * Store waiver signature temporarily with payment intent
   * Called during checkout before payment
   */
  static async storeTemporaryWaiverSignature(data: {
    slotId: string;
    paymentIntentId: string;
    signerName: string;
    participantName: string;
    guardianName?: string;
    isMinor: boolean;
    customerEmail: string;
    customerPhone: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalConditions?: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      
      const waiverData: Omit<WaiverSignature, 'id' | 'created_at' | 'updated_at'> = {
        slot_id: data.slotId,
        payment_intent_id: data.paymentIntentId,
        signer_name: data.signerName,
        participant_name: data.participantName,
        guardian_name: data.guardianName,
        is_minor: data.isMinor,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        medical_conditions: data.medicalConditions,
        signed_at: new Date().toISOString(),
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        waiver_version: this.WAIVER_VERSION
      };

      const { error } = await supabaseAdmin
        .from('waiver_signatures')
        .insert(waiverData);

      if (error) {
        console.error('Error storing temporary waiver signature:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in storeTemporaryWaiverSignature:', error);
      return { success: false, error: 'Failed to store waiver signature' };
    }
  }

  /**
   * Update waiver signature with booking confirmation number after successful payment
   * Called from Stripe webhook
   */
  static async finalizeWaiverSignature(
    paymentIntentId: string, 
    bookingId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin();

      const { error } = await supabaseAdmin
        .from('waiver_signatures')
        .update({ 
          booking_id: bookingId,
          updated_at: new Date().toISOString()
        })
        .eq('payment_intent_id', paymentIntentId);

      if (error) {
        console.error('Error finalizing waiver signature:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in finalizeWaiverSignature:', error);
      return { success: false, error: 'Failed to finalize waiver signature' };
    }
  }

  /**
   * Get waiver signature by payment intent ID
   */
  static async getWaiverByPaymentIntent(
    paymentIntentId: string
  ): Promise<{ success: boolean; waiver?: WaiverSignature; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin();

      const { data, error } = await supabaseAdmin
        .from('waiver_signatures')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single();

      if (error) {
        console.error('Error fetching waiver signature:', error);
        return { success: false, error: error.message };
      }

      return { success: true, waiver: data };
    } catch (error) {
      console.error('Error in getWaiverByPaymentIntent:', error);
      return { success: false, error: 'Failed to fetch waiver signature' };
    }
  }

  /**
   * Get waiver signature by booking ID
   */
  static async getWaiverByBookingId(
    bookingId: string
  ): Promise<{ success: boolean; waiver?: WaiverSignature; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin();

      const { data, error } = await supabaseAdmin
        .from('waiver_signatures')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error) {
        console.error('Error fetching waiver signature:', error);
        return { success: false, error: error.message };
      }

      return { success: true, waiver: data };
    } catch (error) {
      console.error('Error in getWaiverByBookingId:', error);
      return { success: false, error: 'Failed to fetch waiver signature' };
    }
  }

  /**
   * Clean up orphaned waiver signatures (payment failed or abandoned)
   * Should be called periodically via cron job
   */
  static async cleanupOrphanedSignatures(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const supabaseAdmin = getSupabaseAdmin();

      // Delete waiver signatures older than 24 hours that don't have a booking_id
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabaseAdmin
        .from('waiver_signatures')
        .delete()
        .is('booking_id', null)
        .lt('created_at', oneDayAgo)
        .select('id');

      if (error) {
        console.error('Error cleaning up orphaned waiver signatures:', error);
        return { success: false, error: error.message };
      }

      return { success: true, deletedCount: data?.length || 0 };
    } catch (error) {
      console.error('Error in cleanupOrphanedSignatures:', error);
      return { success: false, error: 'Failed to cleanup orphaned signatures' };
    }
  }
}

export const waiverService = WaiverService; 