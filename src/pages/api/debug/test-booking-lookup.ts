import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }

  const testPaymentIntent = 'pi_3ReQ1nQXhbvIDZu1aBj3he0';

  try {
    console.log('🧪 Testing booking lookup for payment intent:', testPaymentIntent);

    // Check if there are any bookings at all
    const { data: allBookings, error: allError } = await getSupabaseAdmin()
      .from('bookings')
      .select('id, payment_intent_id, confirmation_number, customer_name, beach, lesson_date, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('📊 Recent bookings in database:', allBookings?.map((b: any) => ({
      id: b.id.slice(0, 8),
      payment_intent: b.payment_intent_id?.slice(-8),
      confirmation: b.confirmation_number,
      customer: b.customer_name,
      beach: b.beach,
      date: b.lesson_date,
      created: b.created_at
    })));

    // Try to find bookings for the specific payment intent
    const { data: specificBookings, error: specificError } = await getSupabaseAdmin()
      .from('bookings')
      .select('*')
      .eq('payment_intent_id', testPaymentIntent)
      .order('created_at', { ascending: true });

    console.log('🔍 Bookings for specific payment intent:', specificBookings);

    return res.status(200).json({
      success: true,
      testPaymentIntent,
      allBookingsCount: allBookings?.length || 0,
      specificBookingsCount: specificBookings?.length || 0,
      recentBookings: allBookings?.slice(0, 5),
      specificBookings: specificBookings,
      allError: allError?.message,
      specificError: specificError?.message
    });

  } catch (error) {
    console.error('🚨 Error in debug lookup:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 