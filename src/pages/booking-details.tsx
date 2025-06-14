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
        <title>Booking Details - Zeko Surf</title>
        <meta name="description" content="Complete your surf lesson booking with Zeko Surf." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar onBookClick={scrollToBooking} />
      
      <main className="pt-16 min-[427px]:pt-20 lg:pt-24">
        <BookingDetails />
      </main>
    </>
  );
} 