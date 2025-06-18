import { supabase, BookingRow, StaffPinRow } from './supabase';
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
      customerPhone: row.customer_phone,
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
      
      const { error } = await supabase
        .from('bookings')
        .upsert(dbRow, { 
          onConflict: 'payment_intent_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Supabase error saving booking:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Booking saved to Supabase:', booking.confirmationNumber);
      return { success: true };
    } catch (error) {
      console.error('Error saving booking to Supabase:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Save booking from Stripe webhook data
  public async saveBookingFromStripeData(stripeData: any): Promise<{ success: boolean; booking?: CompletedBooking; error?: string }> {
    try {
      // Convert Stripe webhook data to booking format
      const booking: CompletedBooking = {
        id: `stripe-${stripeData.paymentIntentId}`,
        confirmationNumber: stripeData.confirmationNumber,
        paymentIntentId: stripeData.paymentIntentId,
        customerName: stripeData.customerName,
        customerEmail: stripeData.customerEmail,
        customerPhone: stripeData.customerPhone,
        beach: stripeData.slotData?.beach || 'Unknown',
        date: stripeData.slotData?.date || new Date().toISOString().split('T')[0],
        startTime: stripeData.slotData?.startTime || '',
        endTime: stripeData.slotData?.endTime || '',
        price: stripeData.amount || 0,
        lessonsBooked: stripeData.lessonsBooked || 1,
        isPrivate: stripeData.isPrivate || false,
        timestamp: stripeData.timestamp || new Date().toISOString(),
        status: 'confirmed'
      };

      const result = await this.saveCompletedBooking(booking);
      if (result.success) {
        return { success: true, booking };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error converting Stripe data to booking:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get all bookings
  public async getAllBookings(): Promise<{ success: boolean; bookings: CompletedBooking[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('lesson_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Supabase error fetching bookings:', error);
        return { success: false, bookings: [], error: error.message };
      }

      const bookings = (data || []).map(row => this.dbRowToBooking(row));
      return { success: true, bookings };
    } catch (error) {
      console.error('Error fetching bookings from Supabase:', error);
      return { success: false, bookings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get bookings for a specific week
  public async getBookingsForWeek(startDate: Date): Promise<{ success: boolean; bookings: CompletedBooking[]; error?: string }> {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const { data, error } = await supabase
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

      const bookings = (data || []).map(row => this.dbRowToBooking(row));
      return { success: true, bookings };
    } catch (error) {
      console.error('Error fetching week bookings from Supabase:', error);
      return { success: false, bookings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get bookings for a specific date
  public async getBookingsForDate(date: string): Promise<{ success: boolean; bookings: CompletedBooking[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('lesson_date', date)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Supabase error fetching date bookings:', error);
        return { success: false, bookings: [], error: error.message };
      }

      const bookings = (data || []).map(row => this.dbRowToBooking(row));
      return { success: true, bookings };
    } catch (error) {
      console.error('Error fetching date bookings from Supabase:', error);
      return { success: false, bookings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update booking status
  public async updateBookingStatus(bookingId: string, status: CompletedBooking['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
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

      console.log(`✅ Booking ${bookingId} status updated to ${status}`);
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
      const response = await fetch('/api/staff/pin-management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const result = await response.json();
      
      if (result.success && result.valid) {
        console.log('✅ PIN verified successfully');
        return true;
      } else {
        console.log('❌ PIN verification failed:', result.error || 'Invalid PIN');
        return false;
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
            lastUsed: firstActive.last_used,
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
      const { error } = await supabase
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