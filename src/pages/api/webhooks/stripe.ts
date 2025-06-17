import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { bookingService } from '@/lib/bookingService';

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
    console.log('Webhook secret exists:', !!webhookSecret);
    console.log('Signature exists:', !!sig);
    
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    event = stripe.webhooks.constructEvent(buf, sig as string, webhookSecret);
    console.log('Webhook signature verified successfully');
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      
      try {
        await handleSuccessfulPayment(paymentIntent);
      } catch (error) {
        console.error('Error handling successful payment:', error);
        return res.status(500).json({ error: 'Failed to process payment success' });
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      
      try {
        await handleFailedPayment(failedPayment);
      } catch (error) {
        console.error('Error handling failed payment:', error);
        // Don't return error for failed payments, just log
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing successful payment:', paymentIntent.id);
  const { metadata } = paymentIntent;
  
  // Parse booking details from metadata
  const bookingDetails = metadata.bookingDetails ? JSON.parse(metadata.bookingDetails) : [];
  const firstBooking = bookingDetails[0]; // Get first lesson details
  
  // Generate confirmation number
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const confirmationNumber = `SURF-${timestamp}-${random}`;
  
  // Parse time range and create proper datetime strings
  const parseTimeSlot = (timeString: string, dateString: string) => {
    // timeString format: "9:00 AM - 10:00 AM"
    const [startTimeStr, endTimeStr] = timeString.split(' - ');
    
    // Convert date to proper format
    const bookingDate = new Date(dateString);
    const dateOnly = bookingDate.toISOString().split('T')[0]; // Get YYYY-MM-DD
    
    // Parse start time
    const startTime = parseTime(startTimeStr);
    const endTime = parseTime(endTimeStr);
    
    // Create ISO datetime strings (Pacific timezone)
    const startDateTime = `${dateOnly}T${startTime}:00-07:00`;
    
    // Add 30 minutes to end time for buffer
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes + 30, 0, 0);
    const bufferedEndTime = endDate.toTimeString().slice(0, 5);
    const endDateTime = `${dateOnly}T${bufferedEndTime}:00-07:00`;
    
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
  
  // Create the formatted booking data for n8n
  const bookingData = {
    paymentIntentId: paymentIntent.id,
    confirmationNumber: confirmationNumber,
    amount: paymentIntent.amount / 100, // Convert from cents
    currency: paymentIntent.currency,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    customerPhone: metadata.customerPhone,
    isPrivate: firstBooking.isPrivate || false,
    lessonsBooked: bookingDetails.length,
    slotData: {
      beach: firstBooking.beach,
      date: new Date(firstBooking.date).toISOString().split('T')[0], // YYYY-MM-DD format
      slotId: `slot-${Math.floor(Math.random() * 10) + 1}`, // Generate slot ID
      startTime: startDateTime,
      endTime: endDateTime,
      label: "Good", // Default label - you can enhance this based on conditions
      price: firstBooking.price,
      openSpaces: 1,
      available: true
    },
    timestamp: new Date().toISOString()
  };

  console.log('Booking data prepared for n8n:', JSON.stringify(bookingData, null, 2));

  // Send to your n8n workflow
  const n8nWebhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL;
  console.log('N8N webhook URL exists:', !!n8nWebhookUrl);
  
  if (!n8nWebhookUrl) {
    console.error('N8N webhook URL not configured');
    throw new Error('N8N webhook URL not configured');
  }

  const response = await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send data to n8n:', response.status, errorText);
    throw new Error(`Failed to send to n8n: ${response.status}`);
  }

  console.log('Successfully sent booking data to n8n');
  
  // Clear booking cache for this date and beach to ensure fresh availability data
  try {
    const bookingDate = new Date(firstBooking.date);
    bookingService.clearCacheForDate(bookingDate, firstBooking.beach);
    console.log(`✅ Cache cleared for ${firstBooking.beach} on ${bookingDate.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error('Error clearing booking cache:', error);
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

  console.log('Payment failed:', failureData);

  // Optionally send failure notification to n8n
  const n8nFailureWebhookUrl = process.env.N8N_FAILURE_WEBHOOK_URL;
  if (n8nFailureWebhookUrl) {
    try {
      await fetch(n8nFailureWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(failureData),
      });
    } catch (error) {
      console.error('Failed to send failure notification to n8n:', error);
    }
  }
} 