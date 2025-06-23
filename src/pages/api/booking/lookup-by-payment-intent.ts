import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

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
    // Look up the booking UUID by payment intent ID
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('payment_intent_id', payment_intent)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ 
        error: 'Booking not found',
        success: false 
      });
    }

    if (!data) {
      return res.status(404).json({ 
        error: 'Booking not found',
        success: false 
      });
    }

    return res.status(200).json({
      success: true,
      booking_id: data.id
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