# Waiver Signature Integration Guide

## Overview

This implementation adds a comprehensive waiver signature system to Zek's Surf School that:
- Collects waiver signatures during checkout
- Stores signatures temporarily with payment intent
- Finalizes signatures only after successful payment
- Includes emergency contact and medical information for safety
- Maintains legal compliance with IP address and audit trail
- Automatically cleans up abandoned signatures

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

### 3. Cleanup (Cron Job)
- Endpoint: `/api/cron/cleanup-waivers`
- Removes orphaned signatures older than 24 hours without booking_id
- Should be called daily via cron service or Vercel cron

## Required Environment Variables

No additional environment variables needed - uses existing `SUPABASE_SERVICE_ROLE_KEY`.

## Files Created/Modified

### New Files
- `src/lib/waiverService.ts` - Core waiver signature logic
- `src/pages/api/waiver/save-signature.ts` - API to save signatures
- `src/pages/api/cron/cleanup-waivers.ts` - Cleanup orphaned signatures
- `waiver_signatures_schema.sql` - Database schema

### Modified Files
- `src/components/Booking/WaiverAgreement.tsx` - Added emergency contact fields
- `src/pages/api/webhooks/stripe.ts` - Added waiver finalization
- `src/types/booking.ts` - Added waiver interfaces

## Integration Steps

### 1. Database Setup
```sql
-- Run the SQL in waiver_signatures_schema.sql in Supabase
```

### 2. Update Checkout Flow
You need to integrate the waiver signature API call into your checkout process. Here's how:

```typescript
// In your checkout component, after waiver is signed and before payment:
const saveWaiverSignature = async (waiverData: WaiverData, paymentIntentId: string, slotId: string) => {
  const response = await fetch('/api/waiver/save-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slotId,
      paymentIntentId,
      signerName: waiverData.guardianName || waiverData.participantName,
      participantName: waiverData.participantName,
      guardianName: waiverData.guardianName,
      isMinor: !!waiverData.guardianName,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      emergencyContactName: waiverData.emergencyContactName,
      emergencyContactPhone: waiverData.emergencyContactPhone,
      medicalConditions: waiverData.medicalConditions
    })
  });

  return await response.json();
};
```

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
- Automatic cleanup of abandoned signatures
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

### `/api/cron/cleanup-waivers` (GET/POST)
Cleans up orphaned waiver signatures (should be called daily).

## Monitoring & Maintenance

### Recommended Monitoring
- Track orphaned signature cleanup counts
- Monitor waiver signature success rates
- Alert on waiver finalization failures

### Maintenance Tasks
- Run daily cleanup of orphaned signatures
- Periodic backup of waiver data
- Review waiver version updates as needed

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
# Test cleanup endpoint
curl https://your-domain.com/api/cron/cleanup-waivers

# Verify waiver signature in database
# Check Supabase dashboard for waiver_signatures table
```

## Future Enhancements

Consider adding:
- PDF generation of signed waivers
- Email confirmation of waiver signature
- Waiver renewal tracking for returning customers
- Integration with staff portal to view waivers
- Digital signature images (base64 encoding)
- Document versioning for waiver updates 