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
    const { pin } = req.body;
    
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'PIN is required'
      });
    }

    // Verify PIN using the server-side supabaseStaffService
    const isValidPin = await supabaseStaffService.verifyStaffPin(pin);
    
    return res.status(200).json({
      success: true,
      isValid: isValidPin
    });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 