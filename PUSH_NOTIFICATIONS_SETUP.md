# 📱 iOS Push Notifications Setup Guide

This guide covers setting up push notifications for the Zek's Surf School staff portal to receive alerts when new lessons are booked.

## 📋 Overview

When a customer successfully pays for a surf lesson, the system will:
1. Save the booking to the Supabase database
2. Automatically send push notifications to all subscribed staff devices
3. Display the notification with booking details (customer name, beach, date, time)
4. Allow staff to tap the notification to open the staff portal directly

## 🔧 Technical Setup

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications.

**Generate keys using Node.js:**
```bash
npm install web-push -g
web-push generate-vapid-keys
```

**Or generate online:** Use a VAPID key generator service (search "VAPID key generator")

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# VAPID Keys for Push Notifications (REQUIRED)
VAPID_PUBLIC_KEY=BJihAZAi6EAAlBbRnB5LBrTTXmS3nbECYOVWHUVpCH1ZrkVDF96G63IesTuFQrh6WS5_7EMoLYx1XKetCnsQNQM
VAPID_PRIVATE_KEY=vt2uSXtIXb8XyTht22phjMHz8eHDMIrvzQgIh8-1_BQ
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJihAZAi6EAAlBbRnB5LBrTTXmS3nbECYOVWHUVpCH1ZrkVDF96G63IesTuFQrh6WS5_7EMoLYx1XKetCnsQNQM

# Base URL for sending notifications (REQUIRED for production)
NEXTAUTH_URL=https://your-vercel-domain.vercel.app

# Admin password for PIN management (should already be set)
NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD=your_admin_password
```

**Important:** 
- The `NEXT_PUBLIC_VAPID_PUBLIC_KEY` must be the same as `VAPID_PUBLIC_KEY`
- Use the same key pair for both production and development
- Never expose the private key in client-side code

### 3. File Structure

The notification system includes these files:

```
📁 public/
├── sw.js                           # Service worker for push notifications
├── manifest.json                   # PWA manifest for iOS support

📁 src/
├── lib/
│   └── pushNotificationService.ts  # Main notification service
├── pages/
│   ├── api/
│   │   ├── push/
│   │   │   ├── subscribe.ts        # Handle notification subscriptions
│   │   │   ├── unsubscribe.ts      # Handle unsubscriptions
│   │   │   └── send-notification.ts # Send notifications to devices
│   │   └── webhooks/
│   │       └── stripe.ts           # Updated to send notifications on payment
│   └── staff-portal-*.tsx          # Updated with notification controls
```

## 📱 iOS Setup Instructions

### For Staff Members:

1. **Open Safari** and navigate to the staff portal
2. **Add to Home Screen:**
   - Tap the Share button (square with arrow up)
   - Scroll down and tap "Add to Home Screen"
   - Confirm by tapping "Add"
3. **Open the app** from your home screen (important!)
4. **Enable notifications** when prompted in the staff portal
5. **Test the setup** using the "Test" button

### Important iOS Notes:

- **Must use Safari** - Other browsers don't support notifications
- **Must add to home screen** - Notifications only work in standalone mode
- **Must open from home screen** - Not from Safari directly
- **iOS 16.4+** required for push notification support
- **Permission is persistent** once granted

## 🔄 How It Works

### Automatic Flow:
1. Customer completes payment via Stripe
2. Stripe webhook receives payment confirmation
3. Booking is saved to Supabase database
4. Push notification is automatically sent to all subscribed staff devices
5. Staff receive notification with booking details
6. Tapping notification opens staff portal to the booking

### Manual Controls:
- **Enable/Disable** notifications per device
- **Test notifications** to verify setup
- **View subscription status** in staff portal
- **Automatic cleanup** of invalid subscriptions

## 🛠 Admin Features

### Subscription Management:
```typescript
// Check how many devices are subscribed
const subscriptions = loadSubscriptions();
console.log(`${subscriptions.length} devices subscribed`);

