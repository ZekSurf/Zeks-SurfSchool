import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/router';
import SanOnofreImg from '@/assets/images/san-onofre.jpg';
import DohenyImg from '@/assets/images/doheny.jpg';
import TStreetImg from '@/assets/images/t-street.jpg';
import { BeachDetailsModal } from './BeachDetailsModal';
import { useCart } from '@/context/CartContext';
import { bookingService } from '@/lib/bookingService';
import { BookingSlot } from '@/types/booking';

interface PricingPlan {
  name: string;
  price: string;
  discount?: string;
  features: string[];
}

interface Beach {
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  fullDescription: string;
  mapUrl: string;
}

// Legacy interface for backward compatibility (keeping existing dummy data structure)
interface TimeSlot {
  time: string;
  weather: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rainy';
  price: number;
  maxStudents: number;
  availableSpaces: number;
  status: 'Good' | 'Decent' | 'Poor';
}

const styles = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes wave {
    0% { transform: translateX(-100%); }
    50%, 100% { transform: translateX(100%); }
  }

  @keyframes wave-fast {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(-2px); }
    50% { transform: translateY(2px); }
  }

  .animate-shimmer {
    animation: shimmer 3s infinite;
  }

  .animate-wave {
    animation: wave 2s infinite;
  }

  .animate-wave-fast {
    animation: wave-fast 1.5s infinite;
  }

  .animate-bounce-subtle {
    animation: bounce-subtle 2s infinite;
  }
`;

const additionalStyles = `
  @keyframes loading-bar {
    0% { transform: translateX(-100%); }
    50%, 100% { transform: translateX(100%); }
  }

  .animate-loading-bar {
    animation: loading-bar 2s infinite;
  }

  .fade-in-section {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    will-change: opacity, transform;
  }

  .fade-in-section.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .fade-in-delay-1 {
    transition-delay: 0.2s;
  }

  .fade-in-delay-2 {
    transition-delay: 0.4s;
  }

  .fade-in-delay-3 {
    transition-delay: 0.6s;
  }
