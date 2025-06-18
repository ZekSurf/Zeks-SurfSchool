import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  status: 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
} 