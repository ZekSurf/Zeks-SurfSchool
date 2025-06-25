# Waiver Signature Integration Guide

## Overview

This implementation adds a comprehensive waiver signature system to Zek's Surf School that:
- Collects waiver signatures during checkout
- Stores signatures temporarily with payment intent
- Finalizes signatures only after successful payment
- Includes emergency contact and medical information for safety
- Maintains legal compliance with IP address and audit trail
- Preserves all signatures for compliance and record keeping

## Database Schema

Run the SQL in `waiver_signatures_schema.sql` in your Supabase SQL editor to create:
- `waiver_signatures` table with all required fields
- Proper indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp triggers

## Implementation Flow

### 1. During Checkout (Waiver Signing)
1. User fills out booking details and proceeds to checkout
2. User signs waiver with participant info, emergency contacts, and medical conditions
3. System calls `/api/waiver/save-signature` to store temporarily with payment intent ID
4. User proceeds to payment

### 2. During Payment Processing (Stripe Webhook)
1. Payment succeeds in Stripe
2. Webhook processes booking and creates confirmation number
3. System calls `waiverService.finalizeWaiverSignature()` to update with booking ID
4. Waiver is now permanently linked to the completed booking

### 3. Data Retention
- All waiver signatures are preserved permanently for legal compliance
- Failed payment signatures remain in database for audit purposes
- Manual deletion available through admin interface if needed

## Required Environment Variables

No additional environment variables needed - uses existing `SUPABASE_SERVICE_ROLE_KEY`.

## Files Created/Modified

### New Files
- `src/lib/waiverService.ts` - Core waiver signature logic
- `src/pages/api/waiver/save-signature.ts` - API to save signatures (now unused - integrated directly into payment flow)
- `waiver_signatures_schema.sql` - Database schema

### Modified Files
- `src/components/Booking/WaiverAgreement.tsx` - Added emergency contact fields
- `src/components/Booking/BookingDetails.tsx` - Added waiver data to localStorage
- `src/components/Payment/StripePaymentForm.tsx` - Pass waiver data to payment intent
- `src/pages/api/create-payment-intent.ts` - Save waiver signatures during payment
- `src/pages/api/webhooks/stripe.ts` - Added waiver finalization
- `src/pages/payment.tsx` - Clear waiver data after successful payment
- `src/types/booking.ts` - Added waiver interfaces

## Integration Steps

### 1. Database Setup
```sql
-- Run the SQL in waiver_signatures_schema.sql in Supabase
```

### 2. Integration Complete!
The waiver signature system is now fully integrated into your existing checkout flow:

1. **Booking Page**: Users sign waiver with emergency contact info
2. **Waiver Data Storage**: Saved to localStorage automatically
3. **Payment Intent**: Waiver signature saved to database when payment intent is created
4. **Payment Success**: Waiver finalized with booking confirmation number
5. **Cleanup**: Local storage cleared after successful payment

### 3. Data Collected

#### Required Fields
- Slot ID
- Payment Intent ID  
- Signer name (participant or guardian)
- Participant name
- Customer email
- Customer phone
- Emergency contact name
- Emergency contact phone
- Signed timestamp
- IP address (automatic)
- User agent (automatic)

#### Optional Fields
- Guardian name (if minor)
- Medical conditions
- Waiver version (automatic: v1.0)

#### Additional Recommended Fields
You might also consider collecting:
- Date of birth (for age verification)
- Physical address
- Swimming ability level
- Previous surf experience
- Specific allergies or medications

## Security & Compliance

### Row Level Security (RLS)
- **Public users**: Can only INSERT signatures (during checkout)
- **Service role**: Full access for admin operations and webhook processing
- **No public read access**: Protects sensitive personal information

### Audit Trail
- IP address captured for legal compliance
- User agent stored for device identification
- Timestamps for signature and updates
- Waiver version tracking for terms changes

### Data Protection
- Medical information stored securely
- Emergency contact data for safety purposes
- All signatures preserved for legal compliance
- No PII in logs (production mode)

## Legal Considerations

1. **Waiver Version Tracking**: System tracks v1.0 currently - update version when waiver terms change
2. **Electronic Signature**: Complies with ESIGN Act requirements
3. **IP Address**: Provides legal proof of signature location
4. **Timestamp**: UTC timestamps for legal clarity
5. **Audit Trail**: Complete tracking for legal compliance

## API Endpoints

### `/api/waiver/save-signature` (POST)
Saves waiver signature temporarily during checkout.

**Required Body:**
```json
{
  "slotId": "string",
  "paymentIntentId": "string", 
  "signerName": "string",
  "participantName": "string",
  "customerEmail": "string",
  "customerPhone": "string",
  "emergencyContactName": "string",
  "emergencyContactPhone": "string",
  "guardianName": "string?",
  "isMinor": "boolean?",
  "medicalConditions": "string?"
}
```



## Monitoring & Maintenance

### Recommended Monitoring
- Monitor waiver signature success rates
- Alert on waiver finalization failures
- Track waiver data integrity

### Maintenance Tasks
- Periodic backup of waiver data
- Review waiver version updates as needed
- Monitor database storage usage

## Testing

### Test Scenarios
1. Complete successful booking with waiver
2. Abandoned cart with waiver signed
3. Failed payment after waiver signed
4. Minor vs adult waiver flows
5. Emergency contact validation
6. Medical conditions handling

### Test Commands
```bash
# Verify waiver signature in database
# Check Supabase dashboard for waiver_signatures table

# Test complete booking flow with waiver
# 1. Go to booking page
# 2. Select a lesson slot
# 3. Fill out waiver with emergency contact info
# 4. Complete checkout and payment
# 5. Verify signature appears in waiver_signatures table
```

## Future Enhancements

Consider adding:
- PDF generation of signed waivers
- Email confirmation of waiver signature
- Waiver renewal tracking for returning customers
- Integration with staff portal to view waivers
- Digital signature images (base64 encoding)
- Document versioning for waiver updates 