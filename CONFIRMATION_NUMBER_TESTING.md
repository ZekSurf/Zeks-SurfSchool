# Confirmation Number Testing Guide

## Issue Description
The confirmation number shown on the confirmation page was different from the one sent to N8N webhook and stored in Supabase. This happened because the confirmation page was generating its own random number instead of using the real one from the booking process.

## Fix Implemented
1. **Webhook Storage**: The Stripe webhook now stores the confirmation number in the `temp_bookings` table
2. **API Endpoint**: Created `/api/booking/confirmation` to retrieve confirmation numbers by payment intent ID
3. **Page Enhancement**: Updated confirmation page to fetch real confirmation number with retry logic
4. **Debug Mode**: Added debug information to help troubleshoot issues

## Testing Instructions

### Method 1: Debug Test Endpoint (Recommended)
1. Start the development server: `npm run dev`
2. Create a test record by calling:
   ```bash
   curl -X POST http://localhost:3000/api/debug/test-confirmation
   ```
3. The response will include a `testUrl` - visit this URL to test the confirmation page
4. Verify that the confirmation page shows the same number that was in the API response

### Method 2: Full Booking Flow
1. Make a real test booking through the website
2. Complete the payment process
3. On the confirmation page, check the debug info (only visible in development)
4. Verify that it says "Using real confirmation" instead of "Using fallback"

### Method 3: Manual API Testing
1. Find a recent payment intent ID from a completed booking
2. Call: `http://localhost:3000/api/booking/confirmation?payment_intent=pi_xxx`
3. Check if it returns the correct confirmation number

## Debug Information
In development mode, the confirmation page will show debug information including:
- API call status
- Response data
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
After testing, you can remove test records:
```bash
curl http://localhost:3000/api/debug/test-confirmation
```
This will list recent test records for manual cleanup if needed. 