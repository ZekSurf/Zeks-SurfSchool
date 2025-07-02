import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseStaffService } from '@/lib/supabaseStaffService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all bookings using the server-side supabaseStaffService
    const result = await supabaseStaffService.getAllBookings();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        bookings: result.bookings,
        count: result.bookings.length
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        bookings: []
      });
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      bookings: []
    });
  }
} 