import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseStaffService } from '@/lib/supabaseStaffService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingId, status } = req.body;
    
    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    if (!status || !['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (confirmed, completed, cancelled)'
      });
    }

    // Update booking status using the server-side supabaseStaffService
    const result = await supabaseStaffService.updateBookingStatus(bookingId, status);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Booking status updated successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 