import { supabase, BookingRow, StaffPinRow, getSupabaseAdmin } from './supabase';
import { CompletedBooking, StaffPinConfig } from '@/types/booking';

class SupabaseStaffService {
  // Convert database row to UI format
  private dbRowToBooking(row: BookingRow): CompletedBooking {
    return {
      id: row.id,
      confirmationNumber: row.confirmation_number,
      paymentIntentId: row.payment_intent_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone || '',
      beach: row.beach,
      date: row.lesson_date,
      startTime: row.start_time,
      endTime: row.end_time,
      price: row.price,
      lessonsBooked: row.lessons_booked,
      isPrivate: row.is_private,
      timestamp: row.created_at,
      status: (row.status as 'confirmed' | 'cancelled' | 'completed') || 'confirmed'
    };
  }

  // Convert UI format to database row
  private bookingToDbRow(booking: CompletedBooking): Partial<BookingRow> {
    return {
      id: booking.id,
      payment_intent_id: booking.paymentIntentId,
      confirmation_number: booking.confirmationNumber,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail,
      customer_phone: booking.customerPhone,
      beach: booking.beach,
      lesson_date: booking.date,
      start_time: booking.startTime,
      end_time: booking.endTime,
      price: booking.price,
      lessons_booked: booking.lessonsBooked,
      is_private: booking.isPrivate,
      status: booking.status
    };
  }

