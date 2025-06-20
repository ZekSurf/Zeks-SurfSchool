import { supabase, TimeSlotsCache } from './supabase';
import { BookingResponse } from '@/types/booking';

interface CacheInfo {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  entries: Array<{
    key: string;
    beach: string;
    date: string;
    isValid: boolean;
    age: number; // in hours
  }>;
}

class SupabaseCacheService {
  private static readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  // Debug properties
  public lastApiPayload: any = null;
  public lastApiResponse: any = null;
  public lastError: any = null;

  constructor() {
    // Perform initial cleanup on instantiation
    this.cleanExpiredCache();
  }

  /**
   * Generate cache key from date and beach name
   */
  private getCacheKey(date: string, beach: string): string {
    const cacheKey = `${date}_${beach.toLowerCase().replace(/\s+/g, '_')}`;
    // SECURITY: Removed cache key logging - may contain system info
    return cacheKey;
  }

  /**
   * Check if cache entry hasn't expired
   */
  private isCacheValid(entry: TimeSlotsCache): boolean {
    const currentTime = new Date();
    const expirationTime = new Date(entry.expires_at);
    const isValid = currentTime < expirationTime;
    
    const ageHours = (currentTime.getTime() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60);
    // SECURITY: Removed cache status logging - may contain system information
    
    return isValid;
  }

  /**
   * Get cached data if valid, remove if expired, return null if not found
   */
  private async getCachedData(date: string, beach: string): Promise<BookingResponse | null> {
    const cacheKey = this.getCacheKey(date, beach);
    
    try {
      const { data: entry, error } = await supabase
        .from('time_slots_cache')
        .select('*')
        .eq('cache_key', cacheKey)
        .single();

      if (error || !entry) {
        // SECURITY: Removed cache miss logging
        return null;
      }

      if (this.isCacheValid(entry)) {
        // SECURITY: Removed cache hit logging
        return entry.data as BookingResponse;
      } else {
        // SECURITY: Removed cache expiration logging
        await this.removeCacheEntry(date, beach);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting cached data:', error);
      this.lastError = error;
      return null;
    }
  }

  /**
   * Store new data in cache with current timestamp
   */
  private async setCachedData(date: string, beach: string, data: BookingResponse): Promise<void> {
    const cacheKey = this.getCacheKey(date, beach);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SupabaseCacheService.CACHE_DURATION_MS);
    
    try {
      const { error } = await supabase
        .from('time_slots_cache')
        .upsert({
          cache_key: cacheKey,
          beach,
          date,
          data: data as any, // JSONB field
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'cache_key'
        });

      if (error) {
        console.error('❌ Error storing cache data:', error);
        this.lastError = error;
        return;
      }
      
      // SECURITY: Removed cache operation logging - may expose system data
    } catch (error) {
      console.error('❌ Error storing cache data:', error);
      this.lastError = error;
    }
  }

  /**
   * Remove specific cache entry
   */
  private async removeCacheEntry(date: string, beach: string): Promise<void> {
    const cacheKey = this.getCacheKey(date, beach);
    
    try {
      const { error } = await supabase
        .from('time_slots_cache')
        .delete()
        .eq('cache_key', cacheKey);

      if (error) {
        console.error(`❌ Cache REMOVE FAILED for key "${cacheKey}":`, error);
        this.lastError = error;
        return;
      }
      
      // SECURITY: Removed cache operation logging
    } catch (error) {
      console.error('❌ Error removing cache entry:', error);
      this.lastError = error;
    }
  }

