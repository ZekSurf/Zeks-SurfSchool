import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all bookings from database
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message 
      });
    }

    // Get count by status
    const statusCounts = {
      confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
      completed: bookings?.filter(b => b.status === 'completed').length || 0,
      cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
    };

    // Get current week range
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // First day is Sunday
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startDateStr = startOfWeek.toISOString().split('T')[0];
    const endDateStr = endOfWeek.toISOString().split('T')[0];
    
    const currentWeekBookings = bookings?.filter(b => 
      b.lesson_date >= startDateStr && b.lesson_date <= endDateStr
    ) || [];

    // Get cache entries from time_slots_cache table
    const { data: cacheEntries, error: cacheError } = await supabase
      .from('time_slots_cache')
      .select('*')
      .order('created_at', { ascending: false });

    if (cacheError) {
      console.error('Cache table error:', cacheError);
    }

    // Process cache entries for display
    const processedCacheEntries = (cacheEntries || []).map(entry => ({
      cache_key: entry.cache_key,
      beach: entry.beach,
      date: entry.date,
      created_at: entry.created_at,
      expires_at: entry.expires_at,
      is_expired: new Date() > new Date(entry.expires_at),
      slots_count: entry.data?.slots?.length || 0,
      has_data: !!entry.data
    }));

    const debugData = {
      bookings: {
        total: bookings?.length || 0,
        statusCounts,
        currentWeekRange: {
          start: startDateStr,
          end: endDateStr
        },
        currentWeekBookings: currentWeekBookings.length,
        allBookings: bookings?.map(b => ({
          id: b.id,
          customer_name: b.customer_name,
          lesson_date: b.lesson_date,
          start_time: b.start_time,
          beach: b.beach,
          status: b.status,
          created_at: b.created_at
        })) || []
      },
      cache: {
        total_entries: cacheEntries?.length || 0,
        valid_entries: processedCacheEntries.filter(e => !e.is_expired).length,
        expired_entries: processedCacheEntries.filter(e => e.is_expired).length,
        entries: processedCacheEntries,
        cache_error: cacheError ? cacheError.message : null
      },
      debug_info: {
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        current_date: now.toISOString().split('T')[0]
      }
    };

    // Log to console for immediate debugging
    console.log('🔍 BOOKING DEBUG DATA:');
    console.log('📊 Total bookings:', debugData.bookings.total);
    console.log('📅 Current week bookings:', debugData.bookings.currentWeekBookings);
    console.log('💾 Cache entries:', debugData.cache.total_entries);
    console.log('✅ Valid cache entries:', debugData.cache.valid_entries);
    console.log('❌ Expired cache entries:', debugData.cache.expired_entries);
    
    return res.status(200).json(debugData);
  } catch (error) {
    console.error('Debug API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 