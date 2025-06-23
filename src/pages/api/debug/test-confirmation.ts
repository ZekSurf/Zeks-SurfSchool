import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // SECURITY: Only available in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }

  if (req.method === 'POST') {
    // Create a test booking record
    try {
      const testPaymentIntentId = `pi_test_${Date.now()}`;
      const testConfirmationNumber = `SURF-TEST-${Date.now().toString().slice(-6)}`;
      
      // Create a test temp booking record
      const { data, error } = await supabase
        .from('temp_bookings')
        .insert({
          items: [{ beach: 'Test Beach', price: 120 }],
          customer_info: { firstName: 'Test', lastName: 'User' },
          contact_info: {},
          confirmation_number: testConfirmationNumber,
          payment_intent_id: testPaymentIntentId,
          booking_status: 'completed'
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        testData: {
          paymentIntentId: testPaymentIntentId,
          confirmationNumber: testConfirmationNumber,
          recordId: data.id
        },
        testUrl: `/confirmation?payment_intent=${testPaymentIntentId}`
      });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  if (req.method === 'GET') {
    // List recent test records
    try {
      const { data, error } = await supabase
        .from('temp_bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        recentRecords: data
      });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
} 