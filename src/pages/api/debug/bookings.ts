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

    // Get current week range for debugging
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const currentWeekBookings = bookings?.filter(booking => {
      const bookingDate = new Date(booking.lesson_date);
      return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    }) || [];

    // Create sample date strings for comparison
    const sampleDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      sampleDates.push({
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dateISO: date.toISOString().split('T')[0],
        dateObj: date.toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      debug: {
        totalBookings: bookings?.length || 0,
        statusCounts,
        currentWeekRange: {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0]
        },
        currentWeekBookings: currentWeekBookings.length,
        sampleWeekDates: sampleDates,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      rawBookingsFromDB: bookings?.map(booking => ({
        id: booking.id,
        confirmationNumber: booking.confirmation_number,
        customerName: booking.customer_name,
        beach: booking.beach,
        lessonDate: booking.lesson_date,
        lessonDateType: typeof booking.lesson_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        createdAt: booking.created_at
      })) || [],
      transformedBookings: bookings?.map(booking => ({
        id: booking.id,
        confirmationNumber: booking.confirmation_number,
        customerName: booking.customer_name,
        beach: booking.beach,
        date: booking.lesson_date, // This is what gets compared in the calendar
        dateType: typeof booking.lesson_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        createdAt: booking.created_at
      })) || []
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 