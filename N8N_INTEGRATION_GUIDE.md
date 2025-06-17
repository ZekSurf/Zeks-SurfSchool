# n8n Integration Guide for Surf School Bookings

## 🎯 **Perfect Architecture for Your Use Case**

```
Customer Payment → Stripe → Your Webhook → n8n → Google Calendar + Email
```

## **✅ Why This Is the BEST Approach:**

1. **100% Reliable**: Only confirmed payments trigger bookings
2. **All Data Available**: Beach, time, customer info automatically included
3. **Stripe Metadata**: Perfect for storing booking details
4. **Atomic Operations**: Payment + booking happen together or not at all

## **🔄 Complete Flow:**

### **1. Customer Books Lesson**
- Selects beach (Doheny, T-Street, San Onofre)
- Picks date/time slot
- Chooses private/group lesson
- Fills waiver and customer info

### **2. Payment Processing** 
- Stripe stores ALL booking data in payment metadata
- Customer pays with credit card
- Payment either succeeds or fails

### **3. Stripe Webhook Fires** (Only on Success)
- Stripe calls: `yourdomain.com/api/webhooks/stripe`
- Your server receives complete booking data
- Server forwards data to n8n webhook

### **4. n8n Workflow Triggers**
- Receives rich booking data
- Creates Google Calendar event
- Sends confirmation email
- Updates any databases
- Triggers other automations

## **📋 n8n Workflow Setup:**

### **Step 1: Create Webhook Node**
1. Add **Webhook** node in n8n
2. Set HTTP method: `POST`
3. Copy the webhook URL
4. Add to your `.env.local` as `N8N_BOOKING_WEBHOOK_URL`

### **Step 2: Data Processing**
Add nodes to handle the incoming data:

```javascript
// Sample data structure you'll receive:
{
  "paymentIntentId": "pi_3abc123def456",
  "amount": 81.00,
  "customerName": "Sarah Johnson", 
  "customerEmail": "sarah@email.com",
  "customerPhone": "+1-555-0123",
  "bookingDetails": [
    {
      "beach": "Doheny State Beach",
      "date": "2024-12-15", 
      "time": "10:00 AM",
      "isPrivate": false,
      "price": 75
    }
  ],
  "timestamp": "2024-12-10T20:30:00Z"
}
```

### **Step 3: Google Calendar Integration**
1. Add **Google Calendar** node
2. Set operation: "Create Event"
3. Map fields:
   - **Summary**: `"Surf Lesson - {{ $json.customerName }}"`
   - **Location**: `"{{ $json.bookingDetails[0].beach }}"`
   - **Start Time**: `"{{ $json.bookingDetails[0].date }}T{{ $json.bookingDetails[0].time }}"`
   - **Duration**: `"2 hours"` (adjust as needed)
   - **Description**: Include customer details and lesson type

### **Step 4: Email Confirmation**
1. Add **Email** node (Gmail/SMTP)
2. Send to: `{{ $json.customerEmail }}`
3. Subject: `"Surf Lesson Confirmed - {{ $json.bookingDetails[0].date }}"`
4. Include all booking details, what to bring, meeting location

## **🛠️ Environment Variables Needed:**

```bash
# Your Stripe webhook will send data here
N8N_BOOKING_WEBHOOK_URL=https://your-n8n.domain.com/webhook/booking-confirmed

# Optional: For payment failures
N8N_FAILURE_WEBHOOK_URL=https://your-n8n.domain.com/webhook/payment-failed
```

## **🧪 Testing Your Integration:**

### **1. Test Payment Flow**
1. Book a lesson on your site
2. Use test card: `4242 4242 4242 4242`
3. Complete payment

### **2. Check n8n Workflow**
1. Should trigger automatically 
2. Check execution history in n8n
3. Verify Google Calendar event created
4. Confirm email sent

### **3. Test Failed Payment**
1. Use declined card: `4000 0000 0000 0002`
2. Verify no calendar event created
3. Optionally handle failure notification

## **🎯 Sample n8n Workflow Structure:**

```
[Webhook] → [Set Variables] → [Google Calendar] → [Email] → [Database Update]
                ↓
           [Error Handler] → [Admin Notification]
```

## **💡 Pro Tips:**

### **Multiple Lessons Handling**
If customer books multiple lessons, loop through `bookingDetails` array:
```javascript
// For each lesson in the booking
for (let lesson of $json.bookingDetails) {
  // Create separate calendar event
  // Send separate confirmation
}
```

### **Calendar Event Details**
Include rich information:
- Customer contact info
- Lesson type (private/group)
- Equipment notes
- Weather conditions
- Payment confirmation

### **Error Handling**
- Set up failure webhook for declined payments
- Add retry logic for API failures  
- Send admin alerts for any issues

## **🚀 Advanced Features You Can Add:**

1. **SMS Notifications**: Send booking confirmations via SMS
2. **Instructor Notifications**: Alert instructors of new bookings
3. **Equipment Management**: Track board/wetsuit assignments
4. **Weather Integration**: Include surf conditions in confirmations
5. **Follow-up Automation**: Post-lesson surveys and reviews
6. **Slack Notifications**: Team alerts for new bookings

---

This setup gives you a **bulletproof booking system** where payments and confirmations are 100% synchronized! 🏄‍♂️ 