  /**
   * Main method that checks cache first, then fetches from API if needed
   */
  public async getBookingSlotsForDay(
    date: string, 
    beach: string, 
    forceRefresh: boolean = false,
    fetchFunction: (beach: string, date: Date) => Promise<BookingResponse>
  ): Promise<BookingResponse> {
    // SECURITY: Removed booking request logging - may contain sensitive data

    // Skip cache if force refresh is requested
    if (forceRefresh) {
      console.log('🔄 Force refresh requested, skipping cache lookup');
    } else {
      // Try to get from cache first
      const cachedData = await this.getCachedData(date, beach);
      if (cachedData) {
        return cachedData;
      }
    }

    // Cache miss or force refresh - fetch from API
          // SECURITY: Removed API fetch logging
          // SECURITY: Removed debug booking request logging
    try {
      const dateObj = new Date(date);
      // SECURITY: Removed date conversion debug logging
      
      const freshData = await fetchFunction(beach, dateObj);
      this.lastApiResponse = freshData;
      
      // Store successful response in cache
      await this.setCachedData(date, beach, freshData);
      
      return freshData;
    } catch (error) {
      console.error(`❌ API fetch failed for ${beach} on ${date}:`, error);
      this.lastError = error;
      throw error;
    }
  }

  /**
   * Remove entire cache from database
   */
  public async clearCache(): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_slots_cache')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        console.error('❌ Error clearing cache:', error);
        this.lastError = error;
        return;
      }

      // SECURITY: Removed cache clear logging
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      this.lastError = error;
    }
  }

  /**
   * Clear cache for specific date/beach or all beaches for a date
   */
  public async clearCacheForDate(date: string, beach?: string): Promise<void> {
    // SECURITY: Removed cache clearing logging
    
    try {
      let query = supabase.from('time_slots_cache').delete();
      
      if (beach) {
        // Clear specific beach for the date
        const cacheKey = this.getCacheKey(date, beach);
        query = query.eq('cache_key', cacheKey);
      } else {
        // Clear all beaches for the date
        query = query.eq('date', date);
      }

      const { error, count } = await query;

      if (error) {
        console.error('❌ Error clearing cache for date:', error);
        this.lastError = error;
        return;
      }

      // SECURITY: Removed cache removal logging
    } catch (error) {
      console.error('❌ Error clearing cache for date:', error);
      this.lastError = error;
    }
  }

  /**
   * Return cache statistics including total entries and validity status
   */
  public async getCacheInfo(): Promise<CacheInfo> {
    try {
      const { data: entries, error } = await supabase
        .from('time_slots_cache')
        .select('*');

      if (error) {
        console.error('❌ Error getting cache info:', error);
        this.lastError = error;
        return {
          totalEntries: 0,
          validEntries: 0,
          expiredEntries: 0,
          entries: []
        };
      }

      let validEntries = 0;
      let expiredEntries = 0;
      
      const entryDetails = (entries || []).map(entry => {
        const isValid = this.isCacheValid(entry);
        const ageHours = (Date.now() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60);
        
        if (isValid) {
          validEntries++;
        } else {
          expiredEntries++;
        }
        
        return {
          key: entry.cache_key,
          beach: entry.beach,
          date: entry.date,
          isValid,
          age: Math.round(ageHours * 10) / 10 // Round to 1 decimal
        };
      });

      const info: CacheInfo = {
        totalEntries: entries?.length || 0,
        validEntries,
        expiredEntries,
        entries: entryDetails
      };

      // SECURITY: Removed cache info logging
      return info;
    } catch (error) {
      console.error('❌ Error getting cache info:', error);
      this.lastError = error;
      return {
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        entries: []
      };
    }
  }

  /**
   * Remove all expired entries from cache
   */
  public async cleanExpiredCache(): Promise<void> {
    // SECURITY: Removed cache cleanup logging
    
    try {
      const { error, count } = await supabase
        .from('time_slots_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('❌ Error cleaning expired cache:', error);
        this.lastError = error;
        return;
      }

      if (count && count > 0) {
        // SECURITY: Removed cleanup completion logging
      } else {
        // SECURITY: Removed cleanup completion logging
      }
    } catch (error) {
      console.error('❌ Error cleaning expired cache:', error);
      this.lastError = error;
    }
  }

  /**
   * Clear cache for a specific date when bookings are made
   * This is called from the Stripe webhook to invalidate cache
   */
  public async invalidateCacheForBooking(date: string): Promise<void> {
    // SECURITY: Removed cache invalidation logging
    await this.clearCacheForDate(date);
  }
}

// Export singleton instance
export const supabaseCacheService = new SupabaseCacheService(); 