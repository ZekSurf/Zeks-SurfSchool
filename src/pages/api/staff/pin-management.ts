import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await handleCreateStaff(req, res);
      case 'PATCH':
        return await handleUpdateStaff(req, res);
      case 'PUT':
        return await handleVerifyPin(req, res);
      case 'GET':
        return await handleGetAllStaff(req, res);
      case 'DELETE':
        return await handleDeleteStaff(req, res);
      default:
        res.setHeader('Allow', ['POST', 'PATCH', 'PUT', 'GET', 'DELETE']);
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

// Create new staff member
async function handleCreateStaff(req: NextApiRequest, res: NextApiResponse) {
  const { pin, staffName, role, phone, email, notes, adminKey } = req.body;

  // Admin verification
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD || 'ZeksSurf2024!Admin#Debug';
  if (adminKey !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  // Validation
  if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    return res.status(400).json({ 
      success: false, 
      error: 'PIN must be 4-6 numeric digits' 
    });
  }

  if (!staffName || staffName.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Staff name is required' 
    });
  }

  if (!role || !['surf_instructor', 'admin'].includes(role)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Role must be surf_instructor or admin' 
    });
  }

  try {
    // Check for duplicate PIN
    const { data: existingPin } = await supabase
      .from('staff_pins')
      .select('id')
      .eq('pin', pin)
      .eq('is_active', true)
      .single();

    if (existingPin) {
      return res.status(400).json({ 
        success: false, 
        error: 'PIN already exists. Please choose a different PIN.' 
      });
    }

    // Create new staff member
    const { data, error } = await supabase
      .from('staff_pins')
      .insert({
        pin: pin,
        staff_name: staffName.trim(),
        role: role,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        notes: notes?.trim() || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating staff:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create staff member' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Staff member created successfully',
      staffId: data.id
    });
  } catch (error) {
    console.error('Error in createStaff:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Update existing staff member
async function handleUpdateStaff(req: NextApiRequest, res: NextApiResponse) {
  const { staffId, updates, adminKey } = req.body;

  // Admin verification
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD || 'ZeksSurf2024!Admin#Debug';
  if (adminKey !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (!staffId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Staff ID is required' 
    });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'No updates provided' 
    });
  }

  try {
    // Validate updates
    const validUpdates: any = {};

    if (updates.pin !== undefined) {
      if (!updates.pin || updates.pin.length < 4 || updates.pin.length > 6 || !/^\d+$/.test(updates.pin)) {
        return res.status(400).json({ 
          success: false, 
          error: 'PIN must be 4-6 numeric digits' 
        });
      }

      // Check for duplicate PIN (excluding current staff)
      const { data: existingPin } = await supabase
        .from('staff_pins')
        .select('id')
        .eq('pin', updates.pin)
        .eq('is_active', true)
        .neq('id', staffId)
        .single();

      if (existingPin) {
        return res.status(400).json({ 
          success: false, 
          error: 'PIN already exists. Please choose a different PIN.' 
        });
      }

      validUpdates.pin = updates.pin;
    }

    if (updates.staffName !== undefined) {
      if (!updates.staffName || updates.staffName.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Staff name cannot be empty' 
        });
      }
      validUpdates.staff_name = updates.staffName.trim();
    }

    if (updates.role !== undefined) {
      if (!['surf_instructor', 'admin'].includes(updates.role)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Role must be surf_instructor or admin' 
        });
      }
      validUpdates.role = updates.role;
    }

    if (updates.phone !== undefined) {
      validUpdates.phone = updates.phone?.trim() || null;
    }

    if (updates.email !== undefined) {
      validUpdates.email = updates.email?.trim() || null;
    }

    if (updates.notes !== undefined) {
      validUpdates.notes = updates.notes?.trim() || null;
    }

    if (updates.isActive !== undefined) {
      validUpdates.is_active = updates.isActive;
    }

    validUpdates.updated_at = new Date().toISOString();

    // Update staff member
    const { error } = await supabase
      .from('staff_pins')
      .update(validUpdates)
      .eq('id', staffId);

    if (error) {
      console.error('Error updating staff:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update staff member' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Staff member updated successfully' 
    });
  } catch (error) {
    console.error('Error in updateStaff:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Verify PIN (unchanged logic for staff portal login)
async function handleVerifyPin(req: NextApiRequest, res: NextApiResponse) {
  const { pin } = req.body;

  if (!pin) {
    return res.status(400).json({ 
      success: false, 
      error: 'PIN is required' 
    });
  }

  try {
    // Get staff member with matching PIN
    const { data, error } = await supabase
      .from('staff_pins')
      .select('*')
      .eq('pin', pin)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(200).json({ 
        success: false, 
        valid: false,
        error: 'Invalid PIN' 
      });
    }

    // Update last used timestamp
    await supabase
      .from('staff_pins')
      .update({ 
        last_used: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);

    return res.status(200).json({ 
      success: true, 
      valid: true,
      staff: {
        id: data.id,
        name: data.staff_name,
        role: data.role
      }
    });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Get all staff members
async function handleGetAllStaff(req: NextApiRequest, res: NextApiResponse) {
  const { adminKey } = req.query;

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD || 'ZeksSurf2024!Admin#Debug';
  if (adminKey !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('staff_pins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting staff:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch staff' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      staff: data || []
    });
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Delete staff member
async function handleDeleteStaff(req: NextApiRequest, res: NextApiResponse) {
  const { staffId, adminKey } = req.body;

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD || 'ZeksSurf2024!Admin#Debug';
  if (adminKey !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (!staffId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Staff ID is required' 
    });
  }

  try {
    const { error } = await supabase
      .from('staff_pins')
      .delete()
      .eq('id', staffId);

    if (error) {
      console.error('Error deleting staff:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete staff member' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Staff member deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteStaff:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 