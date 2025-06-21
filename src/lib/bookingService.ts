import { BookingRequest, BookingResponse, BeachCoordinates } from '@/types/booking';
import { supabaseCacheService } from './supabaseCacheService';

class BookingService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.NEXT_PUBLIC_BOOKING_WEBHOOK_URL || 
      'https://cheeseman.app.n8n.cloud/webhook-test/00508e20-101f-4e94-9b6f-bb5bdc2e4e07';
    
    // Debug logging - remove this in production
    // SECURITY: Removed environment logging - exposes system configuration
    // SECURITY: Removed webhook URL logging - exposes system configuration
    // SECURITY: Removed webhook URL logging - exposes system configuration
  }

  private getBeachCoordinates(beach: string): BeachCoordinates {
    const coordinates = {
      'Doheny': { lat: 33.459869, lng: -117.686949 },
      'T-Street': { lat: 33.416021, lng: -117.619309 },
      'San Onofre': { lat: 33.372637, lng: -117.565611 }
    };
    
    return coordinates[beach as keyof typeof coordinates] || coordinates['Doheny'];
  }

  private formatDateToISO(date: Date): string {
    // Format to YYYY-MM-DD
    return date.toISOString().split('T')[0];
  }

  private formatDateTimeToISO(date: Date): string {
    // Use the same date formatting as formatDateToISO to ensure consistency
    // and avoid timezone issues that can cause day shifts
    const dateString = this.formatDateToISO(date);
    
    // Append Pacific timezone offset without timezone manipulation
    // Using -07:00 for PDT (Daylight Saving Time)
    return `${dateString}T00:00:00-07:00`;
  }

  /**
   * Internal method to fetch data directly from API (used by cache system)
   */
  private async fetchFromAPI(beach: string, date: Date): Promise<BookingResponse> {
    if (!this.webhookUrl) {
      throw new Error('Booking webhook URL not configured');
    }

    const coordinates = this.getBeachCoordinates(beach);
    const dateISO = this.formatDateToISO(date);
    const dateTimeISO = this.formatDateTimeToISO(date);
    
    // SECURITY: Removed date formatting debug - may contain sensitive data
    
    const payload: BookingRequest = {
      date: dateISO,
      beach: beach,
      lat: coordinates.lat,
      lng: coordinates.lng,
      dateTime: dateTimeISO
    };

    // Store detailed webhook request information for admin debugging
    const webhookRequestDetails = {
      url: this.webhookUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: payload,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substr(2, 9)
    };

          // SECURITY: Removed webhook URL logging - exposes system configuration
    // SECURITY: Removed payload logging - contains booking request data
    
    const startTime = Date.now();
    
    try {
      // Create basic auth header - try both client and server env vars
      const username = process.env.NEXT_PUBLIC_N8N_WEBHOOK_USERNAME || process.env.N8N_WEBHOOK_USERNAME;
      const password = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PASSWORD || process.env.N8N_WEBHOOK_PASSWORD;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add basic auth if credentials are available
      if (username && password) {
        const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${basicAuth}`;
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorDetails = {
          ...webhookRequestDetails,
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            responseTime: responseTime
          },
          success: false
        };
        
        // Store error details in cache for admin debugging
        supabaseCacheService.lastApiPayload = errorDetails;
        supabaseCacheService.lastError = `HTTP error! status: ${response.status}`;
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      // SECURITY: Removed raw webhook response logging - contains sensitive data
      
      // The response is an array with an object containing 'output'
      let data: BookingResponse;
      
      if (Array.isArray(rawData) && rawData.length > 0 && rawData[0].output) {
        // Extract the actual booking data from the output property
        data = rawData[0].output;
      } else if (rawData.output) {
        // Handle case where it's just an object with output property
        data = rawData.output;
      } else {
        // Handle case where the data is already in the correct format
        data = rawData;
      }
      
      // Store successful webhook details for admin debugging
      const successDetails = {
        ...webhookRequestDetails,
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          rawData: rawData,
          processedData: data,
          responseTime: responseTime
        },
        success: true
      };
      
      supabaseCacheService.lastApiPayload = successDetails;
      supabaseCacheService.lastApiResponse = data;
      supabaseCacheService.lastError = null;
      
      // SECURITY: Removed booking data logging - contains sensitive information
      return data;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorDetails = {
        ...webhookRequestDetails,
        response: {
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: responseTime
        },
        success: false
      };
      
      // Store error details in cache for admin debugging
      supabaseCacheService.lastApiPayload = errorDetails;
      supabaseCacheService.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      throw error;
    }
  }

  /**
   * Public method to fetch available slots with caching
   */
  public async fetchAvailableSlots(beach: string, date: Date, forceRefresh: boolean = false): Promise<BookingResponse> {
    const dateString = this.formatDateToISO(date);
    
    // SECURITY: Removed debug logging - may contain sensitive booking data
    
    try {
      return await supabaseCacheService.getBookingSlotsForDay(
        dateString,
        beach,
        forceRefresh,
        this.fetchFromAPI.bind(this)
      );
    } catch (error) {
      console.error('Error fetching booking slots:', error);
      throw new Error('Failed to fetch available slots. Please try again.');
    }
  }

  /**
   * Clear cache for specific date and beach
   */
  public async clearCacheForDate(date: Date, beach?: string): Promise<void> {
    const dateString = this.formatDateToISO(date);
    await supabaseCacheService.clearCacheForDate(dateString, beach);
  }

  /**
   * Clear all cached data
   */
  public async clearAllCache(): Promise<void> {
    await supabaseCacheService.clearCache();
  }

  /**
   * Get cache information for debugging
   */
  public async getCacheInfo() {
    return await supabaseCacheService.getCacheInfo();
  }

  /**
   * Clean expired cache entries
   */
  public async cleanExpiredCache(): Promise<void> {
    await supabaseCacheService.cleanExpiredCache();
  }

  /**
   * Invalidate cache for a specific booking date (called from webhook)
   */
  public async invalidateCacheForBooking(date: string): Promise<void> {
    await supabaseCacheService.invalidateCacheForBooking(date);
  }

  /**
   * Update slot availability after booking confirmation
   * This method fetches current slot data and calculates new availability
   */
  public async updateSlotAvailability(
    beach: string, 
    date: string, 
    timeSlot: string, 
    isPrivateBooking: boolean
  ): Promise<{ openSpaces: number; available: boolean } | null> {
    try {
      // Parse the date string to Date object for fetchAvailableSlots
      const bookingDate = new Date(date + 'T12:00:00'); // Use noon to avoid timezone issues
      
      // Fetch current slot data
      const response = await this.fetchAvailableSlots(beach, bookingDate, true); // Force refresh
      
      if (!response || !response.slots) {
        console.error('No slot data available for update');
        return null;
      }

      // Find the specific slot that was booked
      const targetSlot = response.slots.find(slot => {
        const slotTimeFormatted = this.formatTimeSlot(slot.startTime, slot.endTime);
        return slotTimeFormatted === timeSlot;
      });

      if (!targetSlot) {
        console.error('Target slot not found for update');
        return null;
      }

      // Calculate new availability
      const currentSpaces = parseInt(targetSlot.openSpaces) || 0;
      const newOpenSpaces = isPrivateBooking ? 0 : Math.max(0, currentSpaces - 1);
      const isStillAvailable = newOpenSpaces > 0;

      // Return the updated values
      return {
        openSpaces: newOpenSpaces,
        available: isStillAvailable
      };
    } catch (error) {
      console.error('Error updating slot availability:', error);
      return null;
    }
  }

  /**
   * Helper method to format time slot for comparison
   */
  private formatTimeSlot(startTime: string, endTime: string): string {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      // Subtract 30 minutes from end time to match display format
      const adjustedEnd = new Date(end.getTime() - (30 * 60 * 1000));
      
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };

      return `${formatTime(start)} - ${formatTime(adjustedEnd)}`;
    } catch (error) {
      console.error('Error formatting time slot:', error);
      return '';
    }
  }
}

export const bookingService = new BookingService(); 