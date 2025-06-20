import { CompletedBooking, StaffPinConfig } from '@/types/booking';

class StaffService {
  private static readonly BOOKINGS_KEY = 'completed_bookings';
  private static readonly PIN_KEY = 'staff_pin_config';

  // Booking management
  public saveCompletedBooking(booking: CompletedBooking): void {
    try {
      if (typeof window === 'undefined') return;
      
      const bookings = this.getAllBookings();
      bookings.push(booking);
      
      localStorage.setItem(StaffService.BOOKINGS_KEY, JSON.stringify(bookings));
      // SECURITY: Removed confirmation number logging - contains booking data
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  }

  // New method to save from server-side data
  public saveBookingFromServerData(bookingData: any): CompletedBooking | null {
    try {
      if (typeof window === 'undefined') return null;
      
      // Convert server data to CompletedBooking format
      const booking: CompletedBooking = {
        id: `stripe-${bookingData.paymentIntentId}`,
        confirmationNumber: bookingData.confirmationNumber,
        paymentIntentId: bookingData.paymentIntentId,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        beach: bookingData.slotData?.beach || 'Unknown',
        date: bookingData.slotData?.date || new Date().toISOString().split('T')[0],
        startTime: bookingData.slotData?.startTime || '',
        endTime: bookingData.slotData?.endTime || '',
        price: bookingData.amount || 0,
        lessonsBooked: bookingData.lessonsBooked || 1,
        isPrivate: bookingData.isPrivate || false,
        timestamp: bookingData.timestamp || new Date().toISOString(),
        status: 'confirmed'
      };
      
      this.saveCompletedBooking(booking);
      return booking;
    } catch (error) {
      console.error('Error converting server data to booking:', error);
      return null;
    }
  }

  public getAllBookings(): CompletedBooking[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const bookingsData = localStorage.getItem(StaffService.BOOKINGS_KEY);
      if (!bookingsData) return [];
      
      return JSON.parse(bookingsData) as CompletedBooking[];
    } catch (error) {
      console.error('Error loading bookings:', error);
      return [];
    }
  }

  public getBookingsForWeek(startDate: Date): CompletedBooking[] {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return this.getAllBookings().filter(booking => {
      return booking.date >= startDateStr && booking.date <= endDateStr;
    });
  }

  public getBookingsForDate(date: string): CompletedBooking[] {
    return this.getAllBookings().filter(booking => booking.date === date);
  }

  public updateBookingStatus(bookingId: string, status: CompletedBooking['status']): boolean {
    try {
      const bookings = this.getAllBookings();
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);
      
      if (bookingIndex === -1) return false;
      
      bookings[bookingIndex].status = status;
      localStorage.setItem(StaffService.BOOKINGS_KEY, JSON.stringify(bookings));
      
      // SECURITY: Removed booking update logging - contains booking data
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  }

  // Sync method to fetch bookings from server
  public async syncBookingsFromServer(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, count: 0, message: 'Not available on server-side' };
      }

      const response = await fetch('/api/staff/get-pending-bookings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let syncCount = 0;

      if (data.bookings && Array.isArray(data.bookings)) {
        const existingBookings = this.getAllBookings();
        const existingIds = new Set(existingBookings.map(b => b.paymentIntentId));

        for (const serverBooking of data.bookings) {
          // Only sync bookings that don't already exist
          if (!existingIds.has(serverBooking.paymentIntentId)) {
            const booking = this.saveBookingFromServerData(serverBooking);
            if (booking) {
              syncCount++;
            }
          }
        }
      }

      return {
        success: true,
        count: syncCount,
        message: `Synced ${syncCount} new bookings from server`
      };
    } catch (error) {
      console.error('Error syncing bookings from server:', error);
      return {
        success: false,
        count: 0,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // PIN management
  public setStaffPin(pin: string): void {
    try {
      if (typeof window === 'undefined') return;
      
      const pinConfig: StaffPinConfig = {
        pin: pin,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      localStorage.setItem(StaffService.PIN_KEY, JSON.stringify(pinConfig));
      console.log('✅ Staff PIN updated');
    } catch (error) {
      console.error('Error setting staff PIN:', error);
    }
  }

  public verifyStaffPin(pin: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const pinData = localStorage.getItem(StaffService.PIN_KEY);
      if (!pinData) return false;
      
      const pinConfig = JSON.parse(pinData) as StaffPinConfig;
      
      if (!pinConfig.isActive) return false;
      
      const isValid = pinConfig.pin === pin;
      
      if (isValid) {
        // Update last used timestamp
        pinConfig.lastUsed = new Date().toISOString();
        localStorage.setItem(StaffService.PIN_KEY, JSON.stringify(pinConfig));
      }
      
      return isValid;
    } catch (error) {
      console.error('Error verifying staff PIN:', error);
      return false;
    }
  }

  public getStaffPinConfig(): StaffPinConfig | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const pinData = localStorage.getItem(StaffService.PIN_KEY);
      if (!pinData) return null;
      
      return JSON.parse(pinData) as StaffPinConfig;
    } catch (error) {
      console.error('Error getting staff PIN config:', error);
      return null;
    }
  }

  public deactivateStaffPin(): void {
    try {
      if (typeof window === 'undefined') return;
      
      const pinData = localStorage.getItem(StaffService.PIN_KEY);
      if (!pinData) return;
      
      const pinConfig = JSON.parse(pinData) as StaffPinConfig;
      pinConfig.isActive = false;
      
      localStorage.setItem(StaffService.PIN_KEY, JSON.stringify(pinConfig));
      console.log('✅ Staff PIN deactivated');
    } catch (error) {
      console.error('Error deactivating staff PIN:', error);
    }
  }

  // Utility methods
  public exportBookingsData(): string {
    const bookings = this.getAllBookings();
    return JSON.stringify(bookings, null, 2);
  }

  public clearAllBookings(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(StaffService.BOOKINGS_KEY);
      console.log('✅ All bookings cleared');
    } catch (error) {
      console.error('Error clearing bookings:', error);
    }
  }
}

export const staffService = new StaffService(); 