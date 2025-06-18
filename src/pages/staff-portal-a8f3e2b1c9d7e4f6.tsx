import { useState, useEffect } from 'react';
import Head from 'next/head';
import { CompletedBooking } from '@/types/booking';
import { supabaseStaffService } from '@/lib/supabaseStaffService';
import WeeklyCalendar from '@/components/Staff/WeeklyCalendar';
import BookingDetailsModal from '@/components/Staff/BookingDetailsModal';

export default function StaffPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    // Check if already authenticated in session
    const authStatus = sessionStorage.getItem('staff_portal_auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }

    // Check if user is locked out
    const lockoutTime = localStorage.getItem('staff_portal_lockout');
    if (lockoutTime && Date.now() - parseInt(lockoutTime) < 15 * 60 * 1000) { // 15 min lockout
      setIsLocked(true);
    }
  }, []);

  // Auto-sync when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Auto-sync bookings on login (silent sync)
      handleSyncBookings();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      alert('Too many failed attempts. Please wait 15 minutes before trying again.');
      return;
    }

    const isValidPin = supabaseStaffService.verifyStaffPin(pin);
    
    if (isValidPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('staff_portal_auth', 'authenticated');
      setLoginAttempts(0);
      localStorage.removeItem('staff_portal_lockout');
      setPin('');
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        localStorage.setItem('staff_portal_lockout', Date.now().toString());
        alert('Too many failed attempts. Access locked for 15 minutes.');
      } else {
        alert(`Invalid PIN. ${3 - newAttempts} attempts remaining.`);
      }
      setPin('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('staff_portal_auth');
    setPin('');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(selectedWeek);
    const daysToAdd = direction === 'next' ? 7 : -7;
    newWeek.setDate(selectedWeek.getDate() + daysToAdd);
    setSelectedWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  const handleBookingClick = (booking: CompletedBooking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (bookingId: string, status: CompletedBooking['status']) => {
    // Force refresh the calendar
    setRefreshKey(prev => prev + 1);
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSyncBookings = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    
    try {
      const result = await supabaseStaffService.getAllBookings();
      
      if (result.success) {
        setSyncMessage(`✅ Loaded ${result.bookings.length} bookings from database`);
        // Force refresh the calendar to show bookings
        setRefreshKey(prev => prev + 1);
      } else {
        setSyncMessage(`❌ Sync failed: ${result.error}`);
      }
    } catch (error) {
      setSyncMessage('❌ Sync failed: Network error');
    } finally {
      setIsSyncing(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const getWeekRange = () => {
    const startOfWeek = new Date(selectedWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      start: startOfWeek,
      end: endOfWeek
    };
  };

  const weekRange = getWeekRange();

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Staff Portal - Zek's Surf School</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Portal</h1>
              <p className="text-gray-600">Enter your PIN to access the booking system</p>
            </div>

            {isLocked && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      Access locked due to too many failed attempts. Please wait 15 minutes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                  Staff PIN
                </label>
                <input
                  type="password"
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  disabled={isLocked}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLocked || !pin.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                Access Portal
              </button>
            </form>

            {loginAttempts > 0 && !isLocked && (
              <div className="mt-4 text-center text-sm text-red-600">
                {3 - loginAttempts} attempts remaining
              </div>
            )}

            <div className="mt-8 text-center text-xs text-gray-500">
              If you don't have a PIN, contact the administrator
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Staff Portal - Weekly Schedule - Zek's Surf School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Staff Portal</h1>
                <p className="text-gray-600">Weekly Booking Schedule</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                ← Previous Week
              </button>
              <button
                onClick={goToCurrentWeek}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Current Week
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Next Week →
              </button>
              <button
                onClick={handleSyncBookings}
                disabled={isSyncing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    🔄 Sync New Bookings
                  </>
                )}
              </button>
            </div>

            <div className="text-lg font-semibold text-gray-800">
              {weekRange.start.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })} - {weekRange.end.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              syncMessage.includes('failed') || syncMessage.includes('error')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {syncMessage}
            </div>
          )}

          {/* Calendar */}
          <WeeklyCalendar
            key={`${selectedWeek.toISOString()}-${refreshKey}`}
            selectedWeek={selectedWeek}
            onBookingClick={handleBookingClick}
          />

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">How to use the Staff Portal</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Click on any booking to view detailed information</li>
              <li>• Use the status update buttons to mark lessons as completed or cancelled</li>
              <li>• Navigate between weeks using the Previous/Next Week buttons</li>
              <li>• Click "Current Week" to quickly return to this week's schedule</li>
              <li>• Contact information is clickable for quick communication</li>
            </ul>
          </div>
        </div>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </>
  );
} 