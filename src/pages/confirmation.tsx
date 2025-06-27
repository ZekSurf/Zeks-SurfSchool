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
  const [bookings, setBookings] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

    useEffect(() => {
    // Only proceed if router is ready
    if (!router.isReady) {
      return;
    }
    
    const { booking_id, payment_intent } = router.query;
    

    
    // If we have a payment_intent, fetch all bookings for it
    if (payment_intent && typeof payment_intent === 'string') {
      const fetchAllBookings = async (retryCount = 0) => {
        try {
          const response = await fetch(`/api/booking/get-by-payment-intent?payment_intent=${payment_intent}`);
          const data = await response.json();
          
          if (data.success && data.bookings) {

            
            setBookings(data.bookings);
            setConfirmationNumber(data.confirmationNumber);
            setPaymentIntentId(payment_intent);
            setTotalAmount(data.totalAmount);
            setIsLoading(false);
            return;
          }
          
          // If no bookings found and we haven't retried enough, try again
          if (response.status === 404 && retryCount < 2) {
            setTimeout(() => fetchAllBookings(retryCount + 1), 1000);
            return;
          }
          
          // After all retries failed
          setError(`Bookings not found for payment intent: ${payment_intent.slice(-8)}... Please check your booking confirmation email or contact support.`);
          setIsLoading(false);
          
        } catch (error) {
          console.error('Error fetching bookings:', error);
          
          if (retryCount < 2) {
            setTimeout(() => fetchAllBookings(retryCount + 1), 1000);
            return;
          }
          
          setError('Unable to load booking information. Please try again later or contact support.');
          setIsLoading(false);
        }
      };
      
      fetchAllBookings();
    }
    // Fallback to single booking lookup for backward compatibility
    else if (booking_id && typeof booking_id === 'string') {
      // Fetch the booking data with retry logic
      const fetchBookingWithRetry = async (retryCount = 0) => {
        try {
          const response = await fetch(`/api/booking/get-by-id?booking_id=${booking_id}`);
          const data = await response.json();
          
          if (data.success && data.booking) {
            setBookings([data.booking]); // Single booking in array
            setConfirmationNumber(data.booking.confirmationNumber);
            setPaymentIntentId(data.booking.paymentIntentId);
            setTotalAmount(data.booking.price);
            setIsLoading(false);
            return;
          }
          
          // If no booking found and we haven't retried enough, try again
          if (response.status === 404 && retryCount < 2) {
            setTimeout(() => fetchBookingWithRetry(retryCount + 1), 1000);
            return;
          }
          
          // After all retries failed
          setError(`Booking not found for ID: ${booking_id.slice(0, 8)}... Please check your booking confirmation email or contact support.`);
          setIsLoading(false);
          
        } catch (error) {
          console.error('Error fetching booking:', error);
          
          if (retryCount < 2) {
            setTimeout(() => fetchBookingWithRetry(retryCount + 1), 1000);
            return;
          }
          
          setError('Unable to load booking information. Please try again later or contact support.');
          setIsLoading(false);
        }
      };
      
      fetchBookingWithRetry();
    } else {
      // No booking ID or payment intent provided
      setError('No booking information provided. Please check your booking confirmation email for the correct link.');
      setIsLoading(false);
    }

  }, [router.query, router.isReady]);

  // Separate useEffect for Google Ads tracking when confirmation number is available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag && confirmationNumber && totalAmount > 0) {
      // Track the conversion
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17228135601/xxxxx-xxxxx', // You'll need to replace with your actual conversion ID
        'value': totalAmount, // Use actual booking value
        'currency': 'USD',
        'transaction_id': confirmationNumber
      });

      // Track as a custom event for optimization
      window.gtag('event', 'booking_completed', {
        'event_category': 'engagement',
        'event_label': bookings.length > 1 ? 'multiple_surf_lesson_booking' : 'surf_lesson_booking',
        'value': totalAmount,
        'lessons_count': bookings.length
      });
    }
  }, [confirmationNumber, totalAmount, bookings.length]);

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

                {/* Booking Details */}
                {bookings.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      {bookings.length > 1 ? `Your ${bookings.length} Surf Lessons` : 'Your Surf Lesson'}
                    </h2>
                    <div className="space-y-4">
                      {bookings.map((booking, index) => (
                        <div key={booking.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {bookings.length > 1 && `Lesson ${index + 1}: `}{booking.beach}
                              </h3>
                              {booking.isPrivate && (
                                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                                  Private Lesson
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-[#1DA9C7]">${booking.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {new Date(booking.startTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })} - {new Date(booking.endTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {bookings.length > 1 && (
                        <div className="border-t border-gray-300 pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                            <span className="text-xl font-bold text-[#1DA9C7]">${totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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