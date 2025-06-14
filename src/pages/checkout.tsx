import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '@/context/CartContext';
import { Layout } from '@/components/Layout/Layout';

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

  const [billingInfo, setBillingInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  // Format card number with spaces after every 4 digits
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setBillingInfo({ ...billingInfo, cardNumber: formattedValue });
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setBillingInfo({ ...billingInfo, expiryDate: formattedValue });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear cart and redirect to success page
    clearCart();
    router.push('/success');
  };

  return (
    <>
      <Head>
        <title>Checkout - Zeko Surf</title>
        <meta name="description" content="Complete your surf lesson purchase with Zeko Surf." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout onBookClick={scrollToBooking}>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <form onSubmit={handleSubmit}>
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

                {/* Billing Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Billing Information</h2>
                  <div className="space-y-6">
                    {/* Card Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          value={billingInfo.cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          value={billingInfo.expiryDate}
                          onChange={handleExpiryDateChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          value={billingInfo.cvv}
                          onChange={(e) => setBillingInfo({ ...billingInfo, cvv: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Billing Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            value={billingInfo.address}
                            onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                            placeholder="123 Main St"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">
                            Apartment, suite, etc. (optional)
                          </label>
                          <input
                            type="text"
                            id="address2"
                            value={billingInfo.address2}
                            onChange={(e) => setBillingInfo({ ...billingInfo, address2: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                            placeholder="Apt 4B"
                          />
                        </div>
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            value={billingInfo.city}
                            onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            id="state"
                            value={billingInfo.state}
                            onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            value={billingInfo.zipCode}
                            onChange={(e) => setBillingInfo({ ...billingInfo, zipCode: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <select
                            id="country"
                            value={billingInfo.country}
                            onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                            required
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="MX">Mexico</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                      <span>${((total || 0) * 1.08).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full mt-8 bg-[#1DA9C7] text-white px-6 py-3 rounded-lg font-medium shadow-lg 
                      hover:bg-[#1897B2] transition-colors ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Complete Purchase'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
} 