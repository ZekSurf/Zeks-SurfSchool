import { BookingRequest, BookingResponse, BeachCoordinates } from '@/types/booking';
import { bookingCache } from './bookingCache';

class BookingService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.NEXT_PUBLIC_BOOKING_WEBHOOK_URL || 
      'https://cheeseman.app.n8n.cloud/webhook-test/00508e20-101f-4e94-9b6f-bb5bdc2e4e07';
    
    // Debug logging - remove this in production
    console.log('Environment variables loaded:');
    console.log('NEXT_PUBLIC_BOOKING_WEBHOOK_URL:', process.env.NEXT_PUBLIC_BOOKING_WEBHOOK_URL);
    console.log('Current webhookUrl:', this.webhookUrl);
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
    
    console.log(`🔍 DEBUG: Date formatting for webhook:`, {
      originalDate: date.toISOString(),
      dateISO,
      dateTimeISO,
      beach
    });
    
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

    console.log('Making booking request to:', this.webhookUrl);
    console.log('Request payload:', payload);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        bookingCache.lastApiPayload = errorDetails;
        bookingCache.lastError = `HTTP error! status: ${response.status}`;
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('Raw webhook response:', rawData);
      
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
      
      bookingCache.lastApiPayload = successDetails;
      bookingCache.lastApiResponse = data;
      bookingCache.lastError = null;
      
      console.log('Processed booking data:', data);
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
      bookingCache.lastApiPayload = errorDetails;
      bookingCache.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      throw error;
    }
  }

  /**
   * Public method to fetch available slots with caching
   */
  public async fetchAvailableSlots(beach: string, date: Date, forceRefresh: boolean = false): Promise<BookingResponse> {
    const dateString = this.formatDateToISO(date);
    
    console.log(`🔍 DEBUG: BookingService.fetchAvailableSlots called with:`, {
      beach,
      date: date.toISOString(),
      dateString,
      forceRefresh
    });
    
    try {
      return await bookingCache.getBookingSlotsForDay(
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
  public clearCacheForDate(date: Date, beach?: string): void {
    const dateString = this.formatDateToISO(date);
    bookingCache.clearCacheForDate(dateString, beach);
  }

  /**
   * Clear entire booking cache
   */
  public clearAllCache(): void {
    bookingCache.clearCache();
  }

  /**
   * Get cache information and statistics
   */
  public getCacheInfo() {
    return bookingCache.getCacheInfo();
  }

  /**
   * Clean expired cache entries
   */
  public cleanExpiredCache(): void {
    bookingCache.cleanExpiredCache();
  }
}

export const bookingService = new BookingService(); 