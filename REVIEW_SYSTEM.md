# 🌟 Review Collection System

## Overview
The Zek's Surf School review collection system allows customers to submit detailed feedback about their surf lessons through a URL-based form. Reviews are stored locally and managed through the admin panel.

## How It Works

### 1. Review Collection URL
After a lesson, email customers a link with pre-filled information:

```
https://your-domain.com/review?paymentId=PAY123&customerName=John%20Doe&customerEmail=john@example.com&lessonDate=2024-01-15&beach=Doheny&instructorName=Mike
```

### 2. URL Parameters
The system accepts these URL parameters to pre-fill the form:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `paymentId` | Payment reference ID (required) | `PAY123` |
| `customerName` | Customer's full name | `John Doe` |
| `customerEmail` | Customer's email address | `john@example.com` |
| `lessonDate` | Date of the lesson (YYYY-MM-DD) | `2024-01-15` |
| `beach` | Beach location | `Doheny`, `T-Street`, `San Onofre` |
| `instructorName` | Instructor's name | `Mike` |

### 3. Review Form Features
- **Star Ratings**: Overall, Instructor, Equipment, Experience (1-5 stars)
- **Written Review**: Title and detailed feedback
- **Additional Questions**: Recommendation, favorite aspects, improvements
- **Validation**: Prevents duplicate submissions per payment ID
- **Mobile Responsive**: Works on all devices

### 4. Data Collection
Each review captures:
- Customer information and lesson details
- Multiple rating categories
- Written feedback and recommendations
- Submission metadata (timestamp, IP address)
- Status tracking (pending/approved/rejected)

## Admin Management

### Accessing Reviews
1. Go to the admin debug portal
2. Navigate to the "⭐ Reviews" tab
3. View statistics and manage all reviews

### Review Management Features
- **Filter Reviews**: View all, pending, approved, or rejected
- **Approve/Reject**: Moderate reviews before publication
- **Detailed View**: See complete review information
- **Export Data**: Download reviews as JSON
- **Delete Reviews**: Remove inappropriate content

### Review Statistics
The admin panel shows:
- Total reviews submitted
- Pending reviews requiring action
- Approved and rejected counts
- Average ratings across categories
- Recent review activity

## Email Template Example

```html
Subject: How was your surf lesson with Zek's Surf School?

Hi [Customer Name],

Thank you for choosing Zek's Surf School for your surf lesson at [Beach] on [Date]!

We'd love to hear about your experience. Please take a moment to share your feedback:

👉 [Review Link with Parameters]

Your review helps us improve our service and helps other surfers know what to expect.

Thanks for riding the waves with us! 🏄‍♂️

Best regards,
The Zek's Surf School Team
```

## Technical Details

### Data Storage
- Reviews are stored in browser localStorage
- No external database required
- Data persists across browser sessions
- Includes automatic backup/export functionality

### Security Features
- Duplicate prevention by payment ID
- IP address logging for fraud detection
- Admin approval workflow
- Secure admin panel access

### Performance
- Client-side validation for instant feedback
- Cached statistics for fast admin dashboard
- Optimized for mobile devices
- Progressive enhancement

## URL Examples

### Basic Review Link
```
https://your-domain.com/review?paymentId=PAY123
```

### Fully Pre-filled Link
```
https://your-domain.com/review?paymentId=PAY123&customerName=Sarah%20Johnson&customerEmail=sarah@email.com&lessonDate=2024-01-20&beach=T-Street&instructorName=Alex
```

### Alternative Parameter Names
The system also accepts these alternative parameter names:
- `payment_id` instead of `paymentId`
- `customer_name` instead of `customerName`
- `customer_email` instead of `customerEmail`
- `lesson_date` instead of `lessonDate`
- `instructor_name` instead of `instructorName`

## Best Practices

### 1. Email Timing
- Send review requests 24-48 hours after the lesson
- Include lesson details in the email for context
- Use a friendly, personal tone

### 2. URL Construction
- Always include the payment ID (required)
- URL-encode special characters in names/emails
- Test links before sending to customers

### 3. Review Management
- Check for pending reviews daily
- Respond to negative feedback constructively
- Use approved reviews for marketing materials

### 4. Data Maintenance
- Export review data regularly for backup
- Monitor for spam or inappropriate content
- Track trends in customer feedback

## Troubleshooting

### Common Issues
1. **"Review already submitted"**: Each payment ID can only submit one review
2. **Form validation errors**: Check required fields are filled
3. **URL parameters not working**: Ensure proper URL encoding

### Admin Access
- Default password: `ZeksSurf2024!Admin#Debug`
- Set custom password with `NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD` environment variable
- Access URL is intentionally obscured for security

---

## Quick Start Checklist

- [ ] Test the review form: `/review`
- [ ] Access admin panel and check Reviews tab
- [ ] Create email template with review links
- [ ] Set up process for sending review requests
- [ ] Train staff on review management
- [ ] Set up regular data export schedule

The review system is now ready to collect valuable customer feedback! 🌟 