import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types for TypeScript
export interface BookingRow {
  id: string;
  payment_intent_id: string;
  confirmation_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  beach: string;
  lesson_date: string; // YYYY-MM-DD format
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  price: number;
  lessons_booked: number;
  is_private: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

// Staff PIN configuration interface
export interface StaffPinRow {
  id: string;
  pin: string;
  is_active: boolean;
  created_at: string;
  last_used?: string;
  updated_at: string;
} 