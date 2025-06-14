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
        <Navbar />
        <Hero />
      </main>
    </>
  );
} 