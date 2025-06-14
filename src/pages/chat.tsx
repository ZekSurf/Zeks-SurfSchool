import React from 'react';
import Head from 'next/head';
import { FullPageChat } from '@/components/Chat/FullPageChat';
import { Layout } from '@/components/Layout/Layout';

const ChatPage = () => {
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
        <title>Chat with SurfBot - Zeko Surf</title>
        <meta name="description" content="Chat with our AI surf concierge to learn more about surf lessons and conditions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout onBookClick={scrollToBooking} hideFooter>
        <div className="fixed inset-0 top-16 min-[427px]:top-20 lg:top-24">
          <FullPageChat />
        </div>
      </Layout>
    </>
  );
};

export default ChatPage; 