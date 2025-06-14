import { BookingResponse } from '@/types/booking';

interface CacheEntry {
  data: BookingResponse;
  timestamp: number;
  beach: string;
  date: string;
}

interface BookingCache {
  [key: string]: CacheEntry;
}

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

class BookingCacheService {
  private static readonly CACHE_KEY = 'booking_slots_cache';
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
    console.log(`🔑 Generated cache key: "${cacheKey}" for date: ${date}, beach: ${beach}`);
    return cacheKey;
  }

  /**
   * Read entire cache from localStorage
   */
  private getCache(): BookingCache {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('📱 Server-side rendering detected, returning empty cache');
        return {};
      }

      const cacheData = localStorage.getItem(BookingCacheService.CACHE_KEY);
      if (!cacheData) {
        console.log('💾 No cache found in localStorage');
        return {};
      }

      const cache = JSON.parse(cacheData) as BookingCache;
      console.log(`💾 Retrieved cache from localStorage with ${Object.keys(cache).length} entries`);
      return cache;
    } catch (error) {
      console.error('❌ Error reading cache from localStorage:', error);
      this.lastError = error;
      return {};
    }
  }

  /**
   * Write entire cache object to localStorage
   */
  private setCache(cache: BookingCache): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('📱 Server-side rendering detected, skipping cache write');
        return;
      }

      localStorage.setItem(BookingCacheService.CACHE_KEY, JSON.stringify(cache));
      console.log(`💾 Cache written to localStorage with ${Object.keys(cache).length} entries`);
    } catch (error) {
      console.error('❌ Error writing cache to localStorage:', error);
      this.lastError = error;
    }
  }

  /**
   * Check if cache entry hasn't expired
   */
  private isCacheValid(entry: CacheEntry): boolean {
    const currentTime = Date.now();
    const expirationTime = entry.timestamp + BookingCacheService.CACHE_DURATION_MS;
    const isValid = currentTime < expirationTime;
    
    const ageHours = (currentTime - entry.timestamp) / (1000 * 60 * 60);
    console.log(`⏰ Cache entry for ${entry.beach} on ${entry.date} is ${isValid ? 'VALID' : 'EXPIRED'} (age: ${ageHours.toFixed(1)} hours)`);
    
    return isValid;
  }

  /**
   * Get cached data if valid, remove if expired, return null if not found
   */
  private getCachedData(date: string, beach: string): BookingResponse | null {
    const cacheKey = this.getCacheKey(date, beach);
    const cache = this.getCache();
    const entry = cache[cacheKey];

    if (!entry) {
      console.log(`❌ Cache MISS: No entry found for key "${cacheKey}"`);
      return null;
    }

    if (this.isCacheValid(entry)) {
      console.log(`✅ Cache HIT: Valid data found for key "${cacheKey}"`);
      return entry.data;
    } else {
      console.log(`🗑️ Cache EXPIRED: Removing expired entry for key "${cacheKey}"`);
      this.removeCacheEntry(date, beach);
      return null;
    }
  }

  /**
   * Store new data in cache with current timestamp
   */
  private setCachedData(date: string, beach: string, data: BookingResponse): void {
    const cacheKey = this.getCacheKey(date, beach);
    const cache = this.getCache();
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      beach,
      date
    };

    cache[cacheKey] = entry;
    this.setCache(cache);
    
    console.log(`💾 Cache STORED: Data cached for key "${cacheKey}" with ${data.slots?.length || 0} slots`);
  }

  /**
   * Remove specific cache entry
   */
  private removeCacheEntry(date: string, beach: string): void {
    const cacheKey = this.getCacheKey(date, beach);
    const cache = this.getCache();
    
    if (cache[cacheKey]) {
      delete cache[cacheKey];
      this.setCache(cache);
      console.log(`🗑️ Cache REMOVED: Entry deleted for key "${cacheKey}"`);
    } else {
      console.log(`❌ Cache REMOVE FAILED: No entry found for key "${cacheKey}"`);
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
    console.log(`🔍 Requesting booking slots for ${beach} on ${date} (forceRefresh: ${forceRefresh})`);

    // Skip cache if force refresh is requested
    if (forceRefresh) {
      console.log('🔄 Force refresh requested, skipping cache lookup');
    } else {
      // Try to get from cache first
      const cachedData = this.getCachedData(date, beach);
      if (cachedData) {
        return cachedData;
      }
    }

    // Cache miss or force refresh - fetch from API
    console.log(`🌐 Fetching fresh data from API for ${beach} on ${date}`);
    console.log(`🔍 DEBUG: Cache requesting slots for beach="${beach}", date="${date}"`);
    try {
      const dateObj = new Date(date);
      console.log(`🔍 DEBUG: Converted date string "${date}" to Date object:`, dateObj);
      
      // Don't overwrite the detailed payload from bookingService
      // this.lastApiPayload = { beach, date, dateObj };
      
      const freshData = await fetchFunction(beach, dateObj);
      this.lastApiResponse = freshData;
      
      // Store successful response in cache
      this.setCachedData(date, beach, freshData);
      
      return freshData;
    } catch (error) {
      console.error(`❌ API fetch failed for ${beach} on ${date}:`, error);
      this.lastError = error;
      throw error;
    }
  }

  /**
   * Remove entire cache from localStorage
   */
  public clearCache(): void {
    try {
      if (typeof window === 'undefined') {
        console.log('📱 Server-side rendering detected, skipping cache clear');
        return;
      }

      localStorage.removeItem(BookingCacheService.CACHE_KEY);
      console.log('🗑️ Entire cache cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      this.lastError = error;
    }
  }

  /**
   * Clear cache for specific date/beach or all beaches for a date
   */
  public clearCacheForDate(date: string, beach?: string): void {
    console.log(`🗑️ Clearing cache for date: ${date}${beach ? `, beach: ${beach}` : ' (all beaches)'}`);
    
    const cache = this.getCache();
    let removedCount = 0;

    if (beach) {
      // Clear specific beach for the date
      const cacheKey = this.getCacheKey(date, beach);
      if (cache[cacheKey]) {
        delete cache[cacheKey];
        removedCount = 1;
      }
    } else {
      // Clear all beaches for the date
      Object.keys(cache).forEach(key => {
        if (cache[key].date === date) {
          delete cache[key];
          removedCount++;
        }
      });
    }

    if (removedCount > 0) {
      this.setCache(cache);
      console.log(`🗑️ Removed ${removedCount} cache entries for date ${date}`);
    } else {
      console.log(`❌ No cache entries found for date ${date}`);
    }
  }

  /**
   * Return cache statistics including total entries and validity status
   */
  public getCacheInfo(): CacheInfo {
    const cache = this.getCache();
    const entries = Object.entries(cache);
    
    let validEntries = 0;
    let expiredEntries = 0;
    
    const entryDetails = entries.map(([key, entry]) => {
      const isValid = this.isCacheValid(entry);
      const ageHours = (Date.now() - entry.timestamp) / (1000 * 60 * 60);
      
      if (isValid) {
        validEntries++;
      } else {
        expiredEntries++;
      }
      
      return {
        key,
        beach: entry.beach,
        date: entry.date,
        isValid,
        age: Math.round(ageHours * 10) / 10 // Round to 1 decimal
      };
    });

    const info: CacheInfo = {
      totalEntries: entries.length,
      validEntries,
      expiredEntries,
      entries: entryDetails
    };

    console.log(`📊 Cache Info: ${info.totalEntries} total, ${info.validEntries} valid, ${info.expiredEntries} expired`);
    return info;
  }

  /**
   * Remove all expired entries from cache
   */
  public cleanExpiredCache(): void {
    console.log('🧹 Starting expired cache cleanup...');
    
    const cache = this.getCache();
    const originalCount = Object.keys(cache).length;
    let removedCount = 0;

    Object.keys(cache).forEach(key => {
      const entry = cache[key];
      if (!this.isCacheValid(entry)) {
        delete cache[key];
        removedCount++;
      }
    });

    if (removedCount > 0) {
      this.setCache(cache);
      console.log(`🧹 Cleanup complete: Removed ${removedCount} expired entries (${originalCount - removedCount} remaining)`);
    } else {
      console.log('🧹 Cleanup complete: No expired entries found');
    }
  }
}

// Export singleton instance
export const bookingCache = new BookingCacheService(); 