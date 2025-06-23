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
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

    useEffect(() => {
    // Debug: Show all URL parameters
    const allParams = Object.keys(router.query).map(key => `${key}=${router.query[key]}`).join('&');
    setDebugInfo(`URL params: ${allParams || 'NONE'} | Router ready: ${router.isReady}`);
    
    // Only proceed if router is ready
    if (!router.isReady) {
      setDebugInfo(prev => prev + ' | Waiting for router...');
      return;
    }
    
    // Only use booking_id (UUID) from URL parameters
    const { booking_id } = router.query;
    setDebugInfo(prev => prev + ` | booking_id extracted: "${booking_id}" (type: ${typeof booking_id})`);
    
    // If someone tries to use the old payment_intent format, redirect them to the proper flow
    if (router.query.payment_intent && !booking_id) {
      const paymentIntent = router.query.payment_intent as string;
      
      setDebugInfo(`Redirecting old format URL to new system: ${paymentIntent}`);
      
      // Redirect to the redirect page which will handle the lookup and proper redirect
      router.replace(`/redirect-to-confirmation?payment_intent=${paymentIntent}`);
      return;
    }
    
    if (booking_id && typeof booking_id === 'string') {
      // Fetch the booking data with retry logic
      const fetchBookingWithRetry = async (retryCount = 0) => {
        const bookingIdInfo = `ID: ${booking_id} (length: ${booking_id.length}, type: ${typeof booking_id})`;
        setDebugInfo(`Fetching booking - ${bookingIdInfo} (attempt ${retryCount + 1})`);
        
        try {
          const apiUrl = `/api/booking/get-by-id?booking_id=${booking_id}`;
          setDebugInfo(prev => prev + ` | API URL: ${apiUrl}`);
          
          const response = await fetch(apiUrl);
          setDebugInfo(prev => prev + ` | Response status: ${response.status}`);
          
          const data = await response.json();
          setDebugInfo(prev => prev + ` | Response data: ${JSON.stringify(data)}`);
          
          if (data.success && data.booking) {
            setConfirmationNumber(data.booking.confirmationNumber);
            setPaymentIntentId(data.booking.paymentIntentId);
            setDebugInfo(prev => prev + ` | Success: ${data.booking.confirmationNumber}`);
            setIsLoading(false);
            return;
          }
          
          // If no booking found and we haven't retried enough, try again
          if (response.status === 404 && retryCount < 2) { // Reduced retries from 3 to 2
            setDebugInfo(prev => prev + ` | Booking not found, retrying in 1 second... (${retryCount + 1}/2)`);
            setTimeout(() => fetchBookingWithRetry(retryCount + 1), 1000); // Reduced delay
            return;
          }
          
          // After all retries failed
          setError(`Booking not found for ID: ${booking_id.slice(0, 8)}... Please check your booking confirmation email or contact support.`);
          setDebugInfo(prev => prev + ` | Booking not found after ${retryCount + 1} attempts`);
          setIsLoading(false);
          
        } catch (error) {
          console.error('Error fetching booking:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setDebugInfo(prev => prev + ` | Error: ${errorMessage}`);
          
          if (retryCount < 2) { // Reduced retries from 3 to 2
            setDebugInfo(prev => prev + ` | Network error, retrying in 1 second... (${retryCount + 1}/2)`);
            setTimeout(() => fetchBookingWithRetry(retryCount + 1), 1000); // Reduced delay
            return;
          }
          
          setError('Unable to load booking information. Please try again later or contact support.');
          setIsLoading(false);
        }
      };
      
      fetchBookingWithRetry();
    } else {
      // No booking ID provided
      setError('No booking ID provided. Please check your booking confirmation email for the correct link.');
      setDebugInfo('No booking ID in URL');
      setIsLoading(false);
    }

  }, [router.query, router.isReady]);

  // Separate useEffect for Google Ads tracking when confirmation number is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag && confirmationNumber) {
      // Track the conversion
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17228135601/xxxxx-xxxxx', // You'll need to replace with your actual conversion ID
        'value': 100, // You can dynamically set this based on booking value
        'currency': 'USD',
        'transaction_id': confirmationNumber
      });

      // Track as a custom event for optimization
      window.gtag('event', 'booking_completed', {
        'event_category': 'engagement',
        'event_label': 'surf_lesson_booking',
        'value': 100
      });
    }
  }, [confirmationNumber]);

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
            
            {/* Loading State */}
            {isLoading && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Loading Your Booking...
                </h1>
                <p className="text-gray-600">Please wait while we retrieve your booking information.</p>
              </>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 text-red-500">❌</div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Booking Not Found
                </h1>
                <div className="bg-red-50 rounded-lg p-6 mb-8">
                  <p className="text-red-800 mb-4">{error}</p>
                  <p className="text-red-600 text-sm">
                    If you believe this is an error, please contact our support team with your payment information.
                  </p>
                </div>
                
                {process.env.NODE_ENV === 'development' && debugInfo && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800 font-semibold">Debug Info:</p>
                    <p className="text-xs text-yellow-700 break-all">{debugInfo}</p>
                  </div>
                )}

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
              </>
            )}

            {/* Success State */}
            {!isLoading && !error && confirmationNumber && (
              <>
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
                  {process.env.NODE_ENV === 'development' && debugInfo && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800 font-semibold">Debug Info:</p>
                      <p className="text-xs text-yellow-700 break-all">{debugInfo}</p>
                      <p className="text-xs text-green-700 mt-1">✅ Secure Mode: Using Booking UUID</p>
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
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 