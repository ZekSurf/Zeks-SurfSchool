import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '@/context/CartContext';
import { Layout } from '@/components/Layout/Layout';
import { StripePaymentForm } from '@/components/Payment/StripePaymentForm';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, calculateTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const total = calculateTotalPrice();

  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string;
    code: string;
    amount: number;
    type: 'percentage' | 'fixed';
    description?: string;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // SECURITY: Removed payment intent logging - contains payment data
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

  // Handle discount code application with real API
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setIsApplyingDiscount(true);
    setDiscountError(null);

    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: discountCode,
          orderAmount: total
        }),
      });

      const data = await response.json();

      if (data.success && data.discount) {
        setAppliedDiscount({
          id: data.discount.id,
          code: data.discount.code,
          amount: data.discount.amount,
          type: data.discount.type,
          description: data.discount.description
        });
        setDiscountError(null);
      } else {
        setDiscountError(data.error || 'Invalid discount code');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      setDiscountError('Unable to apply discount code. Please try again.');
    }

    setIsApplyingDiscount(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError(null);
  };

  // Calculate discount amount
  const discountAmount = appliedDiscount 
    ? appliedDiscount.type === 'percentage' 
      ? (total * appliedDiscount.amount) / 100 
      : appliedDiscount.amount
    : 0;

  const finalTotal = Math.max(0, total - discountAmount);

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
                    amount={finalTotal}
                    customerInfo={customerInfo}
                    items={items}
                    discountInfo={appliedDiscount ? {
                      id: appliedDiscount.id,
                      code: appliedDiscount.code,
                      type: appliedDiscount.type,
                      amount: appliedDiscount.amount,
                      discountAmount: discountAmount
                    } : undefined}
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
                          <div className="flex-1">
                            <h3 className="font-medium">{item.beach}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(item.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })} at {item.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                          <span className="font-medium">${item.price}</span>
                            <button
                              onClick={() => removeItem(index)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Remove lesson"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.isPrivateLesson ? 'Private Lesson' : 'Group Lesson'}
                        </div>
                      </div>
                    ))}

                    {/* Discount Code Section */}
                    <div className="py-4 border-t border-gray-200">
                      {!appliedDiscount ? (
                        <div className="space-y-3">
                          <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700">
                            Discount Code
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              id="discountCode"
                              value={discountCode}
                              onChange={(e) => setDiscountCode(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                              placeholder="Enter code"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7] text-sm"
                              disabled={isApplyingDiscount}
                            />
                            <button
                              onClick={handleApplyDiscount}
                              disabled={isApplyingDiscount || !discountCode.trim()}
                              className="px-4 py-2 bg-[#1DA9C7] text-white rounded-lg hover:bg-[#1897B2] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium min-w-[80px] flex items-center justify-center"
                            >
                              {isApplyingDiscount ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-xs">Applying</span>
                                </div>
                              ) : (
                                'Apply'
                              )}
                            </button>
                          </div>
                          {discountError && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {discountError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-green-800">Code Applied: {appliedDiscount.code}</p>
                                <p className="text-xs text-green-600">
                                  {appliedDiscount.type === 'percentage' 
                                    ? `${appliedDiscount.amount}% off` 
                                    : `$${appliedDiscount.amount} off`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveDiscount}
                              className="text-green-600 hover:text-green-800 transition-colors p-1"
                              title="Remove discount"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="space-y-2 py-4 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Discount ({appliedDiscount.code})</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                      )}
                      <div className="flex justify-between items-center py-2 text-lg font-semibold border-t border-gray-200">
                      <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                      </div>
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