// Send test notification to all devices
await fetch('/api/push/send-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '🏄‍♂️ Test Notification',
    body: 'This is a test from the admin panel'
  })
});
```

### Data Storage:
- Subscriptions stored in `data/push-subscriptions.json`
- Automatic cleanup of invalid/expired subscriptions
- No personal data stored (only browser endpoints and keys)

## 🐛 Troubleshooting

### Common Issues:

**"Notifications not supported"**
- Ensure using Safari on iOS 16.4+
- Check if added to home screen properly
- Verify opening from home screen, not Safari

**"Failed to enable notifications"**
- Check browser permissions in Settings > Safari > Notifications
- Clear browser cache and try again
- Re-add to home screen if needed

**"Not receiving notifications"**
- Verify VAPID keys are correctly set in environment
- Check server logs for push notification sending errors
- Ensure device hasn't been locked out due to failed attempts

**"Service worker not registered"**
- Check browser console for errors
- Verify `sw.js` file is accessible at root
- Clear browser cache and reload

### Debug Mode:

Enable detailed logging by adding this to browser console:
```javascript
localStorage.setItem('debug_push_notifications', 'true');
```

### Testing Commands:

```bash
# Test if service worker is registered
navigator.serviceWorker.getRegistrations().then(console.log);

# Test if notifications are supported
console.log('Notifications supported:', 'Notification' in window);

# Test subscription status
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(console.log)
);
```

## 🔒 Security Features

- **Obscure staff portal URL** prevents unauthorized access
- **PIN protection** with lockout after failed attempts
- **Session-based authentication** with automatic logout
- **VAPID keys** ensure notifications come from your server only
- **No personal data** stored in push subscriptions

## 📊 Monitoring

### Server Logs:
- Track successful/failed notification deliveries
- Monitor subscription additions/removals
- Log invalid subscription cleanup

### Client Logs:
- Service worker registration status
- Push notification permission changes
- Subscription success/failure events

## 🚀 Production Deployment

### Environment Setup:
1. Generate production VAPID keys
2. Set environment variables on hosting platform
3. Ensure HTTPS is enabled (required for push notifications)
4. Test with real bookings

### Performance:
- Notifications sent asynchronously (won't delay webhook response)
- Failed notifications don't break the booking process
- Automatic retry for temporary failures
- Cleanup of invalid subscriptions

## 📈 Usage Analytics

Track notification effectiveness:
- Subscription rates per device
- Notification delivery success rates
- Staff response times to booking alerts
- Device types and browser usage

---

## 💡 Tips for Best Results

1. **Train staff** on proper iOS setup process
2. **Test regularly** with different devices and iOS versions
3. **Monitor logs** for delivery issues
4. **Update documentation** as iOS evolves
5. **Have backup communication** methods (email, SMS)

The push notification system enhances staff responsiveness to new bookings while maintaining security and reliability of the booking process. 

## Features

- **Real-time notifications** for new bookings
- **Background notifications** - receive alerts even when the app is closed
- **Persistent login** - stay logged in for 24 hours after authentication
- **Auto-refresh** - booking calendar updates automatically when notifications are received
- **iOS PWA support** - works on iOS devices when installed as a PWA
- **Database storage** - subscriptions stored in Supabase for reliability

## Prerequisites

1. **Supabase Database**: Ensure the `push_subscriptions` table exists (see SUPABASE_SETUP.md)
2. **VAPID Keys**: Generate and configure VAPID keys for push notifications
3. **Custom Domain**: Set up `NEXTAUTH_URL` with your production domain

## Environment Variables

Add these to your `.env.local` file and Vercel environment variables:

```bash
# VAPID Keys (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key

# Production URL (important for notifications to work)
NEXTAUTH_URL=https://zeksurfschool.com

# Supabase (for storing subscriptions)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Setup Steps

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Copy the output and add to your environment variables.

