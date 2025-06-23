import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RedirectToConfirmation() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const { payment_intent } = router.query;
    
    if (payment_intent && typeof payment_intent === 'string') {
      // Look up the booking UUID by payment intent ID
      fetch(`/api/booking/lookup-by-payment-intent?payment_intent=${payment_intent}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.booking_id) {
            // Force a complete page navigation to prevent reload issues
            window.location.href = `/confirmation?booking_id=${data.booking_id}`;
          } else {
            // This might be an older booking that doesn't exist in our current system
            setError(`This booking link is from an older system and may not be available. Payment Intent: ${payment_intent.slice(-8)}... Please check your email for booking details or contact support.`);
          }
        })
        .catch(error => {
          console.error('Error fetching booking:', error);
          setError(`Unable to find booking information for this payment. Please check your email for booking details or contact support. Reference: ${payment_intent.slice(-8)}...`);
        });
    } else {
      setError('No payment intent provided in the link');
    }
  }, [router.query, router]);

  return (
    <>
      <Head>
        <title>Redirecting... - Zek's Surf School</title>
        <meta name="robots" content="noindex" />
      </Head>
      
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          {!error ? (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Looking Up Your Booking...
              </h1>
              <p className="text-gray-600">Please wait while we find your booking confirmation.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 text-red-500">❌</div>
              </div>
                              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Booking Link Issue
                </h1>
                <p className="text-red-600 mb-4">{error}</p>
                <div className="text-sm text-gray-600 mb-6 text-left">
                  <p className="mb-2"><strong>What to do next:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check your email for booking confirmation details</li>
                    <li>Contact us if you need assistance finding your booking</li>
                    <li>Save any confirmation emails for future reference</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <a 
                    href="/"
                    className="block bg-[#1DA9C7] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1897B2] transition-colors text-center"
                  >
                    Return Home
                  </a>
                  <a 
                    href="/#contact"
                    className="block bg-white text-[#1DA9C7] px-6 py-3 rounded-lg font-medium border-2 border-[#1DA9C7] hover:bg-gray-50 transition-colors text-center"
                  >
                    Contact Support
                  </a>
                </div>
            </>
          )}
        </div>
      </div>
    </>
  );
} 