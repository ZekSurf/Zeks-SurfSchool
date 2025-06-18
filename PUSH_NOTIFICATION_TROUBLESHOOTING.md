# 🔧 Push Notification Troubleshooting Guide

This guide helps diagnose and fix push notification issues in the surf school application.

## 🐛 Issue: Test Notifications Work, But Real Bookings Don't Send Notifications

### Most Likely Causes:

1. **Missing Environment Variables in Production**
2. **Webhook Not Reaching Notification Code**
3. **No Active Subscriptions**
4. **URL Configuration Issues**

## 🔍 Step-by-Step Debugging

### Step 1: Check Environment Variables

Go to your **Vercel Dashboard** → **Project Settings** → **Environment Variables** and ensure these are set:

```bash
VAPID_PUBLIC_KEY=BJihAZAi6EAAlBbRnB5LBrTTXmS3nbECYOVWHUVpCH1ZrkVDF96G63IesTuFQrh6WS5_7EMoLYx1XKetCnsQNQM
VAPID_PRIVATE_KEY=vt2uSXtIXb8XyTht22phjMHz8eHDMIrvzQgIh8-1_BQ
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJihAZAi6EAAlBbRnB5LBrTTXmS3nbECYOVWHUVpCH1ZrkVDF96G63IesTuFQrh6WS5_7EMoLYx1XKetCnsQNQM
NEXTAUTH_URL=https://your-site.vercel.app
```

**⚠️ Critical:** Replace `your-site.vercel.app` with your actual Vercel domain!

### Step 2: Test Configuration

Visit this URL in your browser to check configuration:
```
https://your-site.vercel.app/api/debug/push-config
```

Look for:
- ✅ `vapidKeys.publicKey`: Should show "BJihAZAi6EAAlBbRn..." 
- ✅ `vapidKeys.privateKey`: Should show "SET"
- ✅ `webhookConfig.nextAuthUrl`: Should show your domain
- ✅ `subscriptions.count`: Should be > 0 (your phone subscription)

### Step 3: Check Active Subscriptions

In the staff portal on your phone:
1. **Verify notifications are enabled** (green status)
2. **Check subscription count** in debug endpoint above
3. **Re-subscribe if needed**: Disable → Enable notifications

### Step 4: Test Booking Notification

In the staff portal, click the **"Test Booking"** button (purple button next to "Test"):
- ✅ Should receive notification on your phone
- ❌ If fails, check browser console for errors

### Step 5: Check Stripe Webhook Logs

When you make a real booking:

1. **Vercel Function Logs**: Check your Vercel dashboard → Functions → Recent logs
2. **Look for these messages**:
   ```
   📱 Sending push notification to staff...
   ✅ Push notification sent successfully
   ```
3. **If missing**: Webhook might not be reaching the notification code

### Step 6: Verify Webhook Flow

Make a test booking and check logs for this sequence:
```bash
✅ Booking saved to Supabase successfully!
📱 Sending push notification to staff...
📱 Push notification URL: https://your-site.vercel.app/api/push/send-notification
📱 Push response status: 200
✅ Push notification sent successfully
```

## 🛠 Common Fixes

### Fix 1: Missing NEXTAUTH_URL
**Problem**: Webhook uses `http://localhost:3000` in production
**Solution**: Set `NEXTAUTH_URL=https://your-site.vercel.app` in Vercel

### Fix 2: Missing VAPID Keys
**Problem**: "Push notifications not configured - VAPID keys missing"
**Solution**: Add all 3 VAPID environment variables to Vercel

### Fix 3: No Subscriptions
**Problem**: `subscriptions.count: 0` in debug endpoint
**Solution**: 
1. Go to staff portal on your phone
2. Disable notifications
3. Enable notifications again
4. Check debug endpoint again

### Fix 4: Wrong Domain in NEXTAUTH_URL
**Problem**: NEXTAUTH_URL points to wrong domain
**Solution**: Update to exact Vercel domain (check in Vercel dashboard)

### Fix 5: Webhook Not Working
**Problem**: No logs in Vercel functions
**Solution**: 
1. Check Stripe webhook endpoint URL
2. Verify webhook is receiving events
3. Check Stripe dashboard → Webhooks → Recent deliveries

## 🧪 Testing Commands

### Test Push Configuration:
```bash
curl https://your-site.vercel.app/api/debug/push-config
```

### Test Manual Notification:
```bash
curl -X POST https://your-site.vercel.app/api/debug/test-push
```

### Check Supabase Connection:
```bash
curl https://your-site.vercel.app/api/test-supabase
```

## 📱 Phone-Specific Issues

### iOS Safari Requirements:
- ✅ **Must add to home screen** (not browse in Safari)
- ✅ **Must open from home screen** (not Safari)
- ✅ **iOS 16.4+** required
- ✅ **Enable in Settings**: Settings → Safari → Notifications → Allow

### Re-enable Notifications:
1. Go to Settings → Safari → Website Data
2. Remove your site's data
3. Re-add to home screen
4. Enable notifications again

## 🔧 Debug Mode

Enable detailed logging in browser console:
```javascript
localStorage.setItem('debug_push_notifications', 'true');
```

## 📞 Still Not Working?

If notifications still don't work after these steps:

