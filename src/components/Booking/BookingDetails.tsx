import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { WaiverAgreement } from './WaiverAgreement';

const WETSUIT_SIZES = [
  'Youth XS', 'Youth S', 'Youth M', 'Youth L',
  'XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL'
];

const WETSUIT_SIZE_GUIDE = [
  { size: 'Youth XS', height: '3\'10\"–4\'2\"', weight: '45–55 lbs', chest: '23–25"' },
  { size: 'Youth S', height: '4\'2\"–4\'6\"', weight: '55–65 lbs', chest: '25–27"' },
  { size: 'Youth M', height: '4\'6\"–4\'10\"', weight: '65–75 lbs', chest: '27–29"' },
  { size: 'Youth L', height: '4\'10\"–5\'1\"', weight: '75–90 lbs', chest: '29–31"' },
  { size: 'XS', height: '5\'3\"–5\'5\"', weight: '110–125 lbs', chest: '32–34"' },
  { size: 'S', height: '5\'5\"–5\'7\"', weight: '125–140 lbs', chest: '34–36"' },
  { size: 'M', height: '5\'7\"–5\'9\"', weight: '140–160 lbs', chest: '36–38"' },
  { size: 'ML', height: '5\'9\"–5\'11\"', weight: '160–180 lbs', chest: '38–40"' },
  { size: 'L', height: '5\'11\"–6\'1\"', weight: '180–200 lbs', chest: '40–42"' },
  { size: 'XL', height: '6\'1\"–6\'3\"', weight: '200–220 lbs', chest: '42–44"' },
  { size: 'XXL', height: '6\'3\"–6\'6\"', weight: '220–250 lbs', chest: '44–48"' },
];

interface BookingDetailsProps {
  // Add props if needed
}

