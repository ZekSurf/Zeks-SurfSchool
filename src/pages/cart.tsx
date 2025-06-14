import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/Layout/Navbar';
import { useCart } from '@/context/CartContext';
import { WetsuitSizeGuide } from '@/components/Home/WetsuitSizeGuide';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, calculateTotalPrice } = useCart();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    wetsuitSize: '',
    specialRequests: ''
  });

  const totalPrice = calculateTotalPrice();
  const originalTotal = items.reduce((sum, item) => sum + item.price, 0);
  const totalSavings = originalTotal - totalPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save contact info to local storage for use in checkout
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
    // Navigate to checkout page
    router.push('/checkout');
  };

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Head>
        <title>Cart - Zeko Surf</title>
        <meta name="description" content="Review your surf lessons and complete your booking." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar onBookClick={scrollToBooking} />
      
      <WetsuitSizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <main className="pt-16 min-[427px]:pt-20 lg:pt-24 min-h-screen bg-neutral">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl min-[427px]:text-4xl font-bold text-gray-900 mb-8 font-poppins">Your Cart</h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-poppins">Your cart is empty</h2>
              <p className="text-gray-600 mb-6 font-poppins">Add some surf lessons to get started!</p>
              <button
                onClick={() => router.push('/#booking')}
                className="bg-[#1DA9C7] text-white px-8 py-3 rounded-xl font-poppins font-bold hover:bg-[#1897B2] transition-colors shadow-lg"
              >
                Book a Lesson
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cart Items */}
              <div className="space-y-6">
                {items.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 font-poppins">
                        Surf Lesson at {item.beach}
                        {index === 1 && (
                          <span className="ml-2 text-sm text-[#1DA9C7] font-normal">
                            (15% off!)
                          </span>
                        )}
                        {index >= 2 && (
                          <span className="ml-2 text-sm text-[#1DA9C7] font-normal">
                            (25% off!)
                          </span>
                        )}
                      </h3>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Date:</span>
                        <span>{new Date(item.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Time:</span>
                        <span>{item.time}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Conditions:</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          item.conditions === 'Good' ? 'bg-green-100 text-green-800' :
                          item.conditions === 'Decent' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>{item.conditions}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Weather:</span>
                        <span>{item.weather}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Lesson Type:</span>
                        <span>{item.isPrivateLesson ? 'Private (+$50)' : 'Group'}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Lesson For:</span>
                        <span>{item.bookingForOthers?.name || 'You'}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t">
                        <span>Price:</span>
                        <div className="text-right">
                          {item.discountedPrice !== item.price && (
                            <span className="text-gray-500 line-through text-sm mr-2">
                              ${item.price}
                            </span>
                          )}
                          <span className="text-[#1DA9C7]">
                            ${item.discountedPrice?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-[#1DA9C7]/10 border-2 border-[#1DA9C7] rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-[#1DA9C7]">Add Another Lesson</h3>
                      <p className="text-gray-600">
                        {items.length === 1 ? (
                          "Add a second lesson and get 15% off!"
                        ) : items.length === 2 ? (
                          "Add a third lesson and get 25% off!"
                        ) : (
                          "Get 25% off additional lessons!"
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/#booking')}
                      className="bg-[#1DA9C7] text-white px-6 py-2 rounded-lg hover:bg-[#1897B2] transition-colors shadow-md"
                    >
                      Add Lesson
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information Form */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-poppins">Contact Information</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                    />
                  </div>

                  <div>
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      id="specialRequests"
                      value={contactInfo.specialRequests}
                      onChange={(e) => setContactInfo({ ...contactInfo, specialRequests: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Subtotal:</span>
                        <span>${originalTotal.toFixed(2)}</span>
                      </div>
                      {totalSavings > 0 && (
                        <div className="flex justify-between items-center text-[#1DA9C7]">
                          <span>Multi-Lesson Savings:</span>
                          <span>-${totalSavings.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xl font-semibold text-gray-800 pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-2xl font-bold text-[#1DA9C7]">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1DA9C7] text-white px-6 py-3 rounded-xl font-poppins font-bold hover:bg-[#1897B2] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      Proceed to Checkout →
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 