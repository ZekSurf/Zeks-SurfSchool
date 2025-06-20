import { NextApiRequest, NextApiResponse } from 'next';

// This endpoint serves as a bridge for manually adding bookings to the staff system
// In a production environment, you might want to store bookings in a database instead
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, this endpoint just returns success
    // The actual booking storage happens client-side in localStorage
    // This could be extended to use a database in the future
    
    const { bookingData } = req.body;
    
    if (!bookingData) {
      return res.status(400).json({ error: 'Booking data is required' });
    }

    // Log the booking data for debugging
    // SECURITY: Removed booking data logging - contains customer PII
    
    // In a real implementation, you would:
    // 1. Validate the booking data
    // 2. Store it in a database
    // 3. Return the stored booking with an ID
    
    res.status(200).json({ 
      success: true, 
      message: 'Booking data received',
      note: 'Client-side sync required for localStorage-based staff portal'
    });
    
  } catch (error) {
    console.error('Error syncing booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 