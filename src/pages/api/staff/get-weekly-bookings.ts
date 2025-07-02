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
    const { startDate } = req.query;
    
    if (!startDate || typeof startDate !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Start date is required',
        bookings: []
      });
    }

    // Parse the start date
    const startDateObj = new Date(startDate);
    
    if (isNaN(startDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid start date format',
        bookings: []
      });
    }

    // Fetch weekly bookings using the server-side supabaseStaffService
    const result = await supabaseStaffService.getBookingsForWeek(startDateObj);
    
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
    console.error('Error fetching weekly bookings:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      bookings: []
    });
  }
} 