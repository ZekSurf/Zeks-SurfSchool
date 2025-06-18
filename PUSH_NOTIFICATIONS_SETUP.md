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
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here

# Base URL for sending notifications
NEXTAUTH_URL=https://your-domain.com
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