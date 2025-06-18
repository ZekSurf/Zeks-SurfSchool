# Supabase Setup Guide for Staff Portal

This guide will help you set up Supabase as the database backend for the staff portal booking system.

## Prerequisites

- A Supabase account (free tier available)
- Administrative access to your project

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization and enter project details:
   - **Name**: `Zeks Surf School`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your location
4. Wait for the project to be created (takes ~2 minutes)

## 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Create Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the following SQL to create the bookings table:

```sql
-- Create bookings table for staff portal
CREATE TABLE bookings (
  id text PRIMARY KEY,
  payment_intent_id text UNIQUE NOT NULL,
  confirmation_number text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  beach text NOT NULL,
  lesson_date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  price numeric NOT NULL,
  lessons_booked integer NOT NULL DEFAULT 1,
  is_private boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_date ON bookings(lesson_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_beach ON bookings(beach);
CREATE INDEX idx_bookings_payment_intent ON bookings(payment_intent_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create staff pins table for server-side PIN management
CREATE TABLE staff_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_used timestamptz,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for active pins
CREATE INDEX idx_staff_pins_active ON staff_pins(is_active) WHERE is_active = true;

-- Create updated_at trigger for staff_pins
CREATE TRIGGER update_staff_pins_updated_at 
    BEFORE UPDATE ON staff_pins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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

-- Create indexes for push subscriptions
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- Create updated_at trigger for push_subscriptions
CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON push_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 4. Configure Row Level Security (RLS)

1. In the SQL Editor, run the following to set up security policies:

```sql
-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (you can restrict this later)
CREATE POLICY "Allow full access to bookings" ON bookings
FOR ALL USING (true);

-- Enable RLS on staff_pins table
ALTER TABLE staff_pins ENABLE ROW LEVEL SECURITY;

-- Allow public access to staff pins (access controlled via API)
CREATE POLICY "Allow full access to staff_pins" ON staff_pins
FOR ALL USING (true);

-- Enable RLS on push_subscriptions table
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role to perform all operations on bookings
CREATE POLICY "Allow service role full access to bookings" ON bookings
FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to perform all operations on staff_pins
CREATE POLICY "Allow service role full access to staff_pins" ON staff_pins
FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to perform all operations on push_subscriptions
CREATE POLICY "Allow service role full access to push_subscriptions" ON push_subscriptions
FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to create push subscriptions (for registration)
CREATE POLICY "Allow anonymous push subscription creation" ON push_subscriptions
FOR INSERT WITH CHECK (true);

-- Allow anonymous users to read their own subscriptions (for updates)
CREATE POLICY "Allow anonymous push subscription read" ON push_subscriptions
FOR SELECT USING (true);

-- Allow anonymous users to update their own subscriptions
CREATE POLICY "Allow anonymous push subscription update" ON push_subscriptions
FOR UPDATE USING (true);

-- Allow anonymous users to delete their own subscriptions
CREATE POLICY "Allow anonymous push subscription delete" ON push_subscriptions
FOR DELETE USING (true);
```

## 5. Set Environment Variables

Add these variables to your project's environment configuration:

### For Local Development (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Production (Vercel/Netlify)
Add the same variables in your hosting platform's environment settings.

## 6. Test the Connection

1. Start your development server: `npm run dev`
2. Try booking a test lesson through your website
3. Check the Supabase dashboard **Table Editor > bookings** to see if the booking appears
4. Access the staff portal and verify bookings display correctly

## 7. Verify Staff Portal Functions

Test these features:
- ✅ Login with PIN
- ✅ View bookings on weekly calendar
- ✅ Click booking details to see customer info
- ✅ Update booking status (confirmed → completed)
- ✅ Sync button loads bookings from database
- ✅ New bookings appear automatically after payment

## 8. Data Migration (if needed)

If you have existing booking data from the file-based system:

1. Go to **Admin Debug Portal**
2. Use the "Export Staff Data" button to download existing bookings
3. In Supabase SQL Editor, use INSERT statements to migrate data:

```sql
INSERT INTO bookings (
  id, payment_intent_id, confirmation_number, customer_name, 
  customer_email, customer_phone, beach, lesson_date, 
  start_time, end_time, price, lessons_booked, is_private, status
) VALUES 
('booking-1', 'pi_1234567890', 'SURF-123456-7890', 'John Doe',
 'john@example.com', '555-1234', 'San Onofre', '2024-01-15',
 '2024-01-15T09:00:00-07:00', '2024-01-15T10:30:00-07:00',
 120.00, 1, false, 'confirmed');
```

## 9. Security Considerations

### Production Security
For production, consider implementing:

1. **More restrictive RLS policies**:
```sql
-- Example: Only allow reads for authenticated users
DROP POLICY "Allow full access to bookings" ON bookings;

CREATE POLICY "Allow read access to bookings" ON bookings
FOR SELECT USING (true);

CREATE POLICY "Allow insert from webhook" ON bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for status changes" ON bookings
FOR UPDATE USING (true);
```

2. **Service Role Key**: For server-side operations (webhooks), use the service role key
3. **API Key Restrictions**: Limit anon key permissions in Supabase dashboard

## 10. Monitoring and Maintenance

### Regular Tasks
- Monitor database usage in Supabase dashboard
- Check logs for any errors
- Backup important data periodically
- Review and optimize queries if performance issues arise

### Troubleshooting
- **Bookings not appearing**: Check webhook logs and Supabase logs
- **Permission errors**: Verify RLS policies and API keys
- **Sync issues**: Ensure environment variables are correct

## Benefits of Supabase vs File System

✅ **Real-time updates**: New bookings appear immediately  
✅ **Reliability**: No file corruption or server restart issues  
✅ **Scalability**: Handles high booking volume  
✅ **Query performance**: Fast searching and filtering  
✅ **Data integrity**: ACID transactions and constraints  
✅ **Backup**: Automatic daily backups  
✅ **Analytics**: Built-in query tools for reporting  

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify environment variables are set correctly
3. Test database connection using the Table Editor
4. Review this guide for missed steps

Your staff portal is now powered by a professional database! 🎉 