1. **Check Vercel logs** for any errors during booking
2. **Verify Stripe webhook** is calling your endpoint
3. **Test with a different device** to rule out device-specific issues
4. **Check browser console** for any JavaScript errors

## ✅ Success Checklist

- [ ] All environment variables set in Vercel
- [ ] Debug endpoint shows correct configuration
- [ ] Phone subscribed to notifications (count > 0)
- [ ] "Test Booking" button works in staff portal
- [ ] Vercel logs show push notification attempts during real bookings
- [ ] iOS device added to home screen and opened from home screen

Once all items are checked, push notifications should work for real bookings! 🎉 

## Quick Status Check

Visit `/api/debug/push-config` on your deployed site to get a comprehensive status report including:
- VAPID key configuration
- Database connection status
- Active subscription count
- Recent subscription details

## Common Issues & Solutions

### 1. "No subscriptions found" Error

**Symptoms**: Test notifications fail with "No subscriptions found"

**Causes & Solutions**:
- **User hasn't enabled notifications**: Ask user to click "Enable Push Notifications" in staff portal
- **Database connection issue**: Check Supabase environment variables in Vercel
- **Table doesn't exist**: Run the push_subscriptions table creation SQL (see SUPABASE_SETUP.md)

**Debug Steps**:
```bash
# Check if push_subscriptions table exists in Supabase
SELECT COUNT(*) FROM push_subscriptions;

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. VAPID Keys Missing Error

**Symptoms**: Push notifications fail with "VAPID keys missing"

**Solution**: Add VAPID environment variables to Vercel:
```bash
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key (same as VAPID_PUBLIC_KEY)
```

**Generate New VAPID Keys**:
```bash
npx web-push generate-vapid-keys
```

### 3. Real Bookings Don't Trigger Notifications

**Symptoms**: Test notifications work, but actual payments don't send notifications

**Debug Steps**:
1. Check Vercel logs for Stripe webhook errors
2. Verify `NEXTAUTH_URL` is set to your custom domain (not .vercel.app)
3. Test webhook endpoint: `/api/debug/test-push`

**Common Fixes**:
- Set `NEXTAUTH_URL=https://zeksurfschool.com` (your custom domain)
- Ensure Stripe webhook is configured to send to your custom domain
- Check that all VAPID environment variables are properly set in Vercel production

### 4. Subscription Registration Fails

**Symptoms**: "Enable Push Notifications" button doesn't work

**iOS Safari Requirements**:
- User must "Add to Home Screen" to install as PWA
- Push notifications only work in PWA mode on iOS
- User must interact with the page before requesting permission

**Debug Steps**:
1. Check browser console for errors
2. Verify service worker is registered: `navigator.serviceWorker.ready`
3. Test subscription endpoint: `/api/push/subscribe`

### 5. Database Migration Issues

**If migrating from file-based storage** (version before Supabase migration):

**Symptoms**: Old subscriptions lost, ENOENT file errors in Vercel logs

**Solution**: The system has been migrated to Supabase database storage:
1. Run the push_subscriptions table creation SQL (see SUPABASE_SETUP.md)
2. Users need to re-enable push notifications to register with new system
3. Old file-based subscriptions will not be migrated automatically

## Environment Variables Checklist

Ensure these are set in Vercel production environment:

### Required for Push Notifications:
- ✅ `VAPID_PUBLIC_KEY`
- ✅ `VAPID_PRIVATE_KEY` 
- ✅ `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- ✅ `NEXTAUTH_URL` (set to your custom domain)

### Required for Database:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing Workflow

### 1. Test Database Connection
```bash
curl https://zeksurfschool.com/api/test-supabase
```

### 2. Test Push Config
```bash
curl https://zeksurfschool.com/api/debug/push-config
```

### 3. Test Notification Sending
```bash
curl -X POST https://zeksurfschool.com/api/debug/test-push \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Test notification"}'
```

### 4. Test Full Booking Flow
1. Make a real test booking with Stripe
2. Check Vercel logs for webhook execution
3. Verify notification appears on registered devices

## iOS Push Notification Setup

### For Users:
1. Visit `zeksurfschool.com` in Safari
2. Tap Share → "Add to Home Screen"
3. Open the PWA from home screen
4. Navigate to staff portal
5. Click "Enable Push Notifications"
6. Allow when prompted

### For Developers:
- Push notifications only work on HTTPS domains
- Local development requires `localhost` or use ngrok for testing
- iOS requires PWA installation for push notifications
- Service worker must be served from root domain

## Advanced Debugging

### Check Service Worker Status:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### Check Push Subscription:
```javascript
// In browser console
navigator.serviceWorker.ready.then(registration => {
  return registration.pushManager.getSubscription();
}).then(subscription => {
  console.log('Push Subscription:', subscription);
});
```

### Monitor Database Subscriptions:
```sql
-- In Supabase SQL editor
SELECT 
  COUNT(*) as total_subscriptions,
  MAX(created_at) as latest_subscription,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_subscriptions
FROM push_subscriptions;
```

## Support Contacts

If issues persist:
1. Check Vercel deployment logs
2. Review Supabase database logs
3. Test with multiple devices/browsers
4. Verify all environment variables are properly set in production 