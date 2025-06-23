import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // SECURITY: Only available in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }

  if (req.method === 'POST') {
    // Create a test booking record in the main bookings table
    try {
      const testPaymentIntentId = `pi_test_${Date.now()}`;
      const testConfirmationNumber = `SURF-TEST-${Date.now().toString().slice(-6)}`;
      const testDate = new Date().toISOString().split('T')[0];
      const testStartTime = `${testDate}T10:00:00-07:00`;
      const testEndTime = `${testDate}T11:30:00-07:00`;
      
      // Create a test booking record in the main bookings table
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          payment_intent_id: testPaymentIntentId,
          confirmation_number: testConfirmationNumber,
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '+1 (555) 123-4567',
          beach: 'Test Beach',
          lesson_date: testDate,
          lesson_time: '10:00 AM - 11:30 AM',
          start_time: testStartTime,
          end_time: testEndTime,
          price: 120.00,
          lessons_booked: 1,
          is_private: false,
          status: 'confirmed'
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        testData: {
          bookingId: data.id,
          paymentIntentId: testPaymentIntentId,
          confirmationNumber: testConfirmationNumber
        },
        testUrls: {
          secure: `/confirmation?booking_id=${data.id}`,
          fallback: `/confirmation?payment_intent=${testPaymentIntentId}`
        }
      });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  if (req.method === 'GET') {
    // List recent test booking records
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, confirmation_number, payment_intent_id, customer_name, beach, lesson_date, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        recentBookings: data
      });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
} 