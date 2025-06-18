import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await handleSetPin(req, res);
      case 'PUT':
        return await handleVerifyPin(req, res);
      case 'GET':
        return await handleGetPinConfig(req, res);
      case 'DELETE':
        return await handleDeactivatePin(req, res);
      default:
        res.setHeader('Allow', ['POST', 'PUT', 'GET', 'DELETE']);
        return res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    console.error('PIN management API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Set/Update PIN
async function handleSetPin(req: NextApiRequest, res: NextApiResponse) {
  const { pin, adminKey } = req.body;

  // Simple admin verification using the same password as admin portal
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD || 'ZeksSurf2024!Admin#Debug';
  if (adminKey !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (!pin || pin.length < 4 || pin.length > 6) {
    return res.status(400).json({ 
      success: false, 
      error: 'PIN must be 4-6 digits' 
    });
  }

  try {
    // Deactivate any existing PINs
    await supabase
      .from('staff_pins')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('is_active', true);

    // Create new PIN
    const { error } = await supabase
      .from('staff_pins')
      .insert({
        pin: pin,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error setting PIN:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to set PIN' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'PIN updated successfully' 
    });
  } catch (error) {
    console.error('Error in setPin:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Verify PIN
async function handleVerifyPin(req: NextApiRequest, res: NextApiResponse) {
  const { pin } = req.body;

  if (!pin) {
    return res.status(400).json({ 
      success: false, 
      error: 'PIN is required' 
    });
  }

  try {
    // Get active PIN
    const { data, error } = await supabase
      .from('staff_pins')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(200).json({ 
        success: false, 
        valid: false,
        error: 'No active PIN found' 
      });
    }

    const isValid = data.pin === pin;

    if (isValid) {
      // Update last used timestamp
      await supabase
        .from('staff_pins')
        .update({ 
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
    }

    return res.status(200).json({ 
      success: true, 
      valid: isValid 
    });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Get PIN configuration
async function handleGetPinConfig(req: NextApiRequest, res: NextApiResponse) {
  const { adminKey } = req.query;

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD || 'ZeksSurf2024!Admin#Debug';
  if (adminKey !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_pins')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(200).json({ 
        success: true, 
        pinConfig: null 
      });
    }

    // Don't send the actual PIN back
    const pinConfig = {
      id: data.id,
      createdAt: data.created_at,
      lastUsed: data.last_used,
      isActive: data.is_active,
      hasPin: true
    };

    return res.status(200).json({ 
      success: true, 
      pinConfig 
    });
  } catch (error) {
    console.error('Error getting PIN config:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Deactivate PIN
async function handleDeactivatePin(req: NextApiRequest, res: NextApiResponse) {
  const { adminKey } = req.body;

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD || 'ZeksSurf2024!Admin#Debug';
  if (adminKey !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { error } = await supabase
      .from('staff_pins')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true);

    if (error) {
      console.error('Error deactivating PIN:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to deactivate PIN' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'PIN deactivated successfully' 
    });
  } catch (error) {
    console.error('Error in deactivatePin:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 