# 🔧 Push Notification Troubleshooting Guide

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