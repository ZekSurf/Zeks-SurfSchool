import React from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Layout/Navbar';
import { Hero } from '@/components/Home/Hero';

export default function Testing() {
  return (
    <>
      <Head>
        <title>Zeko Surf - Learn to Surf with Confidence</title>
        <meta name="description" content="Learn to surf with confidence. Ride your first wave today with Zeko Surf's personalized lessons." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        <Navbar onBookClick={scrollToBooking} />
        <Hero onBookClick={scrollToBooking} />
      </main>
    </>
  );
}

function scrollToBooking() {
  const bookingSection = document.getElementById('booking');
  if (bookingSection) {
    const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
    const sectionTop = bookingSection.offsetTop - navbarHeight;
    window.scrollTo({ top: sectionTop, behavior: 'smooth' });
  }
} 