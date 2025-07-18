import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { bookingService } from '@/lib/bookingService';
import { supabaseStaffService } from '@/lib/supabaseStaffService';
import { discountService } from '@/lib/discountService';
import { waiverService } from '@/lib/waiverService';
import { CompletedBooking } from '@/types/booking';
import { getSupabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      console.error('Missing stripe-signature header');
      return res.status(400).json({ error: 'Missing signature' });
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ 
      error: err instanceof Error ? err.message : 'Signature verification failed' 
    });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        // SECURITY: Removed event type logging - may contain sensitive data
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Unhandled event type: ${event.type}`);
        }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Webhook processing failed' 
    });
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  if (process.env.NODE_ENV !== 'production') {
    // SECURITY: Removed payment intent ID logging - contains payment data
  }

  // Fetch booking details from database using bookingRef
  let bookingDetails = [];
  if (metadata.bookingRef) {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from('temp_bookings')
        .select('*')
        .eq('id', metadata.bookingRef)
        .single();

      if (error) {
        console.error('Error fetching booking details:', error);
        throw new Error('Failed to fetch booking details from database');
      }

      if (!data || !data.items) {
        throw new Error('No booking items found in database');
      }

      bookingDetails = data.items;
    } catch (error) {
      console.error('Database lookup failed:', error);
      throw new Error('Failed to retrieve booking details');
    }
  } else {
    // Fallback: try to parse from metadata (for backward compatibility)
    try {
      bookingDetails = JSON.parse(metadata.bookingDetails || '[]');
      
      // Handle both old and new compact field formats for backward compatibility
      if (bookingDetails.length > 0 && bookingDetails[0].b) {
        // Map compact field names back to full names
        bookingDetails = bookingDetails.map((item: any) => ({
          beach: item.b,
          startTime: item.st,
          endTime: item.et,
          isPrivate: item.p === 1,
          price: item.pr,
          wetsuitSize: item.w,
          slotId: item.s,
          openSpaces: item.os,
          available: item.a === 1,
        }));
      }
    } catch (error) {
      console.error('Failed to parse booking details from metadata:', error);
      throw new Error('No booking details found');
    }
  }
  
  // Generate confirmation number
  const confirmationNumber = `SURF-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(-4).toUpperCase()}`;

  if (!bookingDetails.length) {
    throw new Error('No booking details found');
  }

  const firstBooking = bookingDetails[0];
  
  // Use the original backend startTime and endTime from the slot data
  // These contain the full 1.5-hour duration needed for instructor setup/drive time
  const startDateTime = firstBooking.startTime;
  const endDateTime = firstBooking.endTime;
  
  // Get original cached openSpaces value (before booking)
  const isPrivateLesson = firstBooking.isPrivate || false;
  const originalOpenSpaces = firstBooking.openSpaces || 4; // Use the cached value from booking data
  const originalAvailable = firstBooking.available !== undefined ? firstBooking.available : true;
  
  // Note: Slot availability updates are handled by n8n workflow
  // No need to call booking service here as it would trigger the time slots webhook unnecessarily
  
  // Handle discount information if present
  let discountInfo = null;
  if (metadata.discountCode) {
    discountInfo = {
      code: metadata.discountCode,
      type: metadata.discountType,
      amount: parseFloat(metadata.discountAmount || '0'),
      originalAmount: parseFloat(metadata.originalAmount || '0'),
      discountSavings: parseFloat(metadata.originalAmount || '0') - (paymentIntent.amount / 100)
    };
    
    // Track discount usage (this was already done during validation, but we can log it)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Discount applied: ${discountInfo.code} - $${discountInfo.discountSavings} saved`);
    }
  }

  // Create slot data array for all lessons
  const allSlotData = bookingDetails.map((booking: any) => ({
    beach: booking.beach,
    date: new Date(booking.startTime).toISOString().split('T')[0], // Extract date from startTime
    slotId: booking.slotId || `fallback-${Date.now()}`, // Use actual slot ID or fallback
    startTime: booking.startTime,
    endTime: booking.endTime,
    label: "Good", // Default label - you can enhance this based on conditions
    price: booking.price,
    openSpaces: booking.openSpaces || 4, // Original cached open spaces value
    available: booking.available !== undefined ? booking.available : true, // Original cached availability value
    wetsuitSize: booking.wetsuitSize || metadata.wetsuitSize || ''
  }));

  // Create the formatted booking data for n8n
  const bookingData = {
    paymentIntentId: paymentIntent.id,
    confirmationNumber: confirmationNumber,
    amount: paymentIntent.amount / 100, // Convert from cents (final amount after discount)
    currency: paymentIntent.currency,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    customerPhone: metadata.customerPhone,
    specialRequests: metadata.specialRequests || '',
    discountApplied: !!discountInfo,
    discountCode: discountInfo?.code || null,
    discountType: discountInfo?.type || null,
    discountAmount: discountInfo?.amount || 0,
    discountSavings: discountInfo?.discountSavings || 0,
    isPrivate: isPrivateLesson,
    lessonsBooked: bookingDetails.length,
    // Send all slot data as slotData array (for n8n processing)
    slotData: allSlotData,
    timestamp: new Date().toISOString()
  };

  // SECURITY: Only log booking details in development mode
  if (process.env.NODE_ENV !== 'production') {
    // SECURITY: Removed customer data logging - contains PII
  }

  // Send to your n8n workflow
  const n8nWebhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL;
  // console.log('N8N webhook URL exists:', !!n8nWebhookUrl); // REMOVED: Security risk
  
  if (!n8nWebhookUrl) {
    console.error('N8N webhook URL not configured');
    throw new Error('N8N webhook URL not configured');
  }

  // Create basic auth header
  const username = process.env.N8N_WEBHOOK_USERNAME;
  const password = process.env.N8N_WEBHOOK_PASSWORD;
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  const response = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send data to n8n:', response.status, errorText);
    throw new Error(`Failed to send to n8n: ${response.status}`);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('Successfully sent booking data to n8n');
  }

  // IMPORTANT: n8n webhook call succeeded - everything after this point should not cause Stripe retries
  
  // Save completed booking to Supabase for staff portal
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Attempting to save booking to Supabase...');
      // SECURITY: Removed customer data logging - contains PII
    }
    
    const supabaseResult = await supabaseStaffService.saveBookingFromStripeData(bookingData);
    
    if (supabaseResult.success) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ ${supabaseResult.bookings?.length || 1} booking(s) saved to Supabase successfully!`);
        // SECURITY: Removed confirmation number logging - contains booking data
      }
      
      // Store booking UUIDs for confirmation page
      const savedBookings = supabaseResult.bookings || [supabaseResult.booking!];
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Booking UUIDs available for confirmation:', savedBookings.map(b => b.id));
      }
      
      // Send push notification to staff devices
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('📱 Sending push notification to staff...');
        }
        
        // Format date and time for notification (use first lesson)
        const lessonDate = new Date(startDateTime).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        const lessonTime = new Date(startDateTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        // Create notification message based on number of lessons
        const lessonCount = bookingDetails.length;
        const notificationTitle = lessonCount > 1 
          ? `${lessonCount} New Surf Lessons Booked!`
          : 'New Surf Lesson Booked!';
        const notificationBody = lessonCount > 1
          ? `${metadata.customerName} has booked ${lessonCount} lessons starting at ${firstBooking.beach}!`
          : `${metadata.customerName} has booked a lesson at ${firstBooking.beach}!`;
        
        const notificationPayload = {
          title: notificationTitle,
          body: notificationBody,
          icon: '/zek-surf-icon.ico',
          tag: 'new-booking',
          bookingId: savedBookings[0].id,
          customerName: metadata.customerName,
          beach: firstBooking.beach,
          lessonDate: lessonDate,
          lessonTime: lessonTime,
          lessonCount: lessonCount,
          data: {
            url: '/staff-portal-a8f3e2b1c9d7e4f6',
            confirmationNumber: confirmationNumber,
            bookingId: savedBookings[0].id,
            allBookingIds: savedBookings.map(b => b.id)
          }
        };

        const pushUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/push/send-notification`;
        // SECURITY: Only log push URL in development
        if (process.env.NODE_ENV !== 'production') {
          // SECURITY: Removed URL logging - exposes system configuration
          // SECURITY: Removed notification payload logging - contains customer data
        }

        const pushResponse = await fetch(pushUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationPayload),
        });

        if (process.env.NODE_ENV !== 'production') {
          console.log('📱 Push response status:', pushResponse.status);
          console.log('📱 Push response statusText:', pushResponse.statusText);
        }

        if (pushResponse.ok) {
          const pushResult = await pushResponse.json();
          if (process.env.NODE_ENV !== 'production') {
            console.log('✅ Push notification sent successfully:', pushResult.message);
            // SECURITY: Removed notification stats logging - may contain sensitive data
          }
        } else {
          const pushError = await pushResponse.text();
          console.error('❌ Failed to send push notification:', pushError);
          // SECURITY: Only log response headers in development
          if (process.env.NODE_ENV !== 'production') {
            // SECURITY: Removed headers logging - may expose system info
          }
        }
      } catch (pushError) {
        console.error('💥 Exception while sending push notification:', pushError);
        // Don't throw error here - push notification failure shouldn't break webhook
      }
    } else {
      console.error('❌ Failed to save booking to Supabase:');
      // SECURITY: Only log error details in development - may contain sensitive data
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error details:', supabaseResult.error);
      }
    }
  } catch (error) {
    console.error('💥 Exception while saving booking to Supabase:');
    // SECURITY: Only log exception details in development - may contain sensitive data
    if (process.env.NODE_ENV !== 'production') {
      console.error('Exception details:', error);
    }
    // Don't throw error here - staff system failure shouldn't break webhook
  }
  
  // Cache invalidation for ALL booked slots (no fresh fetch to avoid triggering time slots webhook)
  try {
    // Get unique date/beach combinations from all booked slots
    const uniqueDateBeachCombos = new Set<string>();
    allSlotData.forEach((slot: any) => {
      const combo = `${slot.date}_${slot.beach}`;
      uniqueDateBeachCombos.add(combo);
    });
    
    // Clear cache for each unique date/beach combination
    for (const combo of Array.from(uniqueDateBeachCombos)) {
      const [date, beach] = combo.split('_');
      await bookingService.clearCacheForDate(new Date(date), beach);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ Cache invalidated for ${beach} on ${date}`);
      }
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Cache invalidated for ${uniqueDateBeachCombos.size} date/beach combinations`);
    }
  } catch (error) {
    console.error('❌ Error invalidating booking cache:', error);
    // Don't throw error here - cache clearing failure shouldn't break webhook
  }

  // Finalize all waiver signatures with booking confirmation number
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('📝 Finalizing waiver signatures...');
    }

    const waiverResult = await waiverService.finalizeAllWaiverSignatures(
      paymentIntent.id,
      confirmationNumber
    );

    if (waiverResult.success) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ ${waiverResult.count} waiver signature(s) finalized successfully`);
      }
    } else {
      console.error('❌ Failed to finalize waiver signatures:', waiverResult.error);
      // Don't throw error - booking should still succeed even if waiver finalization fails
    }
  } catch (error) {
    console.error('💥 Exception while finalizing waiver signatures:', error);
    // Don't throw error here - waiver failure shouldn't break webhook
  }

}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  // Clean up temporary booking record on payment failure
  if (metadata.bookingRef) {
    try {
      await getSupabaseAdmin()
        .from('temp_bookings')
        .delete()
        .eq('id', metadata.bookingRef);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Temporary booking record cleaned up after payment failure');
      }
    } catch (error) {
      console.error('❌ Error cleaning up temporary booking after failure:', error);
    }
  }
  
  // Notify about failed payment (optional)
  const failureData = {
    paymentIntentId: paymentIntent.id,
    customerEmail: metadata.customerEmail,
    status: 'failed',
    failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
    timestamp: new Date().toISOString(),
  };

  // SECURITY: Only log failure details in development
  if (process.env.NODE_ENV !== 'production') {
    // SECURITY: Removed failure data logging - contains payment/customer info
  }

  // Optionally send failure notification to n8n
  const n8nFailureWebhookUrl = process.env.N8N_FAILURE_WEBHOOK_URL;
  if (n8nFailureWebhookUrl) {
    try {
      // Create basic auth header for failure webhook
      const username = process.env.N8N_WEBHOOK_USERNAME;
      const password = process.env.N8N_WEBHOOK_PASSWORD;
      const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

      await fetch(n8nFailureWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify(failureData),
      });
    } catch (error) {
      console.error('Failed to send failure notification to n8n:', error);
    }
  }
} 