export const BookingDetails: React.FC<BookingDetailsProps> = () => {
  const router = useRouter();
  const { beach, date, time, conditions, price: basePrice, weather } = router.query;
  const { addItem, itemCount } = useCart();

  const [isPrivateLesson, setIsPrivateLesson] = useState(false);
  const [isBookingForOthers, setIsBookingForOthers] = useState(false);
  const [otherPersonInfo, setOtherPersonInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [wetsuitSize, setWetsuitSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Waiver state
  const [waiverSigned, setWaiverSigned] = useState(false);
  const [waiverData, setWaiverData] = useState<any>(null);

  const formattedDate = date ? new Date(date as string).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  const totalPrice = useMemo(() => {
    const base = Number(basePrice) || 0;
    const privateLessonFee = isPrivateLesson ? 50 : 0;
    return base + privateLessonFee;
  }, [basePrice, isPrivateLesson]);

  const handleAddToCart = () => {
    addItem({
      beach: beach as string,
      date: date as string,
      time: time as string,
      conditions: conditions as string,
      weather: weather as string,
      price: totalPrice,
      isPrivateLesson,
      wetsuitSize,
      ...(isBookingForOthers && {
        bookingForOthers: otherPersonInfo
      }),
      waiver: waiverData,
    });
    
    // Navigate to cart page after adding item
    router.push('/cart');
  };

  const handleAddAndBookAnother = () => {
    addItem({
      beach: beach as string,
      date: date as string,
      time: time as string,
      conditions: conditions as string,
      weather: weather as string,
      price: totalPrice,
      isPrivateLesson,
      wetsuitSize,
      ...(isBookingForOthers && {
        bookingForOthers: otherPersonInfo
      }),
      waiver: waiverData,
    });
    
    // Navigate back to booking section
    router.push('/#booking').then(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const handleCheckout = () => {
    addItem({
      beach: beach as string,
      date: date as string,
      time: time as string,
      conditions: conditions as string,
      weather: weather as string,
      price: totalPrice,
      isPrivateLesson,
      wetsuitSize,
      ...(isBookingForOthers && {
        bookingForOthers: otherPersonInfo
      }),
      waiver: waiverData,
    });
    
    // Then go to cart page
    router.push('/cart');
  };

  const getDiscountMessage = () => {
    if (itemCount === 0) return "Book multiple lessons and save up to 25%!";
    if (itemCount === 1) return "Add this lesson and get 15% off!";
    return "Add this lesson and get 25% off!";
  };

  return (
    <div className="min-h-screen bg-neutral py-12 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Beach</span>
              <span className="font-medium">{beach}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Time</span>
              <span className="font-medium">{time}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Conditions</span>
              <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                conditions === 'Good' ? 'bg-green-100 text-green-800' :
                conditions === 'Decent' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>{conditions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Weather</span>
              <span className="font-medium">{weather}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Base Price</span>
              <span className="font-medium">${basePrice}</span>
            </div>
            {/* Wetsuit Size Dropdown */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Wetsuit Size</span>
              <select
                className="font-medium border rounded px-2 py-1 focus:ring-2 focus:ring-[#1DA9C7] focus:border-[#1DA9C7] bg-white"
                value={wetsuitSize}
                onChange={e => setWetsuitSize(e.target.value)}
              >
                <option value="">Select size</option>
                {WETSUIT_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              <button
                type="button"
                className="text-[#1DA9C7] underline text-sm font-medium focus:outline-none"
                onClick={() => setShowSizeGuide(s => !s)}
              >
                {showSizeGuide ? 'Hide size guide' : 'Show size guide'}
              </button>
            </div>
          </div>
          {showSizeGuide && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Wetsuit Size Guide (inches & lbs)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Size</th>
                      <th className="py-2 px-3 font-semibold">Height</th>
                      <th className="py-2 px-3 font-semibold">Weight</th>
                      <th className="py-2 px-3 font-semibold">Chest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WETSUIT_SIZE_GUIDE.map(row => (
                      <tr key={row.size} className="border-t border-gray-100">
                        <td className="py-1 px-3">{row.size}</td>
                        <td className="py-1 px-3">{row.height}</td>
                        <td className="py-1 px-3">{row.weight}</td>
                        <td className="py-1 px-3">{row.chest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Booking Options */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Booking Options</h2>
          {/* Private Lesson Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Private Lesson</h3>
              <p className="text-sm text-gray-500">Guaranteed one-on-one instruction</p>
            </div>
            <button
              onClick={() => setIsPrivateLesson(!isPrivateLesson)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPrivateLesson ? 'bg-[#1DA9C7]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPrivateLesson ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {/* Booking For Others Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Booking For Someone Else?</h3>
              <p className="text-sm text-gray-500">Enter the lesson taker's information</p>
            </div>
            <button
              onClick={() => setIsBookingForOthers(!isBookingForOthers)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isBookingForOthers ? 'bg-[#1DA9C7]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isBookingForOthers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {isBookingForOthers && (
            <div className="space-y-4 mt-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={otherPersonInfo.name}
                  onChange={(e) => setOtherPersonInfo({ ...otherPersonInfo, name: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1DA9C7] focus:border-[#1DA9C7] sm:text-sm transition-colors"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={otherPersonInfo.email}
                  onChange={(e) => setOtherPersonInfo({ ...otherPersonInfo, email: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1DA9C7] focus:border-[#1DA9C7] sm:text-sm transition-colors"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={otherPersonInfo.phone}
                  onChange={(e) => setOtherPersonInfo({ ...otherPersonInfo, phone: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1DA9C7] focus:border-[#1DA9C7] sm:text-sm transition-colors"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          )}
        </div>

        {/* Waiver Agreement Step */}
        <WaiverAgreement
          onAccept={(data) => {
            setWaiverSigned(true);
            setWaiverData(data);
          }}
        />

        {/* Multi-Lesson Discount Banner (moved below waiver) */}
        <div className="bg-[#1DA9C7]/10 border-2 border-[#1DA9C7] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#1DA9C7]">Multi-Lesson Discount</h3>
              <p className="text-gray-600">{getDiscountMessage()}</p>
            </div>
            <button
              onClick={handleAddAndBookAnother}
              className={`bg-[#1DA9C7] text-white px-6 py-2 rounded-lg transition-colors shadow-md ${!waiverSigned ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-400 border border-gray-300' : 'hover:bg-[#1897B2]'}`}
              disabled={!waiverSigned}
            >
              Add & Book Another
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            className={`flex-1 px-6 py-3 rounded-lg font-medium shadow-md border-2 transition-all
              ${waiverSigned ? 'bg-white text-[#1DA9C7] border-[#1DA9C7] hover:bg-gray-50' : 'bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed opacity-50'}`}
            disabled={!waiverSigned}
          >
            Add to Cart
          </button>
          <button
            onClick={handleCheckout}
            className={`flex-1 px-6 py-3 rounded-lg font-medium shadow-lg transition-all
              ${waiverSigned ? 'bg-[#1DA9C7] text-white hover:bg-[#1897B2] hover:shadow-xl hover:scale-[1.02]' : 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50'}`}
            disabled={!waiverSigned}
          >
            Continue to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails; 