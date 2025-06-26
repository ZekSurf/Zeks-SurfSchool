import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { waiverService } from '@/lib/waiverService';

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
    const { amount, currency = 'usd', customerInfo, items, discountInfo, waiverDataArray } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!customerInfo?.email) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    // Get wetsuit size from localStorage contact info (if available)
    const contactInfo = req.body.contactInfo || {};

    // Store booking details in database instead of Stripe metadata
    let bookingReference = null;
    if (items && items.length > 0) {
      const bookingData = {
        items: items.map((item: any) => ({
          beach: item.beach,
          startTime: item.startTime,
          endTime: item.endTime,
          isPrivate: item.isPrivateLesson,
          price: item.price,
          wetsuitSize: item.wetsuitSize || contactInfo.wetsuitSize || '',
          slotId: item.slotId,
          openSpaces: item.openSpaces,
          available: item.available,
        })),
        customer_info: customerInfo,
        contact_info: contactInfo,
        discount_info: discountInfo,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      // Store in Supabase temporary bookings table (using public client temporarily)
      try {
        const { data, error } = await supabase
          .from('temp_bookings')
          .insert(bookingData)
          .select()
          .single();

        if (error) {
          console.error('Error storing booking data:', error);
          return res.status(500).json({ 
            error: 'Failed to store booking data. Please try again.' 
          });
        }

        bookingReference = data.id;
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ 
          error: 'Database connection failed. Please try again.' 
        });
      }
    }

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

    // Create payment intent with minimal metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      customer: customer.id,
      payment_method_types: ['card'], // Only allow card payments
      metadata: {
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        wetsuitSize: contactInfo.wetsuitSize || '',
        specialRequests: contactInfo.specialRequests || '',
        itemCount: items?.length || 0,
        bookingRef: bookingReference, // Just store the database reference
        // Store discount information in metadata
        ...(discountInfo && {
          discountCode: discountInfo.code,
          discountType: discountInfo.type,
          discountAmount: discountInfo.amount.toString(),
          originalAmount: (amount + discountInfo.discountAmount).toString(),
        }),
      },
    });

    // Save waiver signatures for all lessons if waiver data is provided
    if (waiverDataArray && Array.isArray(waiverDataArray) && waiverDataArray.length > 0 && items && items.length > 0) {
      try {
        const clientInfo = waiverService.getClientInfo(req);
        
        // Save a waiver signature for each lesson
        for (const waiverData of waiverDataArray) {
          // Find the matching item for this waiver's slot ID
          const matchingItem = items.find((item: any) => item.slotId === waiverData.slotId);
          
          if (matchingItem && waiverData.slotId) {
            const waiverResult = await waiverService.storeTemporaryWaiverSignature({
              slotId: waiverData.slotId,
              paymentIntentId: paymentIntent.id,
              signerName: waiverData.guardianName || waiverData.participantName,
              participantName: waiverData.participantName,
              guardianName: waiverData.guardianName,
              isMinor: !!waiverData.guardianName,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone,
              emergencyContactName: waiverData.emergencyContactName,
              emergencyContactPhone: waiverData.emergencyContactPhone,
              medicalConditions: waiverData.medicalConditions,
              ipAddress: clientInfo.ip_address,
              userAgent: clientInfo.user_agent
            });

            if (!waiverResult.success) {
              console.error(`Failed to save waiver signature for slot ${waiverData.slotId}:`, waiverResult.error);
              // Don't fail the payment intent creation, just log the error
            }
          }
        }
      } catch (waiverError) {
        console.error('Error saving waiver signatures:', waiverError);
        // Don't fail the payment intent creation
      }
    }

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        return res.status(500).json({ 
          error: 'Server configuration error. Please contact support.' 
        });
      }
    }
    
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
} 