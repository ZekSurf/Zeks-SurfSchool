# Confirmation Number Testing Guide

## Issue Description
The confirmation number shown on the confirmation page was different from the one sent to N8N webhook and stored in Supabase. This happened because the confirmation page was generating its own random number instead of using the real one from the booking process.

## Fix Implemented (Updated Approach)
1. **Main Bookings Table**: The Stripe webhook now saves bookings directly to the main `bookings` table in Supabase
2. **Robust API Endpoint**: Created `/api/booking/get-by-id` that can retrieve bookings by either booking UUID or payment intent ID
3. **Enhanced Confirmation Page**: Updated to support both secure mode (booking UUID) and fallback mode (payment intent ID)
4. **Debug Mode**: Added comprehensive debug information and mode indicators
5. **Security Improvement**: Booking UUIDs are harder to guess than sequential payment intent IDs

## Testing Instructions

### Method 1: Debug Test Endpoint (Recommended)
1. Start the development server: `npm run dev`
2. Create a test booking by calling:
   ```bash
   curl -X POST http://localhost:3000/api/debug/test-confirmation
   ```
3. The response will include two test URLs:
   - `secure`: Uses booking UUID (recommended) - `/confirmation?booking_id=uuid`
   - `fallback`: Uses payment intent ID - `/confirmation?payment_intent=pi_xxx`
4. Test both URLs and verify they show the same confirmation number
5. In development mode, you'll see which mode is being used

### Method 2: Full Booking Flow
1. Make a real test booking through the website
2. Complete the payment process
3. On the confirmation page, check the debug info (only visible in development)
4. Verify that it says "Using real confirmation" instead of "Using fallback"

### Method 3: Manual API Testing
1. Find a recent booking UUID or payment intent ID from a completed booking
2. Test the API endpoint:
   - By booking UUID: `http://localhost:3000/api/booking/get-by-id?booking_id=uuid`
   - By payment intent: `http://localhost:3000/api/booking/get-by-id?payment_intent=pi_xxx`
3. Check if it returns the complete booking data including confirmation number

## Debug Information
In development mode, the confirmation page will show debug information including:
- Which identifier is being used (booking UUID vs payment intent)
- Mode indicator (✅ Secure Mode vs ⚠️ Fallback Mode)
- API call status and response data
- Whether real or fallback confirmation number is used
- Any errors or retry attempts

## Expected Behavior
- **Before Fix**: Confirmation page shows random number like `SURF-728955-2393`, but N8N receives different number
- **After Fix**: Confirmation page shows same number as N8N webhook receives

## Troubleshooting
If the confirmation page still shows fallback numbers:
1. Check if the webhook is executing successfully
2. Verify Supabase connection and table structure
3. Check browser console for API errors
4. Look at the debug information for specific error messages

## Clean Up
After testing, you can view recent bookings for cleanup:
```bash
curl http://localhost:3000/api/debug/test-confirmation
```
This will list recent bookings. Test bookings can be identified by the "Test Customer" name and can be manually removed from the Supabase dashboard if needed.

## URL Formats
- **Secure Mode**: `/confirmation?booking_id=550e8400-e29b-41d4-a716-446655440000`
- **Fallback Mode**: `/confirmation?payment_intent=pi_3Rd2RdQK0hbvJDZu12aKy4v7`

Both should show the same confirmation number for the same booking. 