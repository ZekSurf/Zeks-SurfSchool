import { createClient } from '@supabase/supabase-js';
import { BookingResponse } from '@/types/booking';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client for customer-facing operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations (server-side only)
function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will fail.');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations');
  }

  return createClient(
    supabaseUrl, 
    serviceRoleKey, 
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Create admin client lazily (only when needed and only on server-side)
let _supabaseAdmin: any = null;

export const supabaseAdmin = (() => {
  // Only create on server-side
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin can only be used on the server-side');
  }
  
  if (!_supabaseAdmin) {
    _supabaseAdmin = createAdminClient();
  }
  
  return _supabaseAdmin;
})();

// TypeScript interfaces for database tables
export interface BookingRow {
  id: string;
  payment_intent_id: string;
  confirmation_number: string;
  amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  is_private: boolean;
  lessons_booked: number;
  beach: string;
  lesson_date: string;
  lesson_time: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StaffPinRow {
  id: string;
  pin: string;
  staff_name: string;
  role: 'surf_instructor' | 'admin';
  phone?: string;
  email?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  created_at: string;
}

// Discount codes interface
export interface DiscountCodeRow {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  description?: string;
  min_order_amount?: number;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// New interface for time slots cache
export interface TimeSlotsCache {
  id: string;
  cache_key: string;
  beach: string;
  date: string;
  data: BookingResponse;
  created_at: string;
  expires_at: string;
}

// Database schemas for reference
export const DATABASE_SCHEMAS = {
  bookings: `
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      payment_intent_id TEXT UNIQUE NOT NULL,
      confirmation_number TEXT UNIQUE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'usd',
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      is_private BOOLEAN DEFAULT false,
      lessons_booked INTEGER DEFAULT 1,
      beach TEXT NOT NULL,
      lesson_date DATE NOT NULL,
      lesson_time TEXT NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_bookings_lesson_date ON bookings(lesson_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_beach ON bookings(beach);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);

    -- RLS (Row Level Security)
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read access" ON bookings FOR SELECT USING (true);
    CREATE POLICY "Allow public insert access" ON bookings FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update access" ON bookings FOR UPDATE USING (true);
  `,
  
  staff_pins: `
    CREATE TABLE IF NOT EXISTS staff_pins (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      pin TEXT UNIQUE NOT NULL,
      staff_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('surf_instructor', 'admin')),
      phone TEXT,
      email TEXT,
      notes TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_used_at TIMESTAMPTZ
    );

    -- Create trigger for updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_staff_pins_updated_at 
        BEFORE UPDATE ON staff_pins 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_staff_pins_pin ON staff_pins(pin);
    CREATE INDEX IF NOT EXISTS idx_staff_pins_active ON staff_pins(is_active);

    -- RLS
    ALTER TABLE staff_pins ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public access" ON staff_pins FOR ALL USING (true);
  `,

  push_subscriptions: `
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh_key TEXT NOT NULL,
      auth_key TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- RLS
    ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public access" ON push_subscriptions FOR ALL USING (true);
  `,

  // New time slots cache table
  time_slots_cache: `
    CREATE TABLE IF NOT EXISTS time_slots_cache (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      cache_key TEXT UNIQUE NOT NULL,
      beach TEXT NOT NULL,
      date DATE NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_cache_key ON time_slots_cache(cache_key);
    CREATE INDEX IF NOT EXISTS idx_cache_beach_date ON time_slots_cache(beach, date);
    CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON time_slots_cache(expires_at);

    -- RLS
    ALTER TABLE time_slots_cache ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public access" ON time_slots_cache FOR ALL USING (true);
  `,

  // Discount codes table
  discount_codes: `
    CREATE TABLE IF NOT EXISTS discount_codes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
      discount_amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      min_order_amount DECIMAL(10,2) DEFAULT 0,
      max_uses INTEGER,
      current_uses INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create trigger for updated_at
    CREATE TRIGGER update_discount_codes_updated_at 
        BEFORE UPDATE ON discount_codes 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
    CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
    CREATE INDEX IF NOT EXISTS idx_discount_codes_expires_at ON discount_codes(expires_at);

    -- RLS
    ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read access" ON discount_codes FOR SELECT USING (true);
    CREATE POLICY "Allow public update for usage tracking" ON discount_codes FOR UPDATE USING (true);
  `
} 