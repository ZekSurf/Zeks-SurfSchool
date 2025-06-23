import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { booking_id, payment_intent } = req.query;

  if (!booking_id && !payment_intent) {
    return res.status(400).json({ error: 'Either booking_id or payment_intent is required' });
  }

  try {
    let query = supabase.from('bookings').select('*');
    
    if (booking_id && typeof booking_id === 'string') {
      // Query by booking UUID (primary approach)
      query = query.eq('id', booking_id);
    } else if (payment_intent && typeof payment_intent === 'string') {
      // Fallback: Query by payment intent ID
      query = query.eq('payment_intent_id', payment_intent);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      console.error('Error fetching booking:', error);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Return the booking data
    return res.status(200).json({ 
      success: true,
      booking: {
        id: data.id,
        confirmationNumber: data.confirmation_number,
        paymentIntentId: data.payment_intent_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone || '',
        beach: data.beach,
        date: data.lesson_date,
        startTime: data.start_time,
        endTime: data.end_time,
        price: data.price,
        lessonsBooked: data.lessons_booked,
        isPrivate: data.is_private,
        status: data.status,
        timestamp: data.created_at
      }
    });
  } catch (error) {
    console.error('Exception fetching booking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 