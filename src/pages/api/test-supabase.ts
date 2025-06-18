import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseStaffService } from '@/lib/supabaseStaffService';
import { CompletedBooking } from '@/types/booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Test Supabase connection by fetching bookings
    try {
      const result = await supabaseStaffService.getAllBookings();
      
      return res.status(200).json({
        success: true,
        message: 'Supabase connection working',
        bookingCount: result.bookings.length,
        bookings: result.bookings,
        error: result.error || null
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  if (req.method === 'POST') {
    // Test saving a booking to Supabase
    try {
      const testBooking: CompletedBooking = {
        id: `test-${Date.now()}`,
        confirmationNumber: `TEST-${Date.now().toString().slice(-6)}`,
        paymentIntentId: `pi_test_${Math.random().toString(36).substr(2, 9)}`,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+1 (555) 999-0000',
        beach: 'Doheny',
        date: new Date().toISOString().split('T')[0],
        startTime: `${new Date().toISOString().split('T')[0]}T10:00:00-07:00`,
        endTime: `${new Date().toISOString().split('T')[0]}T11:30:00-07:00`,
        price: 120.00,
        lessonsBooked: 1,
        isPrivate: false,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      };

      const result = await supabaseStaffService.saveCompletedBooking(testBooking);
      
      return res.status(200).json({
        success: result.success,
        message: result.success ? 'Test booking saved to Supabase' : 'Failed to save test booking',
        booking: testBooking,
        error: result.error || null
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error saving test booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method Not Allowed');
} 