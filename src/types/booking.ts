export interface BookingRequest {
  date: string; // ISO date string like "2025-06-10"
  beach: string; // Beach name like "Doheny"
  lat: number;
  lng: number;
  dateTime: string; // ISO datetime string like "2025-06-10T00:00:00-07:00"
}

export interface BookingSlot {
  slotId: string;
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  label: string; // "Great", "Good", "Decent"
  price: number;
  openSpaces: string; // Number as string
  available: boolean;
  sky: string; // "Sunny", "Partly Cloudy", "Cloudy"
}

export interface BookingResponse {
  beach: string;
  date: string; // ISO date string
  slots: BookingSlot[];
  meta: {
    fetchedAt: string; // ISO datetime string
    timezone: string; // "America/Los_Angeles"
  };
}

export interface BeachCoordinates {
  lat: number;
  lng: number;
}

// Staff management types
export interface CompletedBooking {
  id: string;
  confirmationNumber: string;
  paymentIntentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  beach: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  price: number;
  lessonsBooked: number;
  isPrivate: boolean;
  timestamp: string; // ISO datetime when booking was completed
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface StaffPinConfig {
  pin: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface WaiverSignature {
  id?: string;
  slot_id: string;
  payment_intent_id?: string;
  booking_id?: string;
  signer_name: string;
  participant_name: string;
  guardian_name?: string;
  is_minor: boolean;
  customer_email: string;
  customer_phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  signed_at: string;
  ip_address: string;
  user_agent: string;
  waiver_version: string;
  created_at?: string;
  updated_at?: string;
}

export interface WaiverData {
  participantName: string;
  guardianName?: string;
  date: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
} 