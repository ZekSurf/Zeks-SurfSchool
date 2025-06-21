import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { supabaseStaffService } from '../../../lib/supabaseStaffService';

// SECURITY: Use server-side only environment variable
const ADMIN_PASSWORD = process.env.ADMIN_DEBUG_PASSWORD || 'CHANGE_THIS_PASSWORD_IN_PRODUCTION';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  try {
    switch (req.method) {
      case 'POST':
        return await createStaff(req, res);
      case 'PUT':
        return await updateStaff(req, res);
      case 'DELETE':
        return await deleteStaff(req, res);
      case 'GET':
        if (req.query.action === 'verify') {
          return await verifyPin(req, res);
        } else if (req.query.action === 'getAll') {
          return await getAllStaff(req, res);
        } else {
          return await getStaffPinConfig(req, res);
        }
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
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

async function createStaff(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { pin, staffName, role, phone, email, notes, adminKey } = req.body;

    // SECURITY: Validate admin key
    if (adminKey !== ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Invalid admin key' 
      });
    }

    // Validate required fields
    if (!pin || !staffName || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: pin, staffName, role'
      });
    }

    // Validate PIN format (4-6 digits)
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be 4-6 digits'
      });
    }

    // Validate role
    if (!['surf_instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be surf_instructor or admin'
      });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate phone format if provided
    if (phone && !/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone format. Use: XXX-XXX-XXXX'
      });
    }

    const staffData = {
      pin: pin.toString(),
      staff_name: staffName,
      role: role as 'surf_instructor' | 'admin',
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      is_active: true
    };

    // Create staff directly in database
    const { data: newStaff, error: insertError } = await supabase
      .from('staff_pins')
      .insert(staffData)
      .select()
      .single();

    const result = {
      success: !insertError,
      staff: newStaff,
      staffId: newStaff?.id,
      error: insertError?.message
    };

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        staff: result.staff
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create staff member'
      });
    }

  } catch (error) {
    console.error('Error creating staff:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating staff'
    });
  }
}

async function updateStaff(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { staffId, updates, adminKey } = req.body;

    // SECURITY: Validate admin key
    if (adminKey !== ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Invalid admin key' 
      });
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

    // Validate PIN if being updated
    if (updates.pin && !/^\d{4,6}$/.test(updates.pin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be 4-6 digits'
      });
    }

    // Validate role if being updated
    if (updates.role && !['surf_instructor', 'admin'].includes(updates.role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be surf_instructor or admin'
      });
    }

    // Validate email format if being updated
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate phone format if being updated
    if (updates.phone && !/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(updates.phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone format. Use: XXX-XXX-XXXX'
      });
    }

    // Map updates to database field names
    const dbUpdates: any = {};
    if (updates.pin) dbUpdates.pin = updates.pin.toString();
    if (updates.staffName) dbUpdates.staff_name = updates.staffName;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null;
    if (updates.email !== undefined) dbUpdates.email = updates.email || null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    // Update staff directly in database
    const { data: updatedStaff, error: updateError } = await supabase
      .from('staff_pins')
      .update(dbUpdates)
      .eq('id', staffId)
      .select()
      .single();

    const result = {
      success: !updateError,
      staff: updatedStaff,
      error: updateError?.message
    };

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Staff member updated successfully',
        staff: result.staff
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update staff member'
      });
    }

  } catch (error) {
    console.error('Error updating staff:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while updating staff'
    });
  }
}

async function verifyPin(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { pin } = req.query;

    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'PIN is required'
      });
    }

    // Validate PIN format
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid PIN format'
      });
    }

    // Verify PIN directly against database
    const { data: staffData, error: fetchError } = await supabase
      .from('staff_pins')
      .select('*')
      .eq('pin', pin)
      .eq('is_active', true)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error verifying PIN:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Database error while verifying PIN'
      });
    }

    const isValid = !!staffData;

    // Update last_used_at if PIN is valid
    if (isValid) {
      await supabase
        .from('staff_pins')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', staffData.id);
    }

    return res.status(200).json({
      success: true,
      isValid: isValid,
      staff: null, // Staff data not returned by this method
      message: isValid ? 'PIN verified successfully' : 'Invalid PIN'
    });

  } catch (error) {
    console.error('Error verifying PIN:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while verifying PIN'
    });
  }
}

async function getAllStaff(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { adminKey } = req.query;

    // SECURITY: Validate admin key
    if (adminKey !== ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Invalid admin key' 
      });
    }

    // Get all staff directly from database
    const { data: allStaff, error: fetchError } = await supabase
      .from('staff_pins')
      .select('*')
      .order('created_at', { ascending: false });

    const result = {
      success: !fetchError,
      staff: allStaff?.map(staff => ({
        ...staff,
        pin: '****' // Don't expose actual PINs
      })) || [],
      error: fetchError?.message
    };

    if (result.success) {
      return res.status(200).json({
        success: true,
        staff: result.staff
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to get staff members'
      });
    }

  } catch (error) {
    console.error('Error getting staff:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while getting staff'
    });
  }
}

async function deleteStaff(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { staffId, adminKey } = req.body;

    // SECURITY: Validate admin key
    if (adminKey !== ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized: Invalid admin key' 
      });
    }

    if (!staffId) {
      return res.status(400).json({
        success: false,
        error: 'Staff ID is required'
      });
    }

    // Delete staff directly from database
    const { error: deleteError } = await supabase
      .from('staff_pins')
      .delete()
      .eq('id', staffId);

    const result = {
      success: !deleteError,
      error: deleteError?.message
    };

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Staff member deleted successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to delete staff member'
      });
    }

  } catch (error) {
    console.error('Error deleting staff:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while deleting staff'
    });
  }
}

async function getStaffPinConfig(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get staff config directly from database
    const { data: staffData, error: fetchError } = await supabase
      .from('staff_pins')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return res.status(400).json({
        success: false,
        error: fetchError.message
      });
    }

    const config = staffData ? {
      pin: '', // Don't expose actual PIN
      createdAt: staffData.created_at,
      lastUsed: staffData.last_used_at,
      isActive: staffData.is_active
    } : null;

    return res.status(200).json({
      success: true,
      config: config
    });

  } catch (error) {
    console.error('Error getting staff PIN config:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while getting PIN config'
    });
  }
} 