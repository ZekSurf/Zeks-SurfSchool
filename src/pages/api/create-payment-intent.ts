import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { amount, currency = 'usd', customerInfo, items, discountInfo } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!customerInfo?.email) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    // Get wetsuit size from localStorage contact info (if available)
    const contactInfo = req.body.contactInfo || {};

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customerInfo.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
      });
    }

    // Calculate the actual amount (convert to cents for Stripe)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      customer: customer.id,
      payment_method_types: ['card'], // Only allow card payments
      metadata: {
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        wetsuitSize: contactInfo.wetsuitSize || '', // Add wetsuit size to metadata
        specialRequests: contactInfo.specialRequests || '',
        itemCount: items?.length || 0,
        // Store discount information in metadata
        ...(discountInfo && {
          discountCode: discountInfo.code,
          discountType: discountInfo.type,
          discountAmount: discountInfo.amount.toString(),
          originalAmount: (amount + discountInfo.discountAmount).toString(),
        }),
        // Store booking details in metadata
        ...(items && {
          bookingDetails: JSON.stringify(items.map((item: any) => ({
            beach: item.beach,
            date: item.date,
            time: item.time,
            isPrivate: item.isPrivateLesson,
            price: item.price,
            wetsuitSize: item.wetsuitSize || contactInfo.wetsuitSize || '', // Include wetsuit size
            slotId: item.slotId, // Include the actual slot ID
            openSpaces: item.openSpaces, // Include cached openSpaces value
            available: item.available, // Include cached available value
          }))),
        }),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
} 