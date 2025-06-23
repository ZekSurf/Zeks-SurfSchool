import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { bookingService } from '@/lib/bookingService';
import { supabaseStaffService } from '@/lib/supabaseStaffService';
import { discountService } from '@/lib/discountService';
import { CompletedBooking } from '@/types/booking';
import { supabase } from '@/lib/supabase';

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
  console.log('🔔 Stripe webhook received!', {
    method: req.method,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    hasSignature: !!req.headers['stripe-signature']
  });

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

  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 Processing Stripe event:', event.type);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Processing payment_intent.succeeded');
        await handleSuccessfulPayment(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ Processing payment_intent.payment_failed');
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
  console.log('🚀 Starting handleSuccessfulPayment function');
  
  const { metadata } = paymentIntent;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('💳 Payment Intent metadata keys:', Object.keys(metadata));
    console.log('🔑 Has bookingRef:', !!metadata.bookingRef);
  }

  // Fetch booking details from database using bookingRef
  let bookingDetails = [];
  if (metadata.bookingRef) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('📋 Looking up booking details from database, ref:', metadata.bookingRef);
    }
    
    try {
      const { data, error } = await supabase
        .from('temp_bookings')
        .select('*')
        .eq('id', metadata.bookingRef)
        .single();

      if (error) {
        console.error('Error fetching booking details:', error);
        throw new Error('Failed to fetch booking details from database');
      }

      if (!data || !data.items) {
        console.error('No booking items found in database, data:', data);
        throw new Error('No booking items found in database');
      }

      bookingDetails = data.items;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📋 Successfully retrieved booking details from database:', {
          itemCount: bookingDetails.length,
          firstItemKeys: bookingDetails[0] ? Object.keys(bookingDetails[0]) : [],
          firstItem: bookingDetails[0]
        });
      }
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

  // Create the formatted booking data for n8n
  const bookingData = {
    paymentIntentId: paymentIntent.id,
    confirmationNumber: confirmationNumber,
    amount: paymentIntent.amount / 100, // Convert from cents (final amount after discount)
    currency: paymentIntent.currency,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    customerPhone: metadata.customerPhone,
    wetsuitSize: firstBooking.wetsuitSize || metadata.wetsuitSize || '',
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
      date: new Date(startDateTime).toISOString().split('T')[0], // Extract date from startTime
      slotId: firstBooking.slotId || `fallback-${Date.now()}`, // Use actual slot ID or fallback
      startTime: startDateTime,
      endTime: endDateTime,
      label: "Good", // Default label - you can enhance this based on conditions
      price: firstBooking.price,
      openSpaces: originalOpenSpaces, // Original cached open spaces value
      available: originalAvailable // Original cached availability value
    },
    timestamp: new Date().toISOString()
  };

  // SECURITY: Only log booking details in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('📊 Booking data payload structure:', {
      paymentIntentId: bookingData.paymentIntentId,
      confirmationNumber: bookingData.confirmationNumber,
      customerName: bookingData.customerName,
      lessonsBooked: bookingData.lessonsBooked,
      slotDataKeys: Object.keys(bookingData.slotData),
      totalFields: Object.keys(bookingData).length
    });
  }

  // Send to your n8n workflow
  const n8nWebhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔗 N8N webhook URL configured:', !!n8nWebhookUrl);
    if (n8nWebhookUrl) {
      console.log('🔗 N8N webhook URL domain:', new URL(n8nWebhookUrl).hostname);
    }
  }
  
  if (!n8nWebhookUrl) {
    console.error('N8N webhook URL not configured');
    throw new Error('N8N webhook URL not configured');
  }

  // Create basic auth header
  const username = process.env.N8N_WEBHOOK_USERNAME;
  const password = process.env.N8N_WEBHOOK_PASSWORD;
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Sending webhook to n8n...');
    console.log('🔐 Auth configured:', !!username && !!password);
    console.log('📦 Payload size:', JSON.stringify(bookingData).length, 'bytes');
  }

  const response = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: JSON.stringify(bookingData),
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('📡 N8N response status:', response.status);
    console.log('📡 N8N response headers:', Object.fromEntries(response.headers.entries()));
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send data to n8n:', response.status, errorText);
    if (process.env.NODE_ENV !== 'production') {
      console.error('📦 Failed payload was:', JSON.stringify(bookingData, null, 2));
    }
    throw new Error(`Failed to send to n8n: ${response.status}`);
  }

  const responseText = await response.text();
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Successfully sent booking data to n8n');
    console.log('📡 N8N response body:', responseText);
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
        console.log('✅ Booking saved to Supabase successfully!');
        // SECURITY: Removed confirmation number logging - contains booking data
      }
      
      // Send push notification to staff devices
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('📱 Sending push notification to staff...');
        }
        
        // Format date and time for notification
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
  
  // Cache invalidation only (no fresh fetch to avoid triggering time slots webhook)
  try {
    const bookingDate = new Date(startDateTime).toISOString().split('T')[0]; // Extract date from startTime
    await bookingService.invalidateCacheForBooking(bookingDate);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Cache invalidated for booking date');
    }
  } catch (error) {
    console.error('❌ Error invalidating booking cache:', error);
    // Don't throw error here - cache clearing failure shouldn't break webhook
  }

  // Clean up temporary booking record after successful processing
  if (metadata.bookingRef) {
    try {
      await supabase
        .from('temp_bookings')
        .delete()
        .eq('id', metadata.bookingRef);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Temporary booking record cleaned up');
      }
    } catch (error) {
      console.error('❌ Error cleaning up temporary booking:', error);
      // Don't throw error here - cleanup failure shouldn't break webhook
    }
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  // Clean up temporary booking record on payment failure
  if (metadata.bookingRef) {
    try {
      await supabase
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