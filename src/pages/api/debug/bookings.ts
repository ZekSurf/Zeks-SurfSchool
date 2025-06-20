import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // SECURITY: Disable debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end('Method Not Allowed');
    }

    try {
      // SECURITY: Only allow in development
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
          success: false,
          error: 'Debug endpoints only available in development'
        });
      }

      // Get bookings from Supabase
      let bookingDebugData: { total: number, currentWeekBookings: any[], error: string | null } = { total: 0, currentWeekBookings: [], error: null };
      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          bookingDebugData.error = error.message as string;
        } else {
          bookingDebugData.total = bookings?.length || 0;
          
          // Get current week bookings
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
          
          const currentWeekBookings = bookings?.filter(booking => {
            const bookingDate = new Date(booking.lesson_date);
            return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
          }) || [];
          
          bookingDebugData.currentWeekBookings = currentWeekBookings;
        }
      } catch (error) {
        console.error('Error fetching bookings from Supabase:', error);
        bookingDebugData.error = 'Failed to fetch bookings';
      }

      // Get cache information from time_slots_cache table
      let cacheDebugData: { total_entries: number, valid_entries: number, expired_entries: number, recent_entries: any[], error: string | null } = { total_entries: 0, valid_entries: 0, expired_entries: 0, recent_entries: [], error: null };
      try {
        const { data: cacheEntries, error: cacheError } = await supabase
          .from('time_slots_cache')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (cacheError) {
          console.error('Cache table error:', cacheError);
          cacheDebugData.error = cacheError.message;
        } else {
          const now = new Date();
          const validEntries = cacheEntries?.filter(entry => new Date(entry.expires_at) > now) || [];
          const expiredEntries = cacheEntries?.filter(entry => new Date(entry.expires_at) <= now) || [];

          cacheDebugData = {
            total_entries: cacheEntries?.length || 0,
            valid_entries: validEntries.length,
            expired_entries: expiredEntries.length,
            recent_entries: cacheEntries?.slice(0, 5).map(entry => ({
              cache_key: entry.cache_key,
              beach: entry.beach,
              date: entry.date,
              created_at: entry.created_at,
              expires_at: entry.expires_at,
              is_expired: new Date(entry.expires_at) <= now
            })) || [],
            error: null
          };
        }
      } catch (error) {
        console.error('Error fetching cache data:', error);
        cacheDebugData.error = 'Failed to fetch cache data';
      }

      // Get push subscription count
      let pushDebugData: { total_subscriptions: number, error: string | null } = { total_subscriptions: 0, error: null };
      try {
        const { count, error: pushError } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true });

        if (pushError) {
          pushDebugData.error = pushError.message;
        } else {
          pushDebugData.total_subscriptions = count || 0;
        }
      } catch (error) {
        pushDebugData.error = 'Failed to fetch push subscription count';
      }

      // Get staff PIN count
      let staffDebugData: { total_staff: number, active_staff: number, error: string | null } = { total_staff: 0, active_staff: 0, error: null };
      try {
        const { data: allStaff, error: staffError } = await supabase
          .from('staff_pins')
          .select('*');

        if (staffError) {
          staffDebugData.error = staffError.message;
        } else {
          staffDebugData.total_staff = allStaff?.length || 0;
          staffDebugData.active_staff = allStaff?.filter(staff => staff.is_active)?.length || 0;
        }
      } catch (error) {
        staffDebugData.error = 'Failed to fetch staff data';
      }

      const debugData = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        bookings: bookingDebugData,
        cache: cacheDebugData,
        pushNotifications: pushDebugData,
        staff: staffDebugData
      };

      console.log('🔍 BOOKING DEBUG DATA:');
      console.log('📊 Total bookings:', debugData.bookings.total);
      console.log('📅 Current week bookings:', debugData.bookings.currentWeekBookings);
      console.log('💾 Cache entries:', debugData.cache.total_entries);
      console.log('✅ Valid cache entries:', debugData.cache.valid_entries);
      console.log('❌ Expired cache entries:', debugData.cache.expired_entries);

      return res.status(200).json({
        success: true,
        data: debugData
      });

    } catch (error) {
      console.error('Debug API error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
} 