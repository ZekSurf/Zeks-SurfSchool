import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // SECURITY: Only available in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }

  const currentBookingId = '2bf21131-e74f-4d47-b3d0-728f3b57e2e6';
  const originalBookingId = '1fc9fb98-ea03-4967-b86e-b9c26666e4fb';

  try {
    // Test both booking IDs
    console.log('🔍 Testing both booking IDs');

    // Test current booking
    const { data: currentData, error: currentError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', currentBookingId)
      .maybeSingle();

    // Test original booking
    const { data: originalData, error: originalError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', originalBookingId)
      .maybeSingle();

    // Get all recent bookings
    const { data: allBookings, error: allError } = await supabase
      .from('bookings')
      .select('id, confirmation_number, customer_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    return res.status(200).json({
      tests: {
        currentBooking: {
          id: currentBookingId,
          found: !!currentData,
          error: currentError?.message,
          data: currentData ? {
            id: currentData.id,
            confirmation: currentData.confirmation_number,
            customer: currentData.customer_name,
            email: currentData.customer_email
          } : null
        },
        originalBooking: {
          id: originalBookingId,
          found: !!originalData,
          error: originalError?.message,
          data: originalData ? {
            id: originalData.id,
            confirmation: originalData.confirmation_number,
            customer: originalData.customer_name,
            email: originalData.customer_email
          } : null
        },
        allRecentBookings: {
          success: !allError,
          count: allBookings?.length || 0,
          error: allError?.message,
          bookings: allBookings?.map(b => ({
            id: b.id,
            confirmation: b.confirmation_number,
            customer: b.customer_name,
            created: b.created_at
          }))
        }
      },
      apiTest: {
        // Test the same API call the frontend would make
        currentBookingApiUrl: `/api/booking/get-by-id?booking_id=${currentBookingId}`,
        originalBookingApiUrl: `/api/booking/get-by-id?booking_id=${originalBookingId}`
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 