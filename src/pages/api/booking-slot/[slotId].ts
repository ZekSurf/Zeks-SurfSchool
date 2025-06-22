import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { BookingResponse, BookingSlot } from '@/types/booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }

  const { slotId } = req.query;

  if (!slotId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Slot ID is required' 
    });
  }

  if (typeof slotId !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid slot ID format' 
    });
  }

  // Basic format validation for slot ID
  if (slotId.length < 10 || !slotId.includes('-')) {
    console.warn(`Invalid slot ID format attempted: ${slotId.substring(0, 20)}...`);
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid slot ID format. Please use a valid booking link.' 
    });
  }

  // Check for obviously invalid characters or patterns
  if (!/^[a-zA-Z0-9\-_]+$/.test(slotId)) {
    console.warn(`Slot ID with invalid characters attempted: ${slotId.substring(0, 20)}...`);
    return res.status(400).json({ 
      success: false, 
      error: 'Slot ID contains invalid characters' 
    });
  }

  try {
    // Search through all cache entries to find the slot with the matching ID
    const { data: cacheEntries, error } = await supabase
      .from('time_slots_cache')
      .select('*')
      .gte('expires_at', new Date().toISOString()); // Only get non-expired entries

    if (error) {
      console.error('Error fetching cache entries:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch slot data' 
      });
    }

    if (!cacheEntries || cacheEntries.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No booking data available. Please try selecting a new time slot from the booking page.' 
      });
    }

    // Search through all cache entries to find the slot
    let foundSlot: BookingSlot | null = null;
    let foundCacheEntry: any = null;

    for (const entry of cacheEntries) {
      const bookingData = entry.data as BookingResponse;
      if (bookingData && bookingData.slots) {
        const slot = bookingData.slots.find((s: BookingSlot) => s.slotId === slotId);
        if (slot) {
          foundSlot = slot;
          foundCacheEntry = entry;
          break;
        }
      }
    }

    if (!foundSlot || !foundCacheEntry) {
      return res.status(404).json({ 
        success: false, 
        error: 'This booking slot is no longer available or has expired. Please select a new time slot.' 
      });
    }

    // Calculate available spaces
    const spacesAvailable = parseInt(foundSlot.openSpaces || '0');

    // Return the slot data with additional context
    return res.status(200).json({
      success: true,
      data: {
        // Slot-specific data
        slotId: foundSlot.slotId,
        startTime: foundSlot.startTime,
        endTime: foundSlot.endTime,
        price: foundSlot.price,
        available: foundSlot.available,
        availableSpaces: spacesAvailable,
        conditions: foundSlot.label,
        weather: foundSlot.sky,
        
        // Context data from cache entry
        beach: foundCacheEntry.beach,
        date: foundCacheEntry.date,
        
        // Formatted display data
        time: formatTimeSlot(foundSlot.startTime, foundSlot.endTime),
        formattedDate: new Date(foundCacheEntry.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }
    });

  } catch (error) {
    console.error('Error in slot lookup:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Helper function to format time slot display
function formatTimeSlot(startTime: string, endTime: string): string {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Subtract 30 minutes from the end time
    end.setMinutes(end.getMinutes() - 30);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles'
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  } catch (error) {
    console.error('Error formatting time slot:', error);
    return 'Time unavailable';
  }
} 