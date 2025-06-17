import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '@/context/CartContext';
import { Layout } from '@/components/Layout/Layout';
import { StripePaymentForm } from '@/components/Payment/StripePaymentForm';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, calculateTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const total = calculateTotalPrice();

  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    setPaymentSuccess(true);
    setPaymentError(null);
    
    // Clear cart and redirect to confirmation page
    clearCart();
    router.push(`/confirmation?payment_intent=${paymentIntentId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
      const sectionTop = bookingSection.offsetTop - navbarHeight;
      window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Load contact info from localStorage
    const savedContactInfo = localStorage.getItem('contactInfo');
    if (savedContactInfo) {
      const { name, email, phone } = JSON.parse(savedContactInfo);
      const [firstName, ...lastNameParts] = name.split(' ');
      setCustomerInfo({
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: email || '',
        phone: phone || '',
      });
    }
  }, []);

  // Calculate total with tax
  const totalWithTax = total * 1.08;

  return (
    <>
      <Head>
        <title>Checkout - Zek's Surf School</title>
        <meta name="description" content="Complete your surf lesson purchase with Zek's Surf School." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
          <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>

      <Layout onBookClick={scrollToBooking}>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          {items.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some surf lessons to get started!</p>
              <button
                onClick={() => router.push('/#booking')}
                className="bg-[#1DA9C7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1897B2] transition-colors shadow-lg"
              >
                Book a Lesson
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-8">
                {/* Customer Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Error Display */}
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-red-800 font-medium mb-2">Payment Error</div>
                    <div className="text-red-600">{paymentError}</div>
                  </div>
                )}

                {/* Stripe Payment Form */}
                {customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone && (
                  <StripePaymentForm
                    amount={totalWithTax}
                    customerInfo={customerInfo}
                    items={items}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}

              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="py-4 border-b border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{item.beach}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(item.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })} at {item.time}
                            </p>
                          </div>
                          <span className="font-medium">${item.price}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.isPrivateLesson ? 'Private Lesson' : 'Group Lesson'}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${(total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${((total || 0) * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-lg font-semibold">
                      <span>Total</span>
                      <span>${totalWithTax.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Complete your customer information above to proceed with payment.
                      Payment will be processed securely through Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
} 