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
            // Redirect to the confirmation page with the booking UUID
            router.replace(`/confirmation?booking_id=${data.booking_id}`);
          } else {
            setError('Booking not found or payment not completed');
          }
        })
        .catch(error => {
          console.error('Error fetching booking:', error);
          setError('Error loading booking information');
        });
    } else {
      setError('No payment intent provided');
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
                Processing Your Payment...
              </h1>
              <p className="text-gray-600">Please wait while we redirect you to your booking confirmation.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 text-red-500">❌</div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Error
              </h1>
              <p className="text-red-600 mb-4">{error}</p>
              <a 
                href="/"
                className="inline-block bg-[#1DA9C7] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1897B2] transition-colors"
              >
                Return Home
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
} 