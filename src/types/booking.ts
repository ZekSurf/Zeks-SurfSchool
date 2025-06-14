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