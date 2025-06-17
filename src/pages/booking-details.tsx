import React from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Layout/Navbar';
import { BookingDetails } from '@/components/Booking/BookingDetails';

export default function BookingDetailsPage() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Head>
        <title>Booking Details - Zek's Surf School</title>
        <meta name="description" content="Complete your surf lesson booking with Zek's Surf School." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
          <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>

      <Navbar onBookClick={scrollToBooking} />
      
      <main className="pt-16 min-[427px]:pt-20 lg:pt-24">
        <BookingDetails />
      </main>
    </>
  );
} 