import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const { payment_intent } = req.query;

  if (!payment_intent || typeof payment_intent !== 'string') {
    return res.status(400).json({ 
      error: 'payment_intent is required and must be a string',
      success: false 
    });
  }

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Looking up booking for payment intent: ${payment_intent}`);
    }

    // Look up the booking UUIDs by payment intent ID (there may be multiple)
    const { data, error } = await getSupabaseAdmin()
      .from('bookings')
      .select('id, confirmation_number, created_at')
      .eq('payment_intent_id', payment_intent)
      .order('created_at', { ascending: true }); // Get oldest first

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Supabase lookup error:', error);
        
        // Also check if there are any bookings at all for debugging
        const { data: allBookings } = await getSupabaseAdmin()
          .from('bookings')
          .select('id, payment_intent_id, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        console.log('📊 Recent bookings in database:', allBookings?.map((b: any) => ({
          id: b.id.slice(0, 8),
          payment_intent: b.payment_intent_id?.slice(-8),
          created: b.created_at
        })));
      }
      
      return res.status(404).json({ 
        error: 'Booking not found',
        success: false,
        debug: process.env.NODE_ENV !== 'production' ? {
          searchedPaymentIntent: payment_intent.slice(-8),
          supabaseError: error.message
        } : undefined
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ 
        error: 'Booking not found',
        success: false 
      });
    }

    // For multiple bookings, they all share the same confirmation number
    // Return the first booking ID and info about all bookings
    const firstBooking = data[0];
    const allBookingIds = data.map((booking: any) => booking.id);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Found ${data.length} booking(s): ${allBookingIds.map((id: string) => id.slice(0, 8)).join(', ')} (${firstBooking.confirmation_number})`);
    }

    return res.status(200).json({
      success: true,
      booking_id: firstBooking.id, // Primary booking ID for backward compatibility
      booking_ids: allBookingIds, // All booking IDs for this payment intent
      confirmation_number: firstBooking.confirmation_number,
      total_bookings: data.length
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ 
      error: errorMessage,
      success: false 
    });
  }
} 