  // Save a booking to Supabase
  public async saveCompletedBooking(booking: CompletedBooking): Promise<{ success: boolean; error?: string }> {
    try {
      const dbRow = this.bookingToDbRow(booking);
      
      const { error } = await getSupabaseAdmin()
        .from('bookings')
        .upsert(dbRow, { 
          onConflict: 'payment_intent_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Supabase error saving booking:', error);
        return { success: false, error: error.message };
      }

      // SECURITY: Removed confirmation number logging - contains booking data
      return { success: true };
    } catch (error) {
      console.error('Error saving booking to Supabase:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Save booking from Stripe webhook data
  public async saveBookingFromStripeData(stripeData: any): Promise<{ success: boolean; booking?: CompletedBooking; error?: string }> {
    try {
      // Use the first slot data for the main booking record (since slotData is now an array)
      const firstSlot = Array.isArray(stripeData.slotData) ? stripeData.slotData[0] : stripeData.slotData;
      
      // Create the database row directly without pre-generating the ID
      // Let Supabase generate the UUID automatically
      const dbRow = {
        payment_intent_id: stripeData.paymentIntentId,
        confirmation_number: stripeData.confirmationNumber,
        customer_name: stripeData.customerName,
        customer_email: stripeData.customerEmail,
        customer_phone: stripeData.customerPhone || '',
        beach: firstSlot?.beach || 'Unknown',
        lesson_date: firstSlot?.date || new Date().toISOString().split('T')[0],
        start_time: firstSlot?.startTime || '',
        end_time: firstSlot?.endTime || '',
        price: stripeData.amount || 0,
        lessons_booked: stripeData.lessonsBooked || 1,
        is_private: stripeData.isPrivate || false,
        status: 'confirmed'
      };

      // Generate a proper UUID for the booking
      const bookingUuid = crypto.randomUUID();
      const dbRowWithId = {
        ...dbRow,
        id: bookingUuid
      };

      // Insert and return the created record with the generated UUID
      const { data, error } = await getSupabaseAdmin()
        .from('bookings')
        .insert(dbRowWithId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving booking:', error);
        return { success: false, error: error.message };
      }

      // Convert the returned data to CompletedBooking format
      const booking = this.dbRowToBooking(data);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Booking saved with UUID:', booking.id);
      }

      return { success: true, booking };
    } catch (error) {
      console.error('Error saving Stripe booking to Supabase:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get all bookings
  public async getAllBookings(): Promise<{ success: boolean; bookings: CompletedBooking[]; error?: string }> {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from('bookings')
        .select('*')
        .order('lesson_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Supabase error fetching bookings:', error);
        return { success: false, bookings: [], error: error.message };
      }

      const bookings = (data || []).map((row: BookingRow) => this.dbRowToBooking(row));
      return { success: true, bookings };
    } catch (error) {
      console.error('Error fetching bookings from Supabase:', error);
      return { success: false, bookings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get bookings for a specific week
  public async getBookingsForWeek(startDate: Date): Promise<{ success: boolean; bookings: CompletedBooking[]; error?: string }> {
    try {
      // Use the same week calculation as WeeklyCalendar component
      const startOfWeek = new Date(startDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day; // First day is Sunday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0); // Start of day
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999); // End of day
      
      const startDateStr = startOfWeek.toISOString().split('T')[0];
      const endDateStr = endOfWeek.toISOString().split('T')[0];

      const { data, error } = await getSupabaseAdmin()
        .from('bookings')
        .select('*')
        .gte('lesson_date', startDateStr)
        .lte('lesson_date', endDateStr)
        .order('lesson_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Supabase error fetching week bookings:', error);
        return { success: false, bookings: [], error: error.message };
      }

      const bookings = (data || []).map((row: BookingRow) => this.dbRowToBooking(row));
      return { success: true, bookings };
    } catch (error) {
      console.error('Error fetching week bookings from Supabase:', error);
      return { success: false, bookings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get bookings for a specific date
  public async getBookingsForDate(date: string): Promise<{ success: boolean; bookings: CompletedBooking[]; error?: string }> {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from('bookings')
        .select('*')
        .eq('lesson_date', date)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Supabase error fetching date bookings:', error);
        return { success: false, bookings: [], error: error.message };
      }

      const bookings = (data || []).map((row: BookingRow) => this.dbRowToBooking(row));
      return { success: true, bookings };
    } catch (error) {
      console.error('Error fetching date bookings from Supabase:', error);
      return { success: false, bookings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update booking status
  public async updateBookingStatus(bookingId: string, status: CompletedBooking['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await getSupabaseAdmin()
        .from('bookings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Supabase error updating booking status:', error);
        return { success: false, error: error.message };
      }

      // SECURITY: Removed booking update logging - contains booking data
      return { success: true };
    } catch (error) {
      console.error('Error updating booking status in Supabase:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // PIN management (server-side via API)
  public async createStaffPin(staffData: {
    pin: string;
    staffName: string;
    role: 'surf_instructor' | 'admin';
    phone?: string;
    email?: string;
    notes?: string;
  }, adminKey: string): Promise<{ success: boolean; error?: string; staffId?: string }> {
    try {
      const response = await fetch('/api/staff/pin-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...staffData, adminKey }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Staff PIN created via server');
      } else {
        console.error('❌ Failed to create PIN:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating staff PIN:', error);
      return { success: false, error: 'Network error' };
    }
  }

  public async updateStaffPin(staffId: string, updates: {
    pin?: string;
    staffName?: string;
    role?: 'surf_instructor' | 'admin';
    phone?: string;
    email?: string;
    notes?: string;
    isActive?: boolean;
  }, adminKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/staff/pin-management', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId, updates, adminKey }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Staff PIN updated via server');
      } else {
        console.error('❌ Failed to update PIN:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error updating staff PIN:', error);
      return { success: false, error: 'Network error' };
    }
  }

  public async verifyStaffPin(pin: string): Promise<boolean> {
    try {
      // Check if we're on the server side or client side
      if (typeof window === 'undefined') {
        // Server-side: query database directly
        const { data: staffData, error: fetchError } = await getSupabaseAdmin()
          .from('staff_pins')
          .select('*')
          .eq('pin', pin)
          .eq('is_active', true)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Database error verifying PIN:', fetchError);
          return false;
        }

        const isValid = !!staffData;

        // Update last_used_at if PIN is valid
        if (isValid) {
          await getSupabaseAdmin()
            .from('staff_pins')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', staffData.id);
        }

        return isValid;
      } else {
        // Client-side: make API request
        const response = await fetch(`/api/staff/pin-management?action=verify&pin=${encodeURIComponent(pin)}`, {
          method: 'GET',
        });

        const result = await response.json();
        
        if (result.success && result.isValid) {
          console.log('✅ PIN verified successfully');
          return true;
        } else {
          // SECURITY: Removed PIN verification logging - contains authentication data
          return false;
        }
      }
    } catch (error) {
      console.error('Error verifying staff PIN:', error);
      return false;
    }
  }

  public async getAllStaffPins(adminKey: string): Promise<{ success: boolean; staff: StaffPinRow[]; error?: string }> {
    try {
      const response = await fetch(`/api/staff/pin-management?adminKey=${encodeURIComponent(adminKey)}`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (result.success && result.staff) {
        return {
          success: true,
          staff: result.staff.map((staff: any) => ({
            ...staff,
            pin: '****' // Don't expose actual PINs
          }))
        };
      }
      
      return { success: false, staff: [], error: result.error || 'Failed to fetch staff' };
    } catch (error) {
      console.error('Error getting all staff PINs:', error);
      return { success: false, staff: [], error: 'Network error' };
    }
  }

  public async getStaffPinConfig(adminKey: string): Promise<StaffPinConfig | null> {
    try {
      const result = await this.getAllStaffPins(adminKey);
      
      if (result.success && result.staff.length > 0) {
        // Return legacy format for backward compatibility
        const firstActive = result.staff.find(s => s.is_active);
        if (firstActive) {
          return {
            pin: '', // Don't expose actual PIN
            createdAt: firstActive.created_at,
            lastUsed: firstActive.last_used_at,
            isActive: firstActive.is_active
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting staff PIN config:', error);
      return null;
    }
  }

  public async deleteStaffPin(staffId: string, adminKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/staff/pin-management', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId, adminKey }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Staff PIN deleted via server');
      } else {
        console.error('❌ Failed to delete PIN:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting staff PIN:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Export bookings data
  public async exportBookingsData(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const result = await this.getAllBookings();
      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        data: JSON.stringify(result.bookings, null, 2) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Clear all bookings (admin function)
  public async clearAllBookings(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await getSupabaseAdmin()
        .from('bookings')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) {
        console.error('Supabase error clearing bookings:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ All bookings cleared from Supabase');
      return { success: true };
    } catch (error) {
      console.error('Error clearing bookings from Supabase:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const supabaseStaffService = new SupabaseStaffService(); 