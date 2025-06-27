import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { payment_intent } = req.query;

  if (!payment_intent || typeof payment_intent !== 'string') {
    return res.status(400).json({ error: 'payment_intent is required and must be a string' });
  }

  try {
    // Fetch all bookings for this payment intent
    const { data, error } = await getSupabaseAdmin()
      .from('bookings')
      .select('*')
      .eq('payment_intent_id', payment_intent)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      console.error('Error fetching bookings:', error);
      return res.status(404).json({ error: 'Bookings not found' });
    }

    // Convert to frontend format
    const bookings = data.map((row: any) => ({
      id: row.id,
      confirmationNumber: row.confirmation_number,
      paymentIntentId: row.payment_intent_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone || '',
      beach: row.beach,
      date: row.lesson_date,
      startTime: row.start_time,
      endTime: row.end_time,
      price: row.price,
      lessonsBooked: row.lessons_booked,
      isPrivate: row.is_private,
      status: row.status,
      timestamp: row.created_at
    }));

    // Return all booking data
    return res.status(200).json({ 
      success: true,
      bookings: bookings,
      totalBookings: bookings.length,
      confirmationNumber: bookings[0].confirmationNumber, // They all share the same confirmation number
      totalAmount: bookings.reduce((sum: number, booking: any) => sum + booking.price, 0)
    });
  } catch (error) {
    console.error('Exception fetching bookings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 