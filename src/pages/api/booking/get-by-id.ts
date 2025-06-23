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
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Searching for booking ID: ${booking_id}`);
      console.log(`🔗 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET'}`);
      console.log(`🔑 Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET'}`);
    }

    // First, let's test basic connectivity by counting all bookings
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 Total bookings in database: ${count}, Count error: ${countError?.message}`);
    }

    // Now try the specific query
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors for no results

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 Query result - Data:`, !!data, 'Error:', !!error);
      if (error) {
        console.log(`❌ Supabase error:`, error);
      }
      if (data) {
        console.log(`✅ Found booking:`, {
          id: data.id,
          confirmation: data.confirmation_number,
          customer: data.customer_name
        });
      }
    }

    if (error || !data) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Booking not found, checking recent bookings...');
        
        // Debug: Check what bookings exist
        const { data: allBookings } = await supabase
          .from('bookings')
          .select('id, confirmation_number, customer_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        console.log('📊 Recent bookings:', allBookings?.map(b => ({
          id: b.id,
          confirmation: b.confirmation_number,
          customer: b.customer_name,
          created: b.created_at
        })));
      }
      
      return res.status(404).json({ 
        error: 'Booking not found',
        debug: process.env.NODE_ENV !== 'production' ? {
          searchedId: booking_id,
          supabaseError: error?.message
        } : undefined
      });
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