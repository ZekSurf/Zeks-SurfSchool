import { useState, useEffect } from 'react';
import Head from 'next/head';
import { CompletedBooking } from '@/types/booking';
import { supabaseStaffService } from '@/lib/supabaseStaffService';
import WeeklyCalendar from '@/components/Staff/WeeklyCalendar';
import BookingDetailsModal from '@/components/Staff/BookingDetailsModal';
import { pushNotificationService } from '@/lib/pushNotificationService';

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
  const [notificationStatus, setNotificationStatus] = useState<'checking' | 'enabled' | 'disabled' | 'unsupported'>('checking');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    checkPersistentLogin();
  }, []);

  const checkPersistentLogin = async () => {
    // First check session storage for current session
    const authStatus = sessionStorage.getItem('staff_portal_auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      return;
    }

    // Check if user is locked out
    const lockoutTime = localStorage.getItem('staff_portal_lockout');
    if (lockoutTime && Date.now() - parseInt(lockoutTime) < 15 * 60 * 1000) { // 15 min lockout
      setIsLocked(true);
      return;
    }

    // Check for persistent login via service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          const { hasValidSession, sessionData } = event.data;
          
          if (hasValidSession && sessionData) {
            console.log('🔐 Valid persistent session found, auto-login enabled');
            // Automatically authenticate without requiring PIN entry
            setIsAuthenticated(true);
            sessionStorage.setItem('staff_portal_auth', 'authenticated');
            
            // Update last used time for this session
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'PERSIST_LOGIN',
                pin: sessionData.pin,
                updateOnly: true
              });
            }
          } else {
            console.log('🔐 No valid persistent session found');
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CHECK_SESSION' },
          [messageChannel.port2]
        );
      } catch (error) {
        console.error('Error checking persistent login:', error);
      }
    }
  };

  // Auto-sync when authenticated and setup push notifications
  useEffect(() => {
    if (isAuthenticated) {
      // Auto-sync bookings on login (silent sync)
      handleSyncBookings();
      
      // Check push notification status
      checkNotificationStatus();
      
      // Listen for new booking notifications from service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        return () => {
          navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        };
      }
    }
  }, [isAuthenticated]);

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'NEW_BOOKING_NOTIFICATION') {
      console.log('📱 New booking notification received in staff portal:', event.data.booking);
      
      // Auto-refresh the calendar to show new booking
      setRefreshKey(prev => prev + 1);
      
      // Show a toast notification or update UI
      setSyncMessage(`✨ New booking: ${event.data.booking.customerName} at ${event.data.booking.beach}`);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const checkNotificationStatus = async () => {
    if (!pushNotificationService.isNotificationSupported()) {
      setNotificationStatus('unsupported');
      return;
    }

    const permission = pushNotificationService.getPermissionStatus();
    const subscribed = await pushNotificationService.isSubscribed();
    
    setIsSubscribed(subscribed);
    
    if (permission === 'granted' && subscribed) {
      setNotificationStatus('enabled');
    } else if (permission === 'denied') {
      setNotificationStatus('disabled');
    } else {
      setNotificationStatus('disabled');
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const subscription = await pushNotificationService.subscribe();
      if (subscription) {
        setNotificationStatus('enabled');
        setIsSubscribed(true);
        alert('✅ Push notifications enabled! You\'ll receive alerts for new bookings.');
      } else {
        alert('❌ Failed to enable notifications. Please check your browser settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('❌ Failed to enable notifications. Please try again.');
    }
  };

  const handleDisableNotifications = async () => {
    try {
      const success = await pushNotificationService.unsubscribe();
      if (success) {
        setNotificationStatus('disabled');
        setIsSubscribed(false);
        alert('✅ Push notifications disabled.');
      } else {
        alert('❌ Failed to disable notifications.');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      alert('❌ Failed to disable notifications. Please try again.');
    }
  };

  const handleTestNotification = () => {
    pushNotificationService.testNotification();
  };

  const handleTestBookingNotification = async () => {
    try {
      const response = await fetch('/api/debug/test-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Test booking notification sent! Check console logs for details.');
      } else {
        alert(`❌ Test failed: ${result.error}\nCheck console logs for more details.`);
      }
    } catch (error) {
      console.error('Test booking notification error:', error);
      alert('❌ Test failed: Network error. Check console logs.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      alert('Too many failed attempts. Please wait 15 minutes before trying again.');
      return;
    }

    try {
      const isValidPin = await supabaseStaffService.verifyStaffPin(pin);
      
      if (isValidPin) {
        setIsAuthenticated(true);
        sessionStorage.setItem('staff_portal_auth', 'authenticated');
        setLoginAttempts(0);
        localStorage.removeItem('staff_portal_lockout');
        
        // Enable persistent login for 24 hours via service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PERSIST_LOGIN',
            pin: pin
          });
        }
        
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
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('staff_portal_auth');
    setPin('');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
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
    // Refresh the calendar to show updated status
    setRefreshKey(prev => prev + 1);
  };

  const handleSyncBookings = async () => {
    setIsSyncing(true);
    setSyncMessage('');

    try {
      const result = await supabaseStaffService.getAllBookings();
      if (result.success) {
        setRefreshKey(prev => prev + 1);
        setSyncMessage(`✅ Synced successfully! Found ${result.bookings.length} total bookings.`);
      } else {
        setSyncMessage(`❌ Sync failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage('❌ Sync failed: Network error');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const getWeekRange = () => {
    const startOfWeek = new Date(selectedWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Adjust to start on Sunday
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { start: startOfWeek, end: endOfWeek };
  };

  const weekRange = getWeekRange();

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Staff Portal - Zek's Surf School</title>
          <meta name="robots" content="noindex, nofollow" />
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
          
          {/* PWA Icons for iOS */}
          <meta name="application-name" content="Surf Staff" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Surf Staff" />
          <meta name="theme-color" content="#2563eb" />
          
          {/* iOS App Icons */}
          <link rel="apple-touch-icon" href="/staff-icon-180.svg" />
          <link rel="apple-touch-icon" sizes="180x180" href="/staff-icon-180.svg" />
          <link rel="apple-touch-icon" sizes="152x152" href="/staff-icon-180.svg" />
          <link rel="apple-touch-icon" sizes="120x120" href="/staff-icon-180.svg" />
          <link rel="apple-touch-icon" sizes="76x76" href="/staff-icon-180.svg" />
          
          {/* Manifest for PWA */}
          <link rel="manifest" href="/manifest.json" />
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
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
          
          {/* PWA Icons for iOS */}
          <meta name="application-name" content="Surf Staff" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Surf Staff" />
          <meta name="theme-color" content="#2563eb" />
          
          {/* iOS App Icons */}
          <link rel="apple-touch-icon" href="/staff-icon-180.svg" />
          <link rel="apple-touch-icon" sizes="180x180" href="/staff-icon-180.svg" />
          <link rel="apple-touch-icon" sizes="152x152" href="/staff-icon-180.svg" />
          <link rel="apple-touch-icon" sizes="120x120" href="/staff-icon-180.svg" />
          <link rel="apple-touch-icon" sizes="76x76" href="/staff-icon-180.svg" />
          
          {/* Manifest for PWA */}
          <link rel="manifest" href="/manifest.json" />
        </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 md:py-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Staff Portal</h1>
                <p className="text-sm md:text-base text-gray-600 hidden sm:block">Weekly Booking Schedule</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Week Navigation */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="bg-white border border-gray-300 rounded-lg px-3 md:px-4 py-2 hover:bg-gray-50 transition-colors text-sm md:text-base flex-1 sm:flex-none"
                >
                  ← Prev
                </button>
                <button
                  onClick={goToCurrentWeek}
                  className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base flex-1 sm:flex-none"
                >
                  Current
                </button>
                <button
                  onClick={() => navigateWeek('next')}
                  className="bg-white border border-gray-300 rounded-lg px-3 md:px-4 py-2 hover:bg-gray-50 transition-colors text-sm md:text-base flex-1 sm:flex-none"
                >
                  Next →
                </button>
              </div>
              <button
                onClick={handleSyncBookings}
                disabled={isSyncing}
                className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
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

            <div className="text-base md:text-lg font-semibold text-gray-800 text-center md:text-left">
              <span className="hidden md:inline">
                {weekRange.start.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric'
                })} - {weekRange.end.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="md:hidden">
                {weekRange.start.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                })} - {weekRange.end.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: '2-digit'
                })}
              </span>
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

          {/* Push Notification Controls */}
          <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm md:text-base">Push Notifications</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {notificationStatus === 'checking' && 'Checking status...'}
                      {notificationStatus === 'enabled' && '✅ Enabled - You\'ll receive alerts for new bookings'}
                      {notificationStatus === 'disabled' && '❌ Disabled - Enable to get booking alerts'}
                      {notificationStatus === 'unsupported' && '❌ Not supported on this device/browser'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {notificationStatus !== 'unsupported' && (
                  <>
                    {notificationStatus === 'disabled' ? (
                      <button
                        onClick={handleEnableNotifications}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs md:text-sm hover:bg-green-700 transition-colors"
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        onClick={handleDisableNotifications}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs md:text-sm hover:bg-red-700 transition-colors"
                      >
                        Disable
                      </button>
                    )}
                    
                    <button
                      onClick={handleTestNotification}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs md:text-sm hover:bg-blue-700 transition-colors"
                    >
                      Test
                    </button>
                    
                    <button
                      onClick={handleTestBookingNotification}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-xs md:text-sm hover:bg-purple-700 transition-colors"
                    >
                      Test Booking
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Calendar */}
          <WeeklyCalendar
            key={refreshKey}
            selectedWeek={selectedWeek}
            onBookingClick={handleBookingClick}
          />
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedBooking(null);
            }}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </>
  );
} 