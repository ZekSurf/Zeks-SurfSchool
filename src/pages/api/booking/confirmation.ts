import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { payment_intent } = req.query;

  if (!payment_intent || typeof payment_intent !== 'string') {
    return res.status(400).json({ error: 'Payment intent ID is required' });
  }

  try {
    // Retrieve confirmation number from temp_bookings table
    const { data, error } = await supabase
      .from('temp_bookings')
      .select('*')
      .eq('payment_intent_id', payment_intent)
      .single();

    if (error || !data) {
      console.error('Error fetching confirmation number:', error);
      return res.status(404).json({ error: 'Confirmation number not found' });
    }

    // Extract confirmation number from the stored data
    const confirmationNumber = data.confirmation_number;
    
    if (!confirmationNumber) {
      return res.status(404).json({ error: 'Confirmation number not found' });
    }

    return res.status(200).json({ 
      confirmationNumber: confirmationNumber 
    });
  } catch (error) {
    console.error('Exception fetching confirmation number:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 