import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { booking_id } = req.query;

  if (!booking_id || typeof booking_id !== 'string') {
    return res.status(400).json({ error: 'booking_id is required and must be a string' });
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .maybeSingle();

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