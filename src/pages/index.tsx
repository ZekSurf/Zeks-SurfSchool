import React from 'react';
import Head from 'next/head';
import { Hero } from '@/components/Home/Hero';
import About from '@/components/Home/About';
import { Blog } from '@/components/Home/Blog';
import { BookingSection } from '@/components/Home/BookingSection';
import { ContactSection } from '@/components/Contact/ContactSection';
import { Layout } from '@/components/Layout/Layout';
import { Certifications } from '@/components/Home/Certifications';

export default function Home() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
      const sectionTop = bookingSection.offsetTop - navbarHeight;
      window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Head>
        <title>Zek's Surf School - Learn to Surf with Confidence</title>
        <meta name="description" content="Learn to surf with confidence. Ride your first wave today with Zek's Surf School's personalized lessons." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
          <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>

      <Layout onBookClick={scrollToBooking}>
        <Hero onBookClick={scrollToBooking} />
        
        <section id="booking" className="scroll-mt-16 min-[427px]:scroll-mt-20 lg:scroll-mt-24">
          <BookingSection />
        </section>

        <section id="about" className="scroll-mt-16 min-[427px]:scroll-mt-20 lg:scroll-mt-24">
          <About />
        </section>

        <section id="blog" className="scroll-mt-16 min-[427px]:scroll-mt-20 lg:scroll-mt-24">
          <Blog />
        </section>

        <section id="certifications" className="scroll-mt-16 min-[427px]:scroll-mt-20 lg:scroll-mt-24">
          <Certifications />
        </section>

        <section id="contact" className="scroll-mt-16 min-[427px]:scroll-mt-20 lg:scroll-mt-24">
          <ContactSection />
        </section>
      </Layout>
    </>
  );
} 