### 2. Create Push Subscriptions Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create push_subscriptions table
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text UNIQUE NOT NULL,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- Enable RLS and policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous push subscription operations" ON push_subscriptions
FOR ALL USING (true);
```

### 3. Configure Environment Variables in Vercel

In your Vercel project settings, add all the environment variables listed above.

**Important**: Use your custom domain for `NEXTAUTH_URL`, not the `.vercel.app` domain.

## How It Works

### For Staff Members

1. **Access Staff Portal**: Navigate to the staff portal and log in with PIN
2. **Enable Notifications**: Click "Enable Push Notifications" button
3. **Grant Permission**: Allow notifications when prompted by browser
4. **Stay Logged In**: Login persists for 24 hours, no need to re-enter PIN
5. **Receive Alerts**: Get instant notifications for new bookings, even when app is closed

### iOS Setup (Required for iOS Users)

iOS requires the app to be installed as a PWA for push notifications to work:

1. Open Safari and navigate to `zeksurfschool.com`
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. Open the PWA from your home screen
5. Navigate to staff portal and enable notifications
6. Grant permission when prompted

### Notification Flow

1. **Customer Books Lesson**: Payment completes via Stripe
2. **Webhook Triggers**: Stripe webhook processes payment
3. **Database Storage**: Booking saved to Supabase
4. **Push Notification Sent**: All subscribed devices receive notification
5. **Staff Notification**: Staff members see alert with booking details
6. **Auto-Refresh**: Tapping notification opens portal and refreshes data

## Notification Format

Notifications use this format:

```
Title: "New Surf Lesson Booked!"
Body: "[Customer Name] has booked a lesson at [Beach Name]!"
Icon: Zek's Surf School logo
Actions: "👀 View Details" | "✖️ Dismiss"
```

## Persistent Login Features

### 24-Hour Session Persistence
- Login session persists for 24 hours using service worker cache
- No need to re-enter PIN when returning to the app
- Works even if browser/device is restarted

### Background Functionality
- Receive notifications even when staff portal is closed
- Tapping notification automatically opens and focuses staff portal
- Auto-refresh calendar when new bookings come in
- Service worker handles background tasks

### Session Management
- Sessions automatically expire after 24 hours
- Manual logout clears persistent session
- Failed login attempts still trigger lockouts as before

## Testing

### Test Local Notifications
1. Go to staff portal
2. Click "Test Local Notification" button
3. Should see test notification appear

### Test Server Notifications
1. Go to staff portal
2. Click "Test Booking" button
3. Should receive notification via push service
4. Check Vercel logs for delivery status

### Test Real Booking Flow
1. Make a test booking on the website
2. Complete payment with Stripe test card
3. Staff members should receive notification within seconds

## Debugging

### Check Push Configuration
Visit `/api/debug/push-config` to see:
- VAPID key status
- Subscription count
- Database connection
- Environment configuration

### Common Issues

**No notifications received:**
- Check VAPID environment variables are set
- Verify `NEXTAUTH_URL` uses custom domain
- Ensure push_subscriptions table exists
- Check browser notification permissions

**iOS notifications not working:**
- Must install as PWA (Add to Home Screen)
- Only works in PWA mode, not Safari browser
- User must interact with page before enabling notifications

**Persistent login not working:**
- Service worker must be registered and active
- Check browser console for service worker errors
- Clear browser cache and try again

## Advanced Features

### Service Worker Capabilities
- Background sync for offline functionality
- Automatic session management
- Message passing between app and service worker
- Cache management for offline support

### Database Integration
- Subscriptions stored in Supabase for reliability
- Automatic cleanup of invalid/expired subscriptions
- Cross-device subscription management
- Audit trail of notification delivery

### iOS PWA Optimization
- App shortcuts for quick access
- Standalone display mode
- Focus existing window when launched
- Native-like notification behavior

## Security Considerations

- PIN-based authentication with lockout protection
- Secure VAPID key management
- HTTPS required for push notifications
- Row-level security on subscription data
- Session expiration and cleanup

## Monitoring

Monitor notification delivery through:
- Vercel function logs
- Supabase database metrics
- Browser console logs
- User feedback on notification receipt

The system is designed to be robust and provide a seamless experience for staff members while maintaining security and reliability. 