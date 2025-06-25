import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { WaiverAgreement } from './WaiverAgreement';

const WETSUIT_SIZES = [
  'I will bring my own / Don\'t need one',
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

interface SlotData {
  slotId: string;
  startTime: string;
  endTime: string;
  price: number;
  available: boolean;
  availableSpaces: number;
  conditions: string;
  weather: string;
  beach: string;
  date: string;
  time: string;
  formattedDate: string;
}

export const BookingDetails: React.FC<BookingDetailsProps> = () => {
  const router = useRouter();
  const { id: slotId } = router.query;
  const { addItem, itemCount } = useCart();
  
  // Slot data state
  const [slotData, setSlotData] = useState<SlotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | 'checkout' | 'another' | null>(null);
  const [highlightWetsuit, setHighlightWetsuit] = useState(false);
  
  // Ref for wetsuit section
  const wetsuitRef = useRef<HTMLDivElement>(null);

  // Fetch slot data when component mounts
  useEffect(() => {
    const fetchSlotData = async () => {
      // Validate slot ID format and presence
      if (!slotId) {
        setError('No booking slot specified. Please select a time slot from the booking page.');
        setIsLoading(false);
        return;
      }

      if (typeof slotId !== 'string') {
        setError('Invalid booking slot format. Please select a valid time slot.');
        setIsLoading(false);
        return;
      }

      // Basic format validation for slot ID (should contain timestamp and random string)
      if (slotId.length < 10 || !slotId.includes('-')) {
        setError('Invalid booking slot ID format. Please select a time slot from the booking page.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/booking-slot/${slotId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          // Handle specific error cases
          if (response.status === 404) {
            setError('This booking slot is no longer available or has expired. Please select a new time slot.');
          } else if (response.status === 400) {
            setError('Invalid booking slot ID. Please select a valid time slot from the booking page.');
          } else {
            setError(result.error || 'Failed to load booking details. Please try again.');
          }
          return;
        }

        // Validate that we received valid slot data
        if (!result.data || !result.data.slotId || !result.data.beach || !result.data.date) {
          setError('Invalid booking data received. Please select a new time slot.');
          return;
        }

        setSlotData(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching slot data:', err);
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Failed to load booking details. Please try again or select a new time slot.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlotData();
  }, [slotId]);

  const totalPrice = useMemo(() => {
    const base = slotData?.price || 0;
    const privateLessonFee = isPrivateLesson ? 50 : 0;
    return base + privateLessonFee;
  }, [slotData?.price, isPrivateLesson]);

  const checkWetsuitSize = () => {
    if (!wetsuitSize) {
      setHighlightWetsuit(true);
      wetsuitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHighlightWetsuit(false), 3000); // Remove highlight after 3 seconds
      return false;
    }
    return true;
  };

  const executeAction = () => {
    if (!checkWetsuitSize()) return;

    if (!slotData) return;

    const itemData = {
      beach: slotData.beach,
      date: slotData.date,
      time: slotData.time, // Display time (1 hour for user)
      startTime: slotData.startTime, // Original backend start time
      endTime: slotData.endTime, // Original backend end time (1.5 hours)
      conditions: slotData.conditions,
      weather: slotData.weather,
      price: totalPrice,
      isPrivateLesson,
      wetsuitSize,
      slotId: slotData.slotId,
      openSpaces: slotData.availableSpaces,
      available: slotData.available,
      ...(isBookingForOthers && {
        bookingForOthers: otherPersonInfo
      })
    };

    addItem(itemData);

    switch (pendingAction) {
      case 'cart':
        router.push('/cart');
        break;
      case 'checkout':
        router.push('/checkout');
        break;
      case 'another':
    router.push('/#booking').then(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
        break;
    }
  };

  const handleWaiverAccept = (data: any) => {
    setWaiverSigned(true);
    setWaiverData(data);
    // Save waiver data to localStorage for payment processing
    localStorage.setItem('waiverData', JSON.stringify(data));
    setShowWaiverModal(false);
    executeAction();
  };

  const handleAddToCart = () => {
    if (waiverSigned) {
      setPendingAction('cart');
      executeAction();
    } else {
      setPendingAction('cart');
      setShowWaiverModal(true);
    }
  };

  const handleAddAndBookAnother = () => {
    if (waiverSigned) {
      setPendingAction('another');
      executeAction();
    } else {
      setPendingAction('another');
      setShowWaiverModal(true);
    }
  };

  const handleCheckout = () => {
    if (waiverSigned) {
      setPendingAction('checkout');
      executeAction();
    } else {
      setPendingAction('checkout');
      setShowWaiverModal(true);
    }
  };

  const getDiscountMessage = () => {
    if (itemCount === 0) return "Book multiple lessons and save up to 25%!";
    if (itemCount === 1) return "Add this lesson and get 15% off!";
    return "Add this lesson and get 25% off!";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral py-8 px-4 sm:px-6 lg:px-8 font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1DA9C7] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !slotData) {
    const isInvalidId = error?.includes('Invalid') || error?.includes('format') || error?.includes('specified');
    const isExpiredSlot = error?.includes('expired') || error?.includes('no longer available');
    
    return (
      <div className="min-h-screen bg-neutral py-8 px-4 sm:px-6 lg:px-8 font-poppins flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="font-bold mb-2">
              {isInvalidId ? 'Invalid Booking Link' : 
               isExpiredSlot ? 'Slot No Longer Available' : 
               'Error Loading Booking Details'}
            </p>
            <p className="text-sm leading-relaxed">{error || 'Booking data not found'}</p>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/#booking" 
              className="block bg-[#1DA9C7] text-white px-6 py-3 rounded-lg hover:bg-[#1897B2] transition-colors font-medium"
            >
              Select a New Time Slot
            </Link>
            
            <button
              onClick={() => router.back()}
              className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
          
          {isInvalidId && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">💡 How to book properly:</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to the booking section</li>
                <li>Select your preferred beach</li>
                <li>Choose a date</li>
                <li>Click "Book" on an available time slot</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral py-8 px-4 sm:px-6 lg:px-8 font-poppins overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary & Options */}
          <div className="space-y-6">
            {/* Comprehensive Lesson Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Lesson Details</h2>
              
              {/* Basic Details */}
              <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Beach</span>
                  <span className="font-medium">{slotData.beach}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Date</span>
                  <span className="font-medium">{slotData.formattedDate}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Time</span>
                  <span className="font-medium">{slotData.time}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Conditions</span>
              <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                    slotData.conditions === 'Great' ? 'bg-green-100 text-green-800' :
                    slotData.conditions === 'Good' ? 'bg-green-100 text-green-800' :
                    slotData.conditions === 'Decent' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
                  }`}>{slotData.conditions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Weather</span>
                  <span className="font-medium">{slotData.weather}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">${slotData.price}</span>
                </div>
            </div>

              {/* Wetsuit Size Selection */}
              <div 
                ref={wetsuitRef}
                className={`mb-6 transition-all duration-500 overflow-hidden ${
                  highlightWetsuit ? 'ring-4 ring-red-300 ring-opacity-75 rounded-lg p-4 bg-red-50' : ''
                }`}
              >
                <h3 className="text-lg font-medium text-gray-800 mb-3">Wetsuit Size</h3>
                <div className="space-y-4 overflow-hidden">
                  <div className="relative">
              <select
                      className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1DA9C7] focus:border-[#1DA9C7] bg-white appearance-none bg-no-repeat bg-right text-base sm:text-sm max-w-full"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.25em 1.25em',
                        minHeight: '44px' // iOS minimum touch target
                      }}
                value={wetsuitSize}
                onChange={e => setWetsuitSize(e.target.value)}
                      required
              >
                      <option value="">Select your wetsuit size</option>
                {WETSUIT_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
              <button
                type="button"
                    className="text-[#1DA9C7] underline text-sm font-medium hover:no-underline focus:outline-none"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
              >
                    {showSizeGuide ? 'Hide size guide' : 'View size guide'}
              </button>
          {showSizeGuide && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Wetsuit Size Guide</h4>
              <div className="overflow-x-auto">
                        <table className="w-full text-xs border border-gray-200 rounded">
                  <thead className="bg-gray-100">
                    <tr>
                              <th className="py-2 px-2 text-left font-semibold">Size</th>
                              <th className="py-2 px-2 text-left font-semibold">Height</th>
                              <th className="py-2 px-2 text-left font-semibold">Weight</th>
                              <th className="py-2 px-2 text-left font-semibold">Chest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WETSUIT_SIZE_GUIDE.map(row => (
                      <tr key={row.size} className="border-t border-gray-100">
                                <td className="py-1 px-2 font-medium">{row.size}</td>
                                <td className="py-1 px-2">{row.height}</td>
                                <td className="py-1 px-2">{row.weight}</td>
                                <td className="py-1 px-2">{row.chest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

                  {/* Private Lesson Option */}
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="privateLesson"
                      checked={isPrivateLesson}
                      onChange={(e) => setIsPrivateLesson(e.target.checked)}
                      className="h-4 w-4 text-[#1DA9C7] focus:ring-[#1DA9C7] border-gray-300 rounded"
                    />
                    <label htmlFor="privateLesson" className="ml-3 text-gray-700 font-medium">
                      Make this a private lesson
                    </label>
            </div>
          </div>
              </div>

              {/* Pricing Summary */}
              <div className="border-t-2 border-gray-200 pt-4">
                {isPrivateLesson && (
                  <div className="flex justify-between items-center py-2 text-gray-600">
                    <span>Private Lesson</span>
                    <span className="font-medium text-[#1DA9C7]">+$50</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3">
                  <span className="text-lg font-semibold text-gray-800">Total Price</span>
                  <span className="text-2xl font-bold text-[#1DA9C7]">${totalPrice}</span>
              </div>
              </div>
            </div>


        </div>

          {/* Right Column - Action Buttons */}
          <div className="space-y-6">
            {/* Multi-Lesson Discount Banner */}
        <div className="bg-[#1DA9C7]/10 border-2 border-[#1DA9C7] rounded-xl p-6">
              <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#1DA9C7]">Multi-Lesson Discount</h3>
              <p className="text-gray-600">{getDiscountMessage()}</p>
            </div>
            <button
              onClick={handleAddAndBookAnother}
                  className="bg-[#1DA9C7] text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:bg-[#1897B2] font-medium"
            >
              Add & Book Another
            </button>
          </div>
        </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col gap-4">
          <button
            onClick={handleAddToCart}
                className="w-full px-6 py-3 rounded-lg font-medium shadow-md border-2 transition-all bg-white text-[#1DA9C7] border-[#1DA9C7] hover:bg-gray-50"
          >
            Add to Cart
          </button>
          <button
            onClick={handleCheckout}
                className="w-full px-6 py-3 rounded-lg font-medium shadow-lg transition-all bg-[#1DA9C7] text-white hover:bg-[#1897B2] hover:shadow-xl hover:scale-[1.02]"
          >
            Continue to Checkout →
          </button>
        </div>
      </div>
        </div>


      </div>

      {/* Waiver Modal */}
      {showWaiverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Complete Waiver to Continue</h2>
              <button
                onClick={() => {
                  setShowWaiverModal(false);
                  setPendingAction(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <WaiverAgreement onAccept={handleWaiverAccept} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails; 