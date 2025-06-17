# Stripe Payment Integration Setup

This guide will help you configure Stripe payments for Zek's Surf School website.

## 🔧 Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Stripe Configuration
# Get these from your Stripe Dashboard (https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# n8n Webhook URLs
# URL where successful booking data should be sent after payment
N8N_BOOKING_WEBHOOK_URL=https://your-n8n-instance.com/webhook/booking-confirmed
# Optional: URL for failed payment notifications
N8N_FAILURE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/payment-failed

# Existing webhook URL for booking (keep this)
NEXT_PUBLIC_BOOKING_WEBHOOK_URL=https://cheeseman.app.n8n.cloud/webhook-test/00838f20-101f-4e94-9b6f-bb5bdc2e4e04
```

## 📋 Setup Steps

### 1. Get Stripe API Keys

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)
5. Paste them into your `.env.local` file

### 2. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your booking flow and add items to cart
3. Go to checkout and fill in customer information
4. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`
   - Use any future expiry date and any 3-digit CVC

### 3. Webhook Configuration (Essential for Google Calendar Integration)

Set up webhooks to handle payment confirmations and send data to n8n:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook signing secret and add it to your `.env.local` file

### 4. n8n Integration Setup

The webhook system automatically sends booking data to your n8n workflow:

**Data sent to n8n includes:**
```json
{
  "paymentIntentId": "pi_1234567890",
  "amount": 81.00,
  "currency": "usd",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "status": "confirmed",
  "bookingDetails": [
    {
      "beach": "Doheny State Beach",
      "date": "2024-12-15",
      "time": "10:00 AM",
      "isPrivate": false,
      "price": 75
    }
  ],
  "timestamp": "2024-12-10T15:30:00.000Z"
}
```

**Set up your n8n workflow to:**
1. Receive webhook data at your N8N_BOOKING_WEBHOOK_URL
2. Parse booking details (beach, date, time)
3. Create Google Calendar event
4. Send confirmation email
5. Update your booking database

## 🧪 Test Card Numbers

Use these test card numbers for testing different scenarios:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Visa - Success |
| 4000 0000 0000 0002 | Generic decline |
| 4000 0025 0000 3155 | Requires authentication |
| 4000 0000 0000 9995 | Insufficient funds |

- **Expiry**: Use any future date (e.g., 12/34)
- **CVC**: Use any 3-digit number (e.g., 123)
- **ZIP**: Use any 5-digit number (e.g., 12345)

## 🎯 Features Implemented

✅ **Secure Payment Processing**: Stripe Elements integration  
✅ **Customer Management**: Automatic customer creation/retrieval  
✅ **Order Summary**: Real-time tax calculation (8%)  
✅ **Multi-lesson Discounts**: Preserved in payment metadata  
✅ **Error Handling**: Comprehensive error messages  
✅ **Mobile Responsive**: Works on all devices  
✅ **Payment Confirmation**: Success page with payment details  

## 🔒 Security Features

- **PCI Compliance**: Stripe handles all card data securely
- **No Card Storage**: Card details never touch your server
- **Client-Side Validation**: Real-time form validation
- **Secure Webhooks**: Webhook signature verification
- **Environment Variables**: Sensitive keys stored securely

## 🚀 Going Live

To switch to production:

1. Get your **live** API keys from Stripe Dashboard
2. Update environment variables with live keys (remove `_test_`)
3. Set up live webhooks pointing to your production domain
4. Test thoroughly with real payment methods
5. Enable any additional payment methods you want to support

## 📞 Support

- **Stripe Documentation**: https://stripe.com/docs
- **Test Your Integration**: https://stripe.com/docs/testing
- **Webhook Testing**: Use Stripe CLI for local webhook testing

---

**⚠️ Important Security Notes:**
- Never commit `.env.local` to version control
- Always use test keys in development
- Verify webhook signatures in production
- Monitor failed payments in Stripe Dashboard 