import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/Layout/Navbar';
import Head from 'next/head';

export default function ConfirmationPage() {
  const router = useRouter();
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Generate a random confirmation number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setConfirmationNumber(`SURF-${timestamp}-${random}`);

    // Get payment intent ID from URL parameters
    const { payment_intent } = router.query;
    if (payment_intent && typeof payment_intent === 'string') {
      setPaymentIntentId(payment_intent);
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>Order Confirmation - Zek's Surf School</title>
        <meta name="description" content="Thank you for booking your surf lesson with Zek's Surf School." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
          <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>

      <Navbar onBookClick={scrollToBooking} />

      <main className="pt-16 min-[427px]:pt-20 lg:pt-24 min-h-screen bg-neutral">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Your Order!
            </h1>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Confirmation</h2>
              <p className="text-gray-600 mb-4">Your confirmation number is:</p>
              <p className="text-2xl font-mono font-bold text-[#1DA9C7] mb-4">{confirmationNumber}</p>
              {paymentIntentId && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Payment ID:</p>
                  <p className="text-sm font-mono text-gray-600 break-all">{paymentIntentId}</p>
                </div>
              )}
              <div className="text-left space-y-3 text-gray-600">
                <p>
                  ✅ <strong>Payment successful!</strong> We've sent a confirmation email with your booking details and important information.
                  Please check your inbox (and spam folder, just in case).
                </p>
                <p>
                  Our team will be in contact with you shortly to discuss any specific requirements
                  and ensure you're fully prepared for your surf lesson.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h2>
              <ul className="text-left space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="text-[#1DA9C7] mr-2">1.</span>
                  Check your email for the confirmation and detailed instructions
                </li>
                <li className="flex items-start">
                  <span className="text-[#1DA9C7] mr-2">2.</span>
                  Arrive 15 minutes before your lesson time
                </li>
                <li className="flex items-start">
                  <span className="text-[#1DA9C7] mr-2">3.</span>
                  Bring sunscreen, water, and a towel
                </li>
                <li className="flex items-start">
                  <span className="text-[#1DA9C7] mr-2">4.</span>
                  We'll provide the surfboard and wetsuit
                </li>
              </ul>
            </div>

            <div className="space-x-4">
              <Link 
                href="/"
                className="inline-block bg-white text-[#1DA9C7] px-6 py-3 rounded-lg font-medium border-2 border-[#1DA9C7] hover:bg-gray-50 transition-colors"
              >
                Return Home
              </Link>
              <Link 
                href="/#booking"
                className="inline-block bg-[#1DA9C7] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1897B2] transition-colors"
              >
                Book Another Lesson
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 