`;

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
}

export const BookingSection = () => {
  const router = useRouter();
  const { itemCount } = useCart();
  const [selectedBeach, setSelectedBeach] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isBeachDropdownOpen, setIsBeachDropdownOpen] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBeachDetails, setSelectedBeachDetails] = useState<Beach | null>(null);
  const [packagesVisible, setPackagesVisible] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const packagesRef = useRef<HTMLDivElement>(null);

  const loadingMessages = [
    { message: "Checking surf conditions", emoji: "🌊" },
    { message: "Calculating perfect wave times", emoji: "🏄‍♂️" },
    { message: "Checking instructor availability", emoji: "👨‍🏫" },
    { message: "Getting latest prices", emoji: "💰" },
    { message: "Almost ready to hang loose", emoji: "🤙" }
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (isLoadingTimeSlots) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setCurrentMessageIndex(0);
    }
  }, [isLoadingTimeSlots]);

  useEffect(() => {
    // Create and inject styles
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles + `
      @keyframes loading-bar {
        0% { transform: translateX(-100%); }
        50%, 100% { transform: translateX(100%); }
      }

      @keyframes slow-bounce {
        0%, 100% { 
          transform: translateY(0);
          animation-timing-function: cubic-bezier(0.8,0,1,1);
        }
        50% { 
          transform: translateY(-25%);
          animation-timing-function: cubic-bezier(0,0,0.2,1);
        }
      }

      .animate-loading-bar {
        animation: loading-bar 5s infinite;
      }

      .animate-slow-bounce {
        animation: slow-bounce 2s infinite;
      }
    `;
    document.head.appendChild(styleSheet);

    // Cleanup function to remove styles when component unmounts
    return () => {
      styleSheet.remove();
    };
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPackagesVisible(true);
          observer.disconnect(); // Only trigger once
        }
      },
      {
        threshold: 0.1 // Trigger when 10% of the element is visible
      }
    );

    if (packagesRef.current) {
      observer.observe(packagesRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Clear selected date if it becomes invalid (past date)
  useEffect(() => {
    if (selectedDate) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (selectedDate < todayStart) {
        setSelectedDate(null);
        setAvailableSlots([]);
        setError(null);
      }
    }
  }, [selectedDate, currentMonth]);

  const pricingPlans: PricingPlan[] = [
    {
      name: 'Single Dip',
      price: 'Starting at $90',
      features: [
        'One session to try it out',
        'Learn the Basics',
        'Catch your first wave!'
      ]
    },
    {
      name: 'Double Drop',
      price: 'Starting at $165',
      discount: '15% OFF!',
      features: [
        'Two sessions to build confidence',
        'Improve technique & board control',
        'Ride waves consistently'
      ]
    },
    {
      name: 'Triple Wave',
      price: 'Starting at $245',
      discount: '25% OFF!',
      features: [
        'Three sessions for serious progress',
        'Personalized Coaching',
        'Master pop-ups, paddling & wave reading'
      ]
    }
  ];

  const beaches: Beach[] = [
    {
      name: 'Doheny',
      description: "Known for its gentle waves and protected cove, perfect for learning to surf",
      imageUrl: '/beaches/doheny.png',
      location: "25300 Dana Point Harbor Dr, Dana Point, CA 92629",
      fullDescription: "Doheny State Beach is one of California's most popular state beaches and a perfect spot for beginners. The beach features a gentle break that's ideal for learning, thanks to its protected cove location.\n\nThe waves here are consistently mellow, making it an excellent place for first-timers and those working on their fundamentals. The beach also offers plenty of amenities including parking, restrooms, and picnic areas.\n\nBest conditions are typically in the morning before the wind picks up. The south-facing beach captures summer swells nicely, creating long, rolling waves perfect for learning.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.9307426295144!2d-117.67340792427287!3d33.45935397337676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcf1c6578ddc53%3A0x44fe7c89844391a0!2sDoheny%20State%20Beach!5e0!3m2!1sen!2sus!4v1708472138033!5m2!1sen!2sus"
    },
    {
      name: 'San Onofre',
      description: "Known for it's consistent waves and vibrant surf culture",
      imageUrl: '/sanonofre.png',
      location: "San Onofre State Beach, San Clemente, CA 92672",
      fullDescription: "San Onofre State Beach is a historic surfing spot with a rich culture dating back to the early days of California surfing. The beach is divided into several distinct surf breaks, each with its own character.\n\nThe waves here are typically long, smooth, and perfect for both beginners and experienced surfers. The beach's laid-back atmosphere and friendly local community make it a welcoming spot for everyone.\n\nThe area is known for its consistent waves year-round, with the best conditions usually occurring during summer months. The beach also offers beautiful views and is a great spot for watching the sunset after a day of surfing.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3331.898069865164!2d-117.57204492427484!3d33.37075167337839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dc604f3e1c3c15%3A0x84cf31e03773a25e!2sSan%20Onofre%20State%20Beach!5e0!3m2!1sen!2sus!4v1708472217727!5m2!1sen!2sus"
    },
    {
      name: 'T-Street',
      description: "Popular local spot with varied waves and a scenic reef break setting",
      imageUrl: '/beaches/tstreet.png',
      location: "301 W Paseo De Cristobal, San Clemente, CA 92672",
      fullDescription: "T-Street Beach is a favorite among local surfers in San Clemente, offering a variety of wave types that cater to different skill levels. The beach gets its name from the T-shaped intersection of Paseo de Cristobal and the beach trail.\n\nThe reef break here creates excellent surfing conditions, with waves that can range from gentle to challenging depending on the swell. The spot is known for its consistency and quality waves throughout the year.\n\nThe beach features beautiful bluffs and a scenic walking trail. Morning sessions are typically best, offering clean conditions before the afternoon winds pick up. The area is well-maintained and includes amenities such as restrooms and outdoor showers.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3331.4760906862386!2d-117.63312892427438!3d33.38338267337804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcf48c4164e215%3A0x832a7adb0baa9ba2!2sT-Street%20Beach!5e0!3m2!1sen!2sus!4v1708472261008!5m2!1sen!2sus"
    }
  ];

  // Dummy data removed - now using real API data

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const isDateEqual = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const handleDateSelect = async (date: Date) => {
    if (!selectedBeach) {
      setError('Please select a beach first');
      return;
    }

    // Prevent selection of past dates
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < todayStart) {
      setError('Cannot select dates in the past. Please choose today or a future date.');
      return;
    }

    // SECURITY: Removed debug logging - may contain sensitive booking data

    setIsLoadingTimeSlots(true);
    setSelectedDate(date);
    setError(null);
    setAvailableSlots([]);

    try {
      // SECURITY: Removed API call debug logging
      const response = await bookingService.fetchAvailableSlots(selectedBeach, date);
      
      // Validate the response structure
      if (response && response.slots && Array.isArray(response.slots)) {
        setAvailableSlots(response.slots);
      } else {
        console.error('Invalid response structure:', response);
        setError('Invalid response from booking service');
        setAvailableSlots([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available slots');
      setAvailableSlots([]);
      console.error('Error fetching slots:', err);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="aspect-square border border-gray-100 rounded-lg"
        />
      );
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const today = new Date();
      const isToday = day === today.getDate() && 
                      currentMonth.getMonth() === today.getMonth() &&
                      currentMonth.getFullYear() === today.getFullYear();
      const isSelected = isDateEqual(date, selectedDate);
      
      // Check if date is in the past (before today)
      const isPastDate = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      days.push(
        <div
          key={day}
          onClick={isPastDate ? undefined : () => handleDateSelect(date)}
          title={isPastDate ? 'Cannot book lessons for past dates' : isToday ? 'Today' : `Available for booking`}
          className={`
            aspect-square border flex items-center justify-center
            transition-all duration-200 rounded-lg
            ${isPastDate 
              ? 'cursor-not-allowed bg-gray-50 border-gray-100 opacity-50' 
              : isSelected 
                ? 'bg-[#1DA9C7] text-white border-[#1DA9C7] shadow-md cursor-pointer' 
                : isToday 
                  ? 'bg-[#E8F7F7] border-[#1DA9C7] cursor-pointer hover:border-[#1DA9C7] hover:shadow-md' 
                  : 'border-gray-200 hover:bg-[#E8F7F7] cursor-pointer hover:border-[#1DA9C7] hover:shadow-md'
            }
          `}
        >
          <span className={`
            text-sm font-medium
            ${isPastDate 
              ? 'text-gray-400' 
              : isSelected 
                ? 'text-white' 
                : isToday 
                  ? 'text-[#1DA9C7]' 
                  : 'text-gray-700'
            }
          `}>
            {day}
          </span>
        </div>
      );
    }

    return days;
  };

  const getWeatherEmoji = (weather: string) => {
    // Handle null/undefined/empty values
    if (!weather || weather === 'null' || weather === 'undefined') {
      return '☀️';
    }
    
    switch (weather) {
      case 'Sunny':
        return '☀️';
      case 'Partly Cloudy':
      case 'Partly Cloudly': // Handle typo in API response
        return '⛅';
      case 'Cloudy':
      case 'Cloudly': // Handle typo in API response
        return '☁️';
      case 'Rainy':
        return '🌧️';
      default:
        return '☀️';
    }
  };

  const formatTimeSlot = (startTime: string, endTime: string): string => {
    try {
      if (!startTime || !endTime) {
        return 'Time unavailable';
      }
      
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'Invalid time';
      }
      
      // Subtract 30 minutes from the end time to make 1.5 hour slots display as 1 hour
      const adjustedEnd = new Date(end.getTime() - (30 * 60 * 1000));
      
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };

      return `${formatTime(start)} - ${formatTime(adjustedEnd)}`;
    } catch (error) {
      console.error('Error formatting time slot:', error);
      return 'Time unavailable';
    }
  };

  const getStatusFromLabel = (label: string): 'Good' | 'Decent' | 'Poor' => {
    switch (label.toLowerCase()) {
      case 'great':
      case 'good':
        return 'Good';
      case 'decent':
        return 'Decent';
      default:
        return 'Poor';
    }
  };

  const LoadingAnimation = () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <span className="text-4xl animate-slow-bounce">{loadingMessages[currentMessageIndex].emoji}</span>
        </div>
        <p className="text-gray-800 font-medium mb-4 min-h-[24px]">
          {loadingMessages[currentMessageIndex].message}
        </p>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1DA9C7] to-[#40B8D3] w-full animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );

  const handleViewDetails = (beach: Beach) => {
    setSelectedBeachDetails(beach);
    setIsModalOpen(true);
  };

  const FadeInSection = ({ children, delay = 0 }: FadeInSectionProps) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => setVisible(entry.isIntersecting));
      }, { threshold: 0.1 });
      
      const currentRef = domRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, []);

    return (
      <div
        ref={domRef}
        className={`fade-in-section fade-in-delay-${delay} ${isVisible ? 'is-visible' : ''}`}
      >
        {children}
      </div>
    );
  };

  return (
    <section id="booking" className="py-16 px-4 min-[1024px]:px-16 min-[1280px]:px-24 mx-auto bg-[#F3F4F6] font-poppins">
      <div className="max-w-[1920px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 font-poppins">
          Book Your Surf Lesson with <span className="text-[#1DA9C7]">Zek</span>!
        </h1>
        <p className="text-center text-gray-600 mb-12 font-poppins">Choose the Plan that Works For You</p>

        {/* Pricing Plans */}
        <div 
          ref={packagesRef}
          className="grid grid-cols-1 min-[1135px]:grid-cols-3 gap-8 mb-16"
        >
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`
                bg-white rounded-xl shadow-lg p-6 relative hover:shadow-xl transition-all duration-700
                transform ${packagesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                ${itemCount === 1 && index === 1 ? 'ring-2 ring-[#1DA9C7]' : ''}
                ${itemCount >= 2 && index === 2 ? 'ring-2 ring-[#1DA9C7]' : ''}
              `}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {plan.discount && (
                <div className="absolute top-4 right-4 bg-[#40B8D3] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {plan.discount}
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4 font-poppins">{plan.name}</h3>
              <p className="text-2xl mb-6 font-poppins">
                <span className="font-normal">Starting at </span>
                <span className="font-bold">{plan.price.replace('Starting at ', '')}</span>
              </p>
              <ul className="space-y-4 mb-8 font-poppins">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-[#40B8D3] mr-2">■</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Beach Selection */}
        <div className="mb-12 relative">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 font-poppins">
              First, select your <span className="text-[#1DA9C7]">beach</span>
            </h2>
            <p className="text-gray-600 font-poppins">Choose from our three beautiful surf locations</p>
          </div>
          <button
            onClick={() => setIsBeachDropdownOpen(!isBeachDropdownOpen)}
            className="w-full p-4 border rounded-lg mb-2 font-poppins bg-white flex justify-between items-center hover:border-[#1DA9C7] transition-colors"
          >
            <span className="text-gray-700">{selectedBeach || 'Select Beach'}</span>
            <svg
              className={`w-5 h-5 transition-transform ${isBeachDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Beach Cards */}
          <div 
            className={`space-y-2 transition-all duration-300 overflow-hidden ${
              isBeachDropdownOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-2 p-1">
              {beaches.map((beach) => (
                <FadeInSection key={beach.name} delay={beaches.indexOf(beach) + 1}>
                  <div 
                    className={`bg-white rounded-xl shadow-lg p-4 flex items-center hover:shadow-xl transition-all cursor-pointer ${
                      selectedBeach === beach.name ? 'ring-2 ring-[#1DA9C7]' : ''
                    }`}
                    onClick={() => {
                      setSelectedBeach(beach.name);
                      setIsBeachDropdownOpen(false);
                      // Clear existing slots and selection when beach changes
                      setAvailableSlots([]);
                      setSelectedDate(null);
                      setError(null);
                    }}
                  >
                    <div className="relative w-24 h-24 min-w-[6rem] mr-4">
                      <Image
                        src={beach.imageUrl}
                        alt={beach.name}
                        fill
                        sizes="(max-width: 96px) 100vw, 96px"
                        className="rounded-lg object-cover"
                        priority
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold font-poppins">{beach.name}</h3>
                      <p className="text-gray-600 mb-2 font-poppins">{beach.description}</p>
                      <button 
                        className={`text-[#1DA9C7] hover:underline font-poppins font-medium ${
                          selectedBeach === beach.name ? 'underline' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(beach);
                        }}
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>

          {/* Selected Beach Card */}
          {selectedBeach && !isBeachDropdownOpen && (
            <div className="mt-2">
              {beaches
                .filter((beach) => beach.name === selectedBeach)
                .map((beach) => (
                  <FadeInSection key={`selected-${beach.name}`} delay={beaches.indexOf(beach) + 1}>
                    <div 
                      className="bg-white rounded-xl shadow-lg p-4 flex items-center"
                    >
                      <div className="relative w-24 h-24 min-w-[6rem] mr-4">
                        <Image
                          src={beach.imageUrl}
                          alt={beach.name}
                          fill
                          sizes="(max-width: 96px) 100vw, 96px"
                          className="rounded-lg object-cover"
                          priority
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold font-poppins">{beach.name}</h3>
                        <p className="text-gray-600 mb-2 font-poppins">{beach.description}</p>
                        <button 
                          className="text-[#1DA9C7] hover:underline font-poppins font-medium underline"
                          onClick={() => handleViewDetails(beach)}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </FadeInSection>
                ))}
            </div>
          )}
        </div>

        {/* Calendar Section */}
        {selectedBeach && (
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 font-poppins">
              Then, select a <span className="text-[#1DA9C7]">date and time</span>
            </h2>
            <p className="text-gray-600 font-poppins">Pick your perfect surf session</p>
          </div>
        )}
        <div className="grid min-[1135px]:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-poppins">
                  {formatMonth(currentMonth)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(currentMonth.getMonth() - 1);
                    setCurrentMonth(newDate);
                  }}
                  disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                  title={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear() 
                    ? 'Cannot view past months' 
                    : 'Previous month'}
                  className={`p-2 rounded-lg transition-colors ${
                    currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : 'hover:bg-[#E8F7F7] text-gray-700'
                  }`}
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(currentMonth.getMonth() + 1);
                    setCurrentMonth(newDate);
                  }}
                  title="Next month"
                  className="p-2 rounded-lg hover:bg-[#E8F7F7] transition-colors text-gray-700"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-gray-600 p-2">
                  <span className="hidden max-[427px]:inline">{day[0]}</span>
                  <span className="inline max-[427px]:hidden">{day}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendar()}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedBeach || 'Select a'} Beach
                </h3>
                <div className="text-gray-600 text-base font-normal">
                  {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                </div>
              </div>
            </div>

            {selectedDate && selectedBeach ? (
              <div>
                {isLoadingTimeSlots ? (
                <LoadingAnimation />
              ) : error ? (
                <div className="text-center text-red-500 py-8">
                  <p className="mb-4">{error}</p>
                  <button
                    onClick={() => handleDateSelect(selectedDate)}
                    className="bg-[#1DA9C7] text-white px-4 py-2 rounded hover:bg-[#1897B2] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : availableSlots && availableSlots.length > 0 ? (() => {
                const availableSlotsFiltered = availableSlots.filter(slot => {
                  const spacesAvailable = parseInt(slot?.openSpaces || '0');
                  return slot?.available && spacesAvailable > 0;
                });
                
                return availableSlotsFiltered.length > 0 ? (
                <div className="space-y-4">
                  {availableSlotsFiltered.map((slot, index) => {
                    const status = getStatusFromLabel(slot?.label || 'Unknown');
                    const timeDisplay = formatTimeSlot(slot?.startTime || '', slot?.endTime || '');
                    const spacesAvailable = parseInt(slot?.openSpaces || '0');
                    
                    return (
                      <FadeInSection key={slot.slotId} delay={index + 1}>
                        <div className="bg-white border rounded-lg p-4 hover:border-[#1DA9C7] transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{timeDisplay}</span>
                              <span className={`px-2 py-1 rounded text-sm ${
                                status === 'Good' ? 'bg-green-100 text-green-800' :
                                status === 'Decent' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {slot?.label || 'Unknown'}
                              </span>
                            </div>
                            <span className="font-medium">${slot?.price || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>{getWeatherEmoji(slot?.sky || 'Unknown')}</span>
                              <span>{slot?.sky === 'null' || !slot?.sky ? 'Unknown' : slot.sky}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`flex items-center gap-1 text-gray-500`}>
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  fill="currentColor" 
                                  className="w-4 h-4"
                                >
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                                {spacesAvailable} {spacesAvailable === 1 ? 'spot' : 'spots'} available
                              </span>
                              <button
                                className="bg-[#1DA9C7] text-white px-4 py-1 rounded hover:bg-[#1897B2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!slot?.available || spacesAvailable === 0}
                                onClick={() => {
                                  router.push(`/booking-details?id=${slot?.slotId}`);
                                }}
                              >
                                {!slot?.available || spacesAvailable === 0 ? 
                                  (spacesAvailable === 0 ? 'Full' : 'Unavailable') : 
                                  'Book'
                                }
                              </button>
                            </div>
                          </div>
                        </div>
                      </FadeInSection>
                    );
                  })}
                </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    All time slots are fully booked for the selected date. Please try another date.
                  </div>
                );
              })() : (
                <div className="text-center text-gray-500 py-8">
                  No available time slots for the selected date. Please try another date.
                </div>
              )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Please select both a beach and a date to view available time slots
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Beach Details Modal */}
      {selectedBeachDetails && (
        <BeachDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          beach={selectedBeachDetails}
        />
      )}
    </section>
  );
}; 