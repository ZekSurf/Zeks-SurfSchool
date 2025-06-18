# Staff Portal Setup Guide

## Overview

A secure staff portal has been created to allow staff members to view and manage booked surf lessons with a weekly calendar interface. The portal is protected by a PIN system that can be managed through the admin panel.

## Features

### 🔐 Security Features
- **PIN Protection**: 4-6 digit PIN required for access
- **Obscure URL**: Uses a randomized URL path for security through obscurity
- **Session Management**: Maintains login state during session
- **Lockout Protection**: 15-minute lockout after 3 failed PIN attempts
- **Admin Control**: PIN can be created, updated, or deactivated via admin panel

### 📅 Calendar Features
- **Weekly View**: Full week calendar display (Sunday - Saturday)
- **Booking Details**: Click any booking to view complete customer and lesson information
- **Status Management**: Update booking status (Confirmed → Completed/Cancelled)
- **Multi-Beach Support**: Displays bookings from all beaches
- **Today Highlight**: Current day is highlighted in blue
- **Navigation**: Easy week-to-week navigation with "Current Week" shortcut

### 📊 Booking Information
Each booking displays:
- Customer name and contact information (clickable phone/email)
- Lesson time and duration
- Beach location
- Private/Group lesson indicator
- Booking status with color coding
- Payment and confirmation details

## URLs

### Staff Portal Access
```
https://yoursite.com/staff-portal-a8f3e2b1c9d7e4f6
```

### Admin Panel (for PIN management)
```
https://yoursite.com/admin-debug-portal-83f7a2b9c4e6d1f8a5b3c9e7f2d4b6a8c1e5f9b2d7a3c8e6f1b4d9a7c2e5f8b3d6a9c4e7f1b8d5a2c9e6f3b7d4a1c8e5f2b9d6a3c7e4f1b8d5a2
```

## Setup Instructions

### 1. Create Staff PIN (Admin Only)

1. Access the admin panel using the admin URL above
2. Enter your admin password
3. Navigate to the **"👥 Staff Portal"** tab
4. In the "Create/Update Staff PIN" section:
   - Enter a 4-6 digit PIN (numbers only)
   - Click "Set PIN"
5. The PIN status will show as "✅ Active"

### 2. Share Access with Staff

1. Provide staff with the obscure staff portal URL
2. Share the PIN (consider using a secure communication method)
3. Instruct staff to bookmark the URL for easy access

### 3. Staff Portal Usage

1. **Login**: Enter the PIN on the staff portal page
2. **Auto-Sync**: New bookings automatically sync when you log in
3. **Navigate**: Use Previous/Next Week buttons or "Current Week" to navigate  
4. **Manual Sync**: Click "🔄 Sync New Bookings" to get latest payments
5. **View Details**: Click on any booking to see complete information
6. **Update Status**: In the booking details modal, use status buttons to mark lessons as completed or cancelled
7. **Contact Customers**: Click phone numbers or email addresses to initiate contact

## Status Color Coding

- **🔵 Blue**: Confirmed bookings
- **🟢 Green**: Completed lessons
- **🔴 Red**: Cancelled bookings

## Admin Management Features

### PIN Management
- **View Status**: See if PIN is active and when it was last used
- **Update PIN**: Change the PIN at any time
- **Deactivate**: Temporarily disable staff access
- **Usage Tracking**: Monitor when the PIN was last used

### Booking Management
- **Statistics Dashboard**: View total, confirmed, completed, and cancelled bookings
- **Data Export**: Export all booking data as JSON
- **Demo Data**: Add sample bookings for testing
- **Data Clearing**: Remove all booking data (irreversible)

## Data Storage & Auto-Sync

### ✅ **Auto-Sync Enabled!**
New payments from customers now **automatically** appear in the staff portal!

### How Auto-Sync Works
1. **Customer pays** → Stripe webhook processes payment
2. **Server storage** → Booking saved to temporary file storage
3. **Auto-sync on login** → Staff portal automatically pulls new bookings when staff log in
4. **Manual sync** → "🔄 Sync New Bookings" button for on-demand updates
5. **Local cache** → Synced bookings stored in browser localStorage for fast access

### Current Implementation
- **Hybrid Storage**: Server-side file storage + client-side localStorage
- **Automatic Sync**: New Stripe payments auto-sync to staff portal
- **Manual Sync**: On-demand sync button for latest updates
- **Per-Device Cache**: Each browser maintains its own local booking cache

### Future Considerations
- Upgrade to database storage for better scalability
- Real-time sync with WebSocket connections
- Multi-device synchronization improvements

## Security Best Practices

### For Administrators
1. **Protect Admin Access**: Keep admin password secure
2. **Regular PIN Updates**: Change staff PIN periodically
3. **Monitor Usage**: Check "Last Used" timestamps regularly
4. **Deactivate When Needed**: Disable PIN when staff member leaves

### For Staff
1. **Secure PIN**: Don't share PIN with unauthorized personnel
2. **Logout**: Always logout when finished
3. **Bookmark URL**: Save the obscure URL securely
4. **Report Issues**: Contact admin if PIN isn't working

## Troubleshooting

### Staff Can't Access Portal
1. **Check PIN Status**: Admin should verify PIN is active
2. **Verify URL**: Ensure correct obscure URL is being used
3. **Clear Browser Data**: Try clearing browser cache/localStorage
4. **Check Lockout**: Wait 15 minutes if multiple failed attempts

### No Bookings Showing
1. **Check Date Range**: Navigate to the correct week
2. **Add Demo Data**: Use admin panel to add test bookings
3. **Verify Data**: Check localStorage in browser developer tools

### Booking Status Not Updating
1. **Refresh Page**: Reload the staff portal page
2. **Check Browser Console**: Look for JavaScript errors
3. **Clear Storage**: Clear localStorage and re-add demo data

## Technical Details

### Files Created/Modified
- `src/types/booking.ts` - Added CompletedBooking and StaffPinConfig types
- `src/lib/staffService.ts` - Staff management service
- `src/components/Staff/WeeklyCalendar.tsx` - Calendar component
- `src/components/Staff/BookingDetailsModal.tsx` - Booking details modal
- `src/pages/staff-portal-[obscure-id].tsx` - Main staff portal page
- `src/pages/api/staff/sync-bookings.ts` - Booking sync API endpoint
- Admin panel updated with staff management tab

### Dependencies
- All existing dependencies (no new packages required)
- Uses Tailwind CSS for styling
- TypeScript for type safety

## Support

For technical issues or feature requests, contact the system administrator. The admin panel provides debugging tools and data export capabilities for troubleshooting. 