import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '@/context/CartContext';
import { Layout } from '@/components/Layout/Layout';
import { StripePaymentForm } from '@/components/Payment/StripePaymentForm';

export default function PaymentPage() {
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

  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string;
    code: string;
    amount: number;
    type: 'percentage' | 'fixed';
    description?: string;
  } | null>(null);

  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    // Load customer info from localStorage
    const savedCustomerInfo = localStorage.getItem('checkoutCustomerInfo');
    const savedDiscount = localStorage.getItem('checkoutDiscount');

    if (savedCustomerInfo) {
      setCustomerInfo(JSON.parse(savedCustomerInfo));
    } else {
      // If no customer info, redirect back to checkout
      router.push('/checkout');
      return;
    }

    if (savedDiscount) {
      setAppliedDiscount(JSON.parse(savedDiscount));
    }

    // If cart is empty, redirect to home
    if (items.length === 0) {
      router.push('/');
      return;
    }
  }, [items.length, router]);

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment success handler called with payment intent:', paymentIntentId);
    
    try {
      // Clear cart and saved data
      clearCart();
      localStorage.removeItem('checkoutCustomerInfo');
      localStorage.removeItem('checkoutDiscount');
      
      console.log('Cleared cart and localStorage, attempting redirect...');
      
      // Redirect to confirmation page
      router.push(`/redirect-to-confirmation?payment_intent=${paymentIntentId}`);
    } catch (error) {
      console.error('Error in payment success handler:', error);
      // Fallback: force navigation if router.push fails
      window.location.href = `/redirect-to-confirmation?payment_intent=${paymentIntentId}`;
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
  };

  const handleBackToCheckout = () => {
    router.push('/checkout');
  };

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      const navbarHeight = document.querySelector('nav')?.offsetHeight || 0;
      const sectionTop = bookingSection.offsetTop - navbarHeight;
      window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
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
        <title>Payment - Zek's Surf School</title>
        <meta name="description" content="Complete your surf lesson payment with Zek's Surf School." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
        <link rel="apple-touch-icon" href="/zeks-logo.png" />
      </Head>

      <Layout onBookClick={scrollToBooking}>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToCheckout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Checkout
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Information Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{customerInfo.firstName} {customerInfo.lastName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{customerInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{customerInfo.phone}</p>
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
            </div>

            {/* Right Column - Order Summary (Read-only) */}
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
                        <span className="font-medium">${item.price}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.isPrivateLesson ? 'Private Lesson' : 'Group Lesson'}
                      </div>
                    </div>
                  ))}

                  {/* Applied Discount Display */}
                  {appliedDiscount && (
                    <div className="py-4 border-t border-gray-200">
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
                      </div>
                    </div>
                  )}

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

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">Secure Payment</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your payment information is encrypted and processed securely through Stripe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
} 