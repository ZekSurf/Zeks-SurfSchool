import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { bookingService } from '@/lib/bookingService';
import { supabaseStaffService } from '@/lib/supabaseStaffService';
import { discountService } from '@/lib/discountService';
import { CompletedBooking } from '@/types/booking';

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
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // console.log('Webhook secret exists:', !!webhookSecret); // REMOVED: Security risk
    // console.log('Signature exists:', !!sig); // REMOVED: Security risk
    
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    event = stripe.webhooks.constructEvent(buf, sig as string, webhookSecret);
    // console.log('Webhook signature verified successfully'); // REMOVED: Security risk
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // Only log payment ID, not full object
      if (process.env.NODE_ENV !== 'production') {
        // SECURITY: Removed payment intent ID logging - contains payment data
      }
      
      try {
        await handleSuccessfulPayment(paymentIntent);
      } catch (error) {
        console.error('Error handling successful payment:', error);
        return res.status(500).json({ error: 'Failed to process payment success' });
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      // Only log payment ID, not full object
      if (process.env.NODE_ENV !== 'production') {
        // SECURITY: Removed payment intent ID logging - contains payment data
      }
      
      try {
        await handleFailedPayment(failedPayment);
      } catch (error) {
        console.error('Error handling failed payment:', error);
        // Don't return error for failed payments, just log
      }
      break;

    default:
      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Unhandled event type: ${event.type}`);
      }
  }

  res.json({ received: true });
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  if (process.env.NODE_ENV !== 'production') {
    // SECURITY: Removed payment intent ID logging - contains payment data
  }

  // Parse booking details from metadata
  const bookingDetails = JSON.parse(metadata.bookingDetails || '[]');
  
  // Generate confirmation number
  const confirmationNumber = `SURF-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(-4).toUpperCase()}`;

  if (!bookingDetails.length) {
    throw new Error('No booking details found in payment metadata');
  }

  const firstBooking = bookingDetails[0];
  
  // Helper function to parse time slot and convert to datetime
  const parseTimeSlot = (timeString: string, dateString: string) => {
    // e.g., "9:00 AM - 10:30 AM" or "9:00 - 10:30"
    const [startTime, endTime] = timeString.split(' - ');
    const dateOnly = new Date(dateString).toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Parse start time
    const startTimeFormatted = parseTime(startTime);
    const startDateTime = `${dateOnly}T${startTimeFormatted}:00-07:00`;
    
    // Parse end time properly (no buffer needed - lesson duration is already correct)
    const endTimeFormatted = parseTime(endTime);
    const endDateTime = `${dateOnly}T${endTimeFormatted}:00-07:00`;
    
    return { startDateTime, endDateTime };
  };
  
  // Helper function to parse "9:00 AM" format to "09:00"
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  // Parse the time slot
  const { startDateTime, endDateTime } = parseTimeSlot(firstBooking.time, firstBooking.date);
  
  // Calculate remaining open spaces based on booking type using bookingService
  const isPrivateLesson = firstBooking.isPrivate || false;
  let remainingOpenSpaces = 0;
  let isSlotStillAvailable = false;
  
  try {
    // Get accurate availability data from booking service
    const availabilityUpdate = await bookingService.updateSlotAvailability(
      firstBooking.beach,
      new Date(firstBooking.date).toISOString().split('T')[0],
      firstBooking.time,
      isPrivateLesson
    );
    
    if (availabilityUpdate) {
      remainingOpenSpaces = availabilityUpdate.openSpaces;
      isSlotStillAvailable = availabilityUpdate.available;
    } else {
      // Fallback to default calculation if service fails
      console.warn('Using fallback availability calculation');
      const defaultOpenSpaces = 4; // Default assumption
      remainingOpenSpaces = isPrivateLesson ? 0 : Math.max(0, defaultOpenSpaces - 1);
      isSlotStillAvailable = remainingOpenSpaces > 0;
    }
  } catch (error) {
    console.error('Error getting slot availability update:', error);
    // Fallback calculation
    const defaultOpenSpaces = 4;
    remainingOpenSpaces = isPrivateLesson ? 0 : Math.max(0, defaultOpenSpaces - 1);
    isSlotStillAvailable = remainingOpenSpaces > 0;
  }
  
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

  // Create the formatted booking data for n8n
  const bookingData = {
    paymentIntentId: paymentIntent.id,
    confirmationNumber: confirmationNumber,
    amount: paymentIntent.amount / 100, // Convert from cents (final amount after discount)
    currency: paymentIntent.currency,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    customerPhone: metadata.customerPhone,
    wetsuitSize: metadata.wetsuitSize || '',
    specialRequests: metadata.specialRequests || '',
    discountApplied: !!discountInfo,
    discountCode: discountInfo?.code || null,
    discountType: discountInfo?.type || null,
    discountAmount: discountInfo?.amount || 0,
    discountSavings: discountInfo?.discountSavings || 0,
    isPrivate: isPrivateLesson,
    lessonsBooked: bookingDetails.length,
    slotData: {
      beach: firstBooking.beach,
      date: new Date(firstBooking.date).toISOString().split('T')[0], // YYYY-MM-DD format
      slotId: firstBooking.slotId || `fallback-${Date.now()}`, // Use actual slot ID or fallback
      startTime: startDateTime,
      endTime: endDateTime,
      label: "Good", // Default label - you can enhance this based on conditions
      price: firstBooking.price,
      openSpaces: remainingOpenSpaces, // Updated open spaces after booking
      available: isSlotStillAvailable // Updated availability
    },
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
  
  // Save completed booking to Supabase for staff portal
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Attempting to save booking to Supabase...');
      // SECURITY: Removed customer data logging - contains PII
    }
    
    const supabaseResult = await supabaseStaffService.saveBookingFromStripeData(bookingData);
    
    if (supabaseResult.success) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Booking saved to Supabase successfully!');
        // SECURITY: Removed confirmation number logging - contains booking data
      }
      
      // Send push notification to staff devices
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('📱 Sending push notification to staff...');
        }
        
        // Format date and time for notification
        const lessonDate = new Date(firstBooking.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        const lessonTime = firstBooking.time.split(' - ')[0]; // Get start time only
        
        const notificationPayload = {
          title: 'New Surf Lesson Booked!',
          body: `${metadata.customerName} has booked a lesson at ${firstBooking.beach}!`,
          icon: '/zek-surf-icon.ico',
          tag: 'new-booking',
          bookingId: supabaseResult.booking?.id,
          customerName: metadata.customerName,
          beach: firstBooking.beach,
          lessonDate: lessonDate,
          lessonTime: lessonTime,
          data: {
            url: '/staff-portal-a8f3e2b1c9d7e4f6',
            confirmationNumber: confirmationNumber,
            bookingId: supabaseResult.booking?.id
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
  
  // Clear booking cache for this date and beach to ensure fresh availability data
  try {
    if (process.env.NODE_ENV !== 'production') {
      // SECURITY: Removed cache invalidation logging - may contain booking data
    }
    const bookingDate = new Date(firstBooking.date).toISOString().split('T')[0]; // YYYY-MM-DD format
    await bookingService.invalidateCacheForBooking(bookingDate);
    
    // Force a fresh fetch of the updated slot data to populate cache with new availability
    try {
      const bookingDateObj = new Date(firstBooking.date + 'T12:00:00');
      await bookingService.fetchAvailableSlots(firstBooking.beach, bookingDateObj, true);
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Cache refreshed with updated availability');
      }
    } catch (refreshError) {
      console.error('⚠️ Warning: Failed to refresh cache after booking:', refreshError);
      // Don't throw error here - cache refresh failure shouldn't break webhook
    }
    
    if (process.env.NODE_ENV !== 'production') {
      // SECURITY: Removed cache invalidation logging - may contain booking data
    }
  } catch (error) {
    console.error('❌ Error invalidating booking cache:', error);
    // Don't throw error here - cache clearing failure shouldn't break webhook
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
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