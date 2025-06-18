import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Simple file-based storage for bookings
// In production, you would use a proper database
const BOOKINGS_FILE = path.join(process.cwd(), 'temp-bookings.json');

interface StoredBooking {
  paymentIntentId: string;
  confirmationNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPrivate: boolean;
  lessonsBooked: number;
  slotData: {
    beach: string;
    date: string;
    slotId: string;
    startTime: string;
    endTime: string;
    label: string;
    price: number;
    openSpaces: number;
    available: boolean;
  };
  timestamp: string;
}

function readBookingsFile(): StoredBooking[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading bookings file:', error);
    return [];
  }
}

function writeBookingsFile(bookings: StoredBooking[]): void {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error('Error writing bookings file:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const bookings = readBookingsFile();
      res.status(200).json({ 
        success: true, 
        bookings,
        count: bookings.length 
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      const newBooking: StoredBooking = req.body;
      
      if (!newBooking.paymentIntentId) {
        return res.status(400).json({ error: 'Payment Intent ID is required' });
      }

      const bookings = readBookingsFile();
      
      // Check if booking already exists
      const existingIndex = bookings.findIndex(b => b.paymentIntentId === newBooking.paymentIntentId);
      
      if (existingIndex >= 0) {
        // Update existing booking
        bookings[existingIndex] = newBooking;
        console.log('Updated existing booking:', newBooking.paymentIntentId);
      } else {
        // Add new booking
        bookings.push(newBooking);
        console.log('Added new booking:', newBooking.paymentIntentId);
      }
      
      writeBookingsFile(bookings);
      
      res.status(200).json({ 
        success: true, 
        message: 'Booking saved successfully',
        paymentIntentId: newBooking.paymentIntentId
      });
    } catch (error) {
      console.error('Error saving booking:', error);
      res.status(500).json({ error: 'Failed to save booking' });
    }
  }
  else if (req.method === 'DELETE') {
    try {
      const { paymentIntentId } = req.query;
      
      if (!paymentIntentId) {
        return res.status(400).json({ error: 'Payment Intent ID is required' });
      }

      const bookings = readBookingsFile();
      const filteredBookings = bookings.filter(b => b.paymentIntentId !== paymentIntentId);
      
      writeBookingsFile(filteredBookings);
      
      res.status(200).json({ 
        success: true, 
        message: 'Booking deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({ error: 'Failed to delete booking' });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
} 