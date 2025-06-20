import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { bookingService } from '@/lib/bookingService';
import { bookingCache } from '@/lib/bookingCache';
import { chatService } from '@/lib/chatService';
import { reviewService } from '@/lib/reviewService';
import { supabaseStaffService } from '@/lib/supabaseStaffService';
import { ReviewSubmission, ReviewStats } from '@/types/review';
import { StaffPinConfig, CompletedBooking } from '@/types/booking';
import { StaffPinRow } from '@/lib/supabase';
import { supabaseCacheService } from '../lib/supabaseCacheService';

// SECURITY: This should now come from server-side env variable in API calls
// We'll validate the password server-side to avoid exposing it client-side
const ADMIN_AUTH_ENDPOINT = '/api/admin/verify-auth';

interface DebugInfo {
  environment: string;
  timestamp: string;
  userAgent: string;
  url: string;
  localStorage: any;
  sessionStorage: any;
  cacheInfo: any;
  apiPayload: any;
  apiResponse: any;
  lastError: any;
  chatInfo: any;
  reviewInfo: any;
}

interface SystemInfo {
  userAgent: string;
  timestamp: string;
  url: string;
  environment: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  cookiesEnabled: boolean;
  localStorage: any;
  sessionStorage: any;
  cacheInfo: any;
  chatInfo: {
    webhookUrl: string;
    isConfigured: boolean;
  };
  apiPayload: {
    timestamp: string;
    payload: any;
    response: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      rawData: any;
      processedData: any;
    };
  };
  apiResponse: any;
  lastError: any;
}

export default function AdminDebugPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Review management state
  const [reviews, setReviews] = useState<ReviewSubmission[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewSubmission | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Staff management state
  const [staffPinConfig, setStaffPinConfig] = useState<StaffPinConfig | null>(null);
  const [allStaff, setAllStaff] = useState<StaffPinRow[]>([]);
  const [newStaffPin, setNewStaffPin] = useState('');
  const [showCreateStaffForm, setShowCreateStaffForm] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    pin: '',
    staffName: '',
    role: 'surf_instructor' as 'surf_instructor' | 'admin',
    phone: '',
    email: '',
    notes: ''
  });
  const [editingStaff, setEditingStaff] = useState<StaffPinRow | null>(null);
  const [bookingStats, setBookingStats] = useState({ total: 0, confirmed: 0, completed: 0, cancelled: 0 });

  // SECURITY: Password validation is now handled server-side via API

  useEffect(() => {
    // Check if already authenticated in session
    const authStatus = sessionStorage.getItem('admin_debug_auth');
    const storedKey = sessionStorage.getItem('admin_debug_key');
    if (authStatus === 'authenticated' && storedKey) {
      setIsAuthenticated(true);
      setAdminKey(storedKey);
      loadDebugInfo();
      loadReviews();
      loadStaffConfig();
    }

    // Check if user is locked out
    const lockoutTime = localStorage.getItem('admin_debug_lockout');
    if (lockoutTime && Date.now() - parseInt(lockoutTime) < 30 * 60 * 1000) { // 30 min lockout
      setIsLocked(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      alert('Too many failed attempts. Please wait 30 minutes before trying again.');
      return;
    }

    try {
      const response = await fetch('/api/admin/verify-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAdminKey(password); // Store the password for API calls
        sessionStorage.setItem('admin_debug_auth', 'authenticated');
        sessionStorage.setItem('admin_debug_key', password); // Store encrypted in real app
        setLoginAttempts(0);
        localStorage.removeItem('admin_debug_lockout');
        loadDebugInfo();
        loadReviews();
        loadStaffConfig();
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          localStorage.setItem('admin_debug_lockout', Date.now().toString());
          alert('Too many failed attempts. Access locked for 30 minutes.');
        } else {
          alert(`Invalid password. ${3 - newAttempts} attempts remaining.`);
        }
        setPassword('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_debug_auth');
    sessionStorage.removeItem('admin_debug_key');
    setPassword('');
    setAdminKey('');
    setDebugInfo(null);
  };

  const loadDebugInfo = () => {
    setIsLoading(true);
    
    try {
      const info: DebugInfo = {
        environment: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        localStorage: getLocalStorageData(),
        sessionStorage: getSessionStorageData(),
        cacheInfo: bookingService.getCacheInfo(),
        apiPayload: bookingCache.lastApiPayload,
        apiResponse: bookingCache.lastApiResponse,
        lastError: bookingCache.lastError,
        chatInfo: getChatInfo(),
        reviewInfo: getReviewInfo()
      };
      
      setDebugInfo(info);
      setLastAction('Debug info loaded successfully');
    } catch (error) {
      setLastAction(`Error loading debug info: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalStorageData = () => {
    if (typeof window === 'undefined') return {};
    
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  };

  const getSessionStorageData = () => {
    if (typeof window === 'undefined') return {};
    
    const data: any = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const value = sessionStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch {
          data[key] = sessionStorage.getItem(key);
        }
      }
    }
    return data;
  };

  const getChatInfo = () => {
    try {
      return {
        sessionId: chatService.getSessionId(),
        webhookUrl: process.env.NEXT_PUBLIC_CHAT_WEBHOOK_URL || 'Not configured',
        isConfigured: !!process.env.NEXT_PUBLIC_CHAT_WEBHOOK_URL,
        sessionStorageKey: 'surf-chat-session-id',
        hasSessionInStorage: typeof window !== 'undefined' ? 
          !!localStorage.getItem('surf-chat-session-id') : false
      };
    } catch (error) {
      return {
        error: 'Failed to get chat info',
        details: error?.toString() || 'Unknown error'
      };
    }
  };

  const getReviewInfo = () => {
    try {
      const stats = reviewService.getReviewStats();
      const allReviews = reviewService.getAllReviews();
      const pendingReviews = reviewService.getReviewsByStatus('pending');
      
      return {
        totalReviews: allReviews.length,
        pendingReviews: pendingReviews.length,
        approvedReviews: reviewService.getReviewsByStatus('approved').length,
        rejectedReviews: reviewService.getReviewsByStatus('rejected').length,
        averageRating: stats.averageOverallRating,
        recommendationPercentage: stats.recommendationPercentage,
        recentReviews: allReviews.slice(0, 5),
        stats: stats
      };
    } catch (error) {
      return {
        error: 'Failed to get review info',
        details: error?.toString() || 'Unknown error'
      };
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all localStorage and sessionStorage data?')) {
      localStorage.clear();
      sessionStorage.clear();
      bookingService.clearAllCache();
      setLastAction('All data cleared');
      loadDebugInfo();
    }
  };

  const handleTestAPI = async () => {
    setIsLoading(true);
    setLastAction('Testing API connection...');
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await bookingService.fetchAvailableSlots('Doheny', tomorrow, true);
      setLastAction('✅ API test successful');
      loadDebugInfo();
    } catch (error) {
      setLastAction(`❌ API test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportDebugData = () => {
    if (!debugInfo) return;
    
    const dataStr = JSON.stringify(debugInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
          link.download = `zeks-debug-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    setLastAction('Debug data exported');
  };

  // Review management functions
  const loadReviews = () => {
    try {
      const allReviews = reviewService.getAllReviews();
      const stats = reviewService.getReviewStats();
      setReviews(allReviews);
      setReviewStats(stats);
      setLastAction('Reviews loaded successfully');
    } catch (error) {
      setLastAction(`Error loading reviews: ${error}`);
    }
  };

  const handleReviewStatusUpdate = (reviewId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    try {
      const success = reviewService.updateReviewStatus(reviewId, status, adminNotes, 'Admin');
      if (success) {
        loadReviews();
        loadDebugInfo();
        setLastAction(`Review ${status} successfully`);
        setSelectedReview(null);
      } else {
        setLastAction('Failed to update review status');
      }
    } catch (error) {
      setLastAction(`Error updating review: ${error}`);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        const success = reviewService.deleteReview(reviewId);
        if (success) {
          loadReviews();
          loadDebugInfo();
          setLastAction('Review deleted successfully');
          setSelectedReview(null);
        } else {
          setLastAction('Failed to delete review');
        }
      } catch (error) {
        setLastAction(`Error deleting review: ${error}`);
      }
    }
  };

  const exportReviews = () => {
    try {
      const reviewData = reviewService.exportReviews();
      const dataBlob = new Blob([reviewData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `zeks-reviews-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      setLastAction('Reviews exported successfully');
    } catch (error) {
      setLastAction(`Error exporting reviews: ${error}`);
    }
  };

  const getFilteredReviews = () => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter(review => review.status === reviewFilter);
  };

  // Staff management functions (server-side)
  const loadStaffConfig = async () => {
    try {
      const result = await supabaseStaffService.getAllStaffPins(adminKey);
      if (result.success && result.staff.length > 0) {
        setAllStaff(result.staff);
        // Maintain backward compatibility - create legacy config from new data
        const activeStaff = result.staff.find(s => s.is_active);
        if (activeStaff) {
          setStaffPinConfig({
            pin: '',
            createdAt: activeStaff.created_at,
            lastUsed: activeStaff.last_used_at,
            isActive: activeStaff.is_active
          });
        } else {
          setStaffPinConfig(null);
        }
        setLastAction('Staff configuration loaded');
      } else {
        setLastAction(`Error loading staff: ${result.error}`);
      }
    } catch (error) {
      setLastAction(`Error loading staff config: ${error}`);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newStaffData.pin.trim() || !newStaffData.staffName.trim()) {
      setLastAction('PIN and staff name are required');
      return;
    }

    try {
      const result = await supabaseStaffService.createStaffPin({
        pin: newStaffData.pin,
        staffName: newStaffData.staffName,
        role: newStaffData.role,
        phone: newStaffData.phone || undefined,
        email: newStaffData.email || undefined,
        notes: newStaffData.notes || undefined
      }, adminKey);
      
      if (result.success) {
        setNewStaffData({
          pin: '',
          staffName: '',
          role: 'surf_instructor',
          phone: '',
          email: '',
          notes: ''
        });
        setShowCreateStaffForm(false);
        await loadStaffConfig();
        setLastAction(`Staff member created successfully`);
      } else {
        setLastAction(`Error creating staff member: ${result.error}`);
      }
    } catch (error) {
      setLastAction(`Error creating staff member: ${error}`);
    }
  };

  const handleUpdateStaff = async (staffId: string, updates: Partial<StaffPinRow>) => {
    try {
      const result = await supabaseStaffService.updateStaffPin(staffId, updates, adminKey);
      if (result.success) {
        await loadStaffConfig();
        setEditingStaff(null);
        setLastAction('Staff member updated successfully');
      } else {
        setLastAction(`Error updating staff member: ${result.error}`);
      }
    } catch (error) {
      setLastAction(`Error updating staff member: ${error}`);
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete ${staffName}? This will prevent them from accessing the staff portal.`)) {
      return;
    }

    try {
      const result = await supabaseStaffService.deleteStaffPin(staffId, adminKey);
      if (result.success) {
        await loadStaffConfig();
        setLastAction('Staff member deleted');
      } else {
        setLastAction(`Error deleting staff member: ${result.error}`);
      }
    } catch (error) {
      setLastAction(`Error deleting staff member: ${error}`);
    }
  };

  const exportStaffData = async () => {
    try {
      const result = await supabaseStaffService.exportBookingsData();
      const bookingsData = result.success ? result.data || 'No data' : 'Error exporting data';
      const blob = new Blob([bookingsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `staff-bookings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      setLastAction('Staff data exported successfully');
    } catch (error) {
      setLastAction(`Error exporting staff data: ${error}`);
    }
  };

  const addDemoBooking = async () => {
    try {
      const today = new Date();
      const demoBooking: CompletedBooking = {
        id: `demo-${Date.now()}`,
        confirmationNumber: `SURF-${Date.now().toString().slice(-6)}-DEMO`,
        paymentIntentId: `pi_demo_${Math.random().toString(36).substr(2, 9)}`,
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+1 (555) 123-4567',
        beach: 'Doheny',
        date: today.toISOString().split('T')[0],
        startTime: `${today.toISOString().split('T')[0]}T10:00:00-07:00`,
        endTime: `${today.toISOString().split('T')[0]}T11:30:00-07:00`,
        price: 85.00,
        lessonsBooked: 1,
        isPrivate: false,
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      };
      
      await supabaseStaffService.saveCompletedBooking(demoBooking);
      setLastAction('Demo booking added successfully');
    } catch (error) {
      setLastAction(`Error adding demo booking: ${error}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Access Portal</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>

        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access Portal</h1>
              <p className="text-gray-400">Authorized Personnel Only</p>
            </div>

            {isLocked ? (
              <div className="text-center text-red-400">
                <p>Access temporarily locked due to multiple failed attempts.</p>
                <p className="text-sm mt-2">Please wait 30 minutes before trying again.</p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Access Code
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter access code"
                    required
                  />
                </div>
                
                {loginAttempts > 0 && (
                  <div className="text-red-400 text-sm">
                    Invalid access code. {3 - loginAttempts} attempts remaining.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Access System
                </button>
              </form>
            )}

            <div className="mt-6 text-xs text-gray-500 text-center">
              Unauthorized access is prohibited and monitored.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Debug Portal - Zek's Surf School</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🔧</div>
              <div>
                <h1 className="text-xl font-bold">Admin Debug Portal</h1>
                <p className="text-sm text-gray-300">Zek's Surf School - System Diagnostics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDebugInfo}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {lastAction && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-sm">
                <span className="font-medium">Last Action:</span> {lastAction}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
            <div className="max-w-7xl mx-auto flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
              <span className="text-sm">Processing...</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto p-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <button
              onClick={handleTestAPI}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              🌐 Test API
            </button>
            <button
              onClick={() => bookingService.clearAllCache()}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              🗑️ Clear Cache
            </button>
            <button
              onClick={handleClearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              💣 Clear All Data
            </button>
            <button
              onClick={exportDebugData}
              disabled={!debugInfo}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              📁 Export Data
            </button>
            <button
              onClick={() => window.open('/cache-demo', '_blank')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              🧪 Cache Demo
            </button>
            <button
              onClick={() => window.open('/review?paymentId=DEMO123&customerName=John%20Doe&customerEmail=john@example.com&lessonDate=2024-01-15&beach=Doheny&instructorName=Mike', '_blank')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              ⭐ Review Demo
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: '📊 Overview', icon: '📊' },
                  { id: 'reviews', label: '⭐ Reviews', icon: '⭐' },
                  { id: 'staff', label: '👥 Staff Portal', icon: '👥' },
                  { id: 'cache', label: '🗄️ Cache System', icon: '🗄️' },
                  { id: 'storage', label: '💾 Storage', icon: '💾' },
                  { id: 'api', label: '🌐 API Debug', icon: '🌐' },
                  { id: 'chat', label: '💬 Chat System', icon: '💬' },
                  { id: 'system', label: '⚙️ System Info', icon: '⚙️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && debugInfo && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {debugInfo.cacheInfo?.totalEntries || 0}
                      </div>
                      <div className="text-sm text-gray-600">Cache Entries</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {debugInfo.cacheInfo?.validEntries || 0}
                      </div>
                      <div className="text-sm text-gray-600">Valid Entries</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Object.keys(debugInfo.localStorage).length}
                      </div>
                      <div className="text-sm text-gray-600">LocalStorage Keys</div>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-teal-600">
                        {debugInfo.chatInfo?.isConfigured ? '✅' : '❌'}
                      </div>
                      <div className="text-sm text-gray-600">Chat System</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {debugInfo.reviewInfo?.totalReviews || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Reviews</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">
                        {debugInfo.reviewInfo?.pendingReviews || 0}
                      </div>
                      <div className="text-sm text-gray-600">Pending Reviews</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">System Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Timestamp:</span> {debugInfo.timestamp}
                      </div>
                      <div>
                        <span className="font-medium">URL:</span> {debugInfo.url}
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">User Agent:</span> {debugInfo.userAgent}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {reviewStats?.totalReviews || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Reviews</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {reviews.filter(r => r.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {reviews.filter(r => r.status === 'approved').length}
                      </div>
                      <div className="text-sm text-gray-600">Approved</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {reviews.filter(r => r.status === 'rejected').length}
                      </div>
                      <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {reviewStats?.averageOverallRating?.toFixed(1) || '0.0'}
                      </div>
                      <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                  </div>

                  {/* Review Management Controls */}
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Review Management</h3>
                      <div className="flex items-center space-x-2">
                        <select
                          value={reviewFilter}
                          onChange={(e) => setReviewFilter(e.target.value as any)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="all">All Reviews</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          onClick={loadReviews}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          🔄 Refresh
                        </button>
                        <button
                          onClick={exportReviews}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          📁 Export
                        </button>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {getFilteredReviews().length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-2">📝</div>
                          <p>No reviews found</p>
                          <p className="text-sm mt-1">
                            {reviewFilter === 'all' ? 'No reviews have been submitted yet.' : `No ${reviewFilter} reviews found.`}
                          </p>
                        </div>
                      ) : (
                        getFilteredReviews().map((review) => (
                          <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{review.reviewTitle}</h4>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {review.status.toUpperCase()}
                                  </span>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span key={star} className={`text-sm ${
                                        star <= review.overallRating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}>
                                        ★
                                      </span>
                                    ))}
                                    <span className="ml-1 text-sm text-gray-600">
                                      ({review.overallRating}/5)
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                                  <div><strong>Customer:</strong> {review.customerName}</div>
                                  <div><strong>Beach:</strong> {review.beach || 'N/A'}</div>
                                  <div><strong>Date:</strong> {review.lessonDate || 'N/A'}</div>
                                  <div><strong>Payment ID:</strong> {review.paymentId}</div>
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                  {review.reviewText}
                                </p>
                                
                                <div className="text-xs text-gray-500">
                                  Submitted: {new Date(review.submittedAt).toLocaleString()}
                                  {review.approvedAt && (
                                    <span className="ml-4">
                                      Approved: {new Date(review.approvedAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => setSelectedReview(review)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  View
                                </button>
                                {review.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleReviewStatusUpdate(review.id, 'approved')}
                                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                    >
                                      ✓ Approve
                                    </button>
                                    <button
                                      onClick={() => handleReviewStatusUpdate(review.id, 'rejected')}
                                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                    >
                                      ✗ Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Review Detail Modal */}
                  {selectedReview && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">{selectedReview.reviewTitle}</h3>
                            <button
                              onClick={() => setSelectedReview(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Customer:</strong> {selectedReview.customerName}</div>
                              <div><strong>Email:</strong> {selectedReview.customerEmail}</div>
                              <div><strong>Payment ID:</strong> {selectedReview.paymentId}</div>
                              <div><strong>Beach:</strong> {selectedReview.beach || 'N/A'}</div>
                              <div><strong>Lesson Date:</strong> {selectedReview.lessonDate || 'N/A'}</div>
                              <div><strong>Instructor:</strong> {selectedReview.instructorName || 'N/A'}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold">{selectedReview.overallRating}/5</div>
                                <div className="text-sm text-gray-600">Overall</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold">{selectedReview.instructorRating}/5</div>
                                <div className="text-sm text-gray-600">Instructor</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold">{selectedReview.equipmentRating}/5</div>
                                <div className="text-sm text-gray-600">Equipment</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold">{selectedReview.experienceRating}/5</div>
                                <div className="text-sm text-gray-600">Experience</div>
                              </div>
                            </div>
                            
                            <div>
                              <strong>Review:</strong>
                              <p className="mt-1 text-gray-700">{selectedReview.reviewText}</p>
                            </div>
                            
                            <div>
                              <strong>Would Recommend:</strong> {selectedReview.wouldRecommend ? 'Yes' : 'No'}
                            </div>
                            
                            {selectedReview.favoriteAspect && (
                              <div>
                                <strong>Favorite Aspect:</strong>
                                <p className="mt-1 text-gray-700">{selectedReview.favoriteAspect}</p>
                              </div>
                            )}
                            
                            {selectedReview.improvementSuggestions && (
                              <div>
                                <strong>Improvement Suggestions:</strong>
                                <p className="mt-1 text-gray-700">{selectedReview.improvementSuggestions}</p>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-500">
                              <div>Submitted: {new Date(selectedReview.submittedAt).toLocaleString()}</div>
                              {selectedReview.ipAddress && <div>IP: {selectedReview.ipAddress}</div>}
                              {selectedReview.approvedAt && (
                                <div>Approved: {new Date(selectedReview.approvedAt).toLocaleString()} by {selectedReview.approvedBy}</div>
                              )}
                              {selectedReview.adminNotes && (
                                <div>Admin Notes: {selectedReview.adminNotes}</div>
                              )}
                            </div>
                            
                            {selectedReview.status === 'pending' && (
                              <div className="flex space-x-2 pt-4 border-t">
                                <button
                                  onClick={() => handleReviewStatusUpdate(selectedReview.id, 'approved')}
                                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  ✓ Approve Review
                                </button>
                                <button
                                  onClick={() => handleReviewStatusUpdate(selectedReview.id, 'rejected')}
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  ✗ Reject Review
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'staff' && (
                <div className="space-y-6">
                  {/* Staff Management Header */}
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Staff Portal Management</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={loadStaffConfig}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          🔄 Refresh
                        </button>
                        <button
                          onClick={() => setShowCreateStaffForm(!showCreateStaffForm)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          ➕ Add Staff
                        </button>
                        <button
                          onClick={exportStaffData}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                        >
                          📁 Export Bookings
                        </button>
                        <button
                          onClick={addDemoBooking}
                          className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                        >
                          🧪 Add Demo Booking
                        </button>
                      </div>
                    </div>

                    {/* Staff Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {allStaff.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Staff</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {allStaff.filter(s => s.is_active).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Staff</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {allStaff.filter(s => s.role === 'admin').length}
                        </div>
                        <div className="text-sm text-gray-600">Admins</div>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      Staff can access the booking calendar at:
                      <br />
                      <a 
                        href="/staff-portal-a8f3e2b1c9d7e4f6"
                        target="_blank"
                        className="text-blue-600 hover:underline text-xs font-mono"
                      >
                        /staff-portal-a8f3e2b1c9d7e4f6
                      </a>
                    </div>
                  </div>

                  {/* Create Staff Form */}
                  {showCreateStaffForm && (
                    <div className="bg-white p-6 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-4 flex items-center">
                        ➕ Add New Staff Member
                      </h4>
                      <form onSubmit={handleCreateStaff} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              PIN (4-6 digits) *
                            </label>
                            <input
                              type="password"
                              value={newStaffData.pin}
                              onChange={(e) => setNewStaffData(prev => ({ ...prev, pin: e.target.value }))}
                              placeholder="Enter 4-6 digit PIN"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono tracking-widest"
                              minLength={4}
                              maxLength={6}
                              pattern="[0-9]{4,6}"
                              title="PIN must be 4-6 digits"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={newStaffData.staffName}
                              onChange={(e) => setNewStaffData(prev => ({ ...prev, staffName: e.target.value }))}
                              placeholder="Enter staff member's name"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role *
                            </label>
                            <select
                              value={newStaffData.role}
                              onChange={(e) => setNewStaffData(prev => ({ ...prev, role: e.target.value as 'surf_instructor' | 'admin' }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                            >
                              <option value="surf_instructor">🏄‍♂️ Surf Instructor</option>
                              <option value="admin">👨‍💼 Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={newStaffData.phone}
                              onChange={(e) => setNewStaffData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="(555) 123-4567"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={newStaffData.email}
                              onChange={(e) => setNewStaffData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="staff@zeksurfschool.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={newStaffData.notes}
                              onChange={(e) => setNewStaffData(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Additional notes..."
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 pt-4">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Create Staff Member
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateStaffForm(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Staff List */}
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="font-semibold mb-4">Staff Members ({allStaff.length})</h4>
                    
                    {allStaff.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">👥</div>
                        <p>No staff members found</p>
                        <p className="text-sm">Click "Add Staff" to create the first staff member</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {allStaff.map((staff) => (
                          <div key={staff.id} className={`border rounded-lg p-4 ${staff.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="font-semibold text-lg">
                                    {staff.staff_name}
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                                    staff.role === 'admin' 
                                      ? 'bg-purple-100 text-purple-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {staff.role === 'admin' ? '👨‍💼 Admin' : '🏄‍♂️ Surf Instructor'}
                                  </div>
                                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                                    staff.is_active 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {staff.is_active ? '✅ Active' : '❌ Inactive'}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">PIN:</span> {staff.pin}
                                  </div>
                                  {staff.phone && (
                                    <div>
                                      <span className="font-medium">Phone:</span> {staff.phone}
                                    </div>
                                  )}
                                  {staff.email && (
                                    <div>
                                      <span className="font-medium">Email:</span> {staff.email}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium">Created:</span> {new Date(staff.created_at).toLocaleDateString()}
                                  </div>
                                  {staff.last_used_at && (
                                    <div>
                                      <span className="font-medium">Last Used:</span> {new Date(staff.last_used_at).toLocaleDateString()}
                                    </div>
                                  )}
                                  {staff.notes && (
                                    <div className="md:col-span-3">
                                      <span className="font-medium">Notes:</span> {staff.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleUpdateStaff(staff.id, { is_active: !staff.is_active })}
                                  className={`px-3 py-1 rounded text-sm ${
                                    staff.is_active 
                                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {staff.is_active ? '⏸️ Disable' : '▶️ Enable'}
                                </button>
                                <button
                                  onClick={() => setEditingStaff(staff)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(staff.id, staff.staff_name)}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit Staff Modal */}
                  {editingStaff && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h4 className="font-semibold mb-4">
                          Edit {editingStaff.staff_name}
                        </h4>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                                                     const phoneValue = formData.get('phone') as string;
                           const emailValue = formData.get('email') as string;
                           const notesValue = formData.get('notes') as string;
                           
                           const updates = {
                             pin: formData.get('pin') as string,
                             staff_name: formData.get('staffName') as string,
                             role: formData.get('role') as 'surf_instructor' | 'admin',
                             phone: phoneValue?.trim() || undefined,
                             email: emailValue?.trim() || undefined,
                             notes: notesValue?.trim() || undefined,
                           };
                          handleUpdateStaff(editingStaff.id, updates);
                        }} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              PIN (4-6 digits)
                            </label>
                            <input
                              name="pin"
                              type="password"
                              defaultValue={editingStaff.pin}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono tracking-widest"
                              minLength={4}
                              maxLength={6}
                              pattern="[0-9]{4,6}"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <input
                              name="staffName"
                              type="text"
                              defaultValue={editingStaff.staff_name}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role
                            </label>
                            <select
                              name="role"
                              defaultValue={editingStaff.role}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="surf_instructor">🏄‍♂️ Surf Instructor</option>
                              <option value="admin">👨‍💼 Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              name="phone"
                              type="tel"
                              defaultValue={editingStaff.phone || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input
                              name="email"
                              type="email"
                              defaultValue={editingStaff.email || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <input
                              name="notes"
                              type="text"
                              defaultValue={editingStaff.notes || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-center space-x-3 pt-4">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Update Staff
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStaff(null)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Booking Statistics */}
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="font-semibold mb-3">Booking Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xl font-bold text-gray-700">
                          {bookingStats.total}
                        </div>
                        <div className="text-sm text-gray-600">Total Bookings</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-xl font-bold text-blue-700">
                          {bookingStats.confirmed}
                        </div>
                        <div className="text-sm text-gray-600">Confirmed</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-xl font-bold text-green-700">
                          {bookingStats.completed}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <div className="text-xl font-bold text-red-700">
                          {bookingStats.cancelled}
                        </div>
                        <div className="text-sm text-gray-600">Cancelled</div>
                      </div>
                    </div>
                  </div>

                  {/* Clear Data Warning */}
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">⚠️ Danger Zone</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Clear all booking data. This action cannot be undone.
                      </p>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to clear ALL booking data? This cannot be undone!')) {
                            supabaseStaffService.clearAllBookings();
                            setLastAction('All booking data cleared');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Clear All Bookings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cache' && debugInfo && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Cache System Debug</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(debugInfo.cacheInfo, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === 'storage' && debugInfo && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">LocalStorage Data</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                      {JSON.stringify(debugInfo.localStorage, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">SessionStorage Data</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                      {JSON.stringify(debugInfo.sessionStorage, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'api' && debugInfo && (
                <div className="space-y-6">
                  {/* Webhook Request Summary */}
                  {debugInfo.apiPayload && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg flex items-center">
                          🌐 Last Webhook Request
                          <span className={`ml-2 px-2 py-1 rounded text-sm ${
                            debugInfo.apiPayload.success 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {debugInfo.apiPayload.success ? 'SUCCESS' : 'FAILED'}
                          </span>
                        </h3>
                        <div className="text-sm text-gray-600">
                          {debugInfo.apiPayload.timestamp ? 
                            new Date(debugInfo.apiPayload.timestamp).toLocaleString() : 'Unknown time'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm font-medium text-gray-600">Request ID</div>
                          <div className="font-mono text-sm">{debugInfo.apiPayload.requestId || 'N/A'}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm font-medium text-gray-600">Response Time</div>
                          <div className="font-mono text-sm">
                            {debugInfo.apiPayload.response?.responseTime || 'N/A'}ms
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm font-medium text-gray-600">HTTP Status</div>
                          <div className="font-mono text-sm">
                            {debugInfo.apiPayload.response?.status || 'N/A'} {debugInfo.apiPayload.response?.statusText || ''}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium text-gray-600 mb-2">Webhook URL</div>
                        <div className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                          {debugInfo.apiPayload.url || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Request Payload */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      📤 Request Payload
                      {debugInfo.apiPayload?.payload && (
                        <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                          {Object.keys(debugInfo.apiPayload.payload).length} fields
                        </span>
                      )}
                    </h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm font-mono">
                      {debugInfo.apiPayload?.payload ? 
                        JSON.stringify(debugInfo.apiPayload.payload, null, 2) : 
                        'No payload data available'}
                    </div>
                  </div>

                  {/* Response Data */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      📥 Response Data
                      {debugInfo.apiPayload?.response?.rawData && (
                        <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                          Raw + Processed
                        </span>
                      )}
                    </h3>
                    
                    {/* Raw Response */}
                    {debugInfo.apiPayload?.response?.rawData && (
                      <div className="mb-4">
                        <h4 className="font-medium text-md mb-2 text-gray-700">Raw Webhook Response:</h4>
                        <div className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-auto text-sm font-mono max-h-64">
                          {JSON.stringify(debugInfo.apiPayload.response.rawData, null, 2)}
                        </div>
                      </div>
                    )}

                    {/* Processed Response */}
                    {debugInfo.apiPayload?.response?.processedData && (
                      <div className="mb-4">
                        <h4 className="font-medium text-md mb-2 text-gray-700">Processed Data (Used by App):</h4>
                        <div className="bg-gray-900 text-yellow-400 p-4 rounded-lg overflow-auto text-sm font-mono max-h-64">
                          {JSON.stringify(debugInfo.apiPayload.response.processedData, null, 2)}
                        </div>
                      </div>
                    )}

                    {/* Fallback to old format */}
                    {!debugInfo.apiPayload?.response?.rawData && debugInfo.apiResponse && (
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm font-mono max-h-64">
                        {JSON.stringify(debugInfo.apiResponse, null, 2)}
                      </div>
                    )}
                  </div>

                  {/* Response Headers */}
                  {debugInfo.apiPayload?.response?.headers && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">📋 Response Headers</h3>
                      <div className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                        <pre>{JSON.stringify(debugInfo.apiPayload.response.headers, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {debugInfo.lastError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 text-red-600 flex items-center">
                        ❌ Last Error
                      </h3>
                      <div className="bg-red-900 text-red-100 p-4 rounded-lg overflow-auto text-sm font-mono">
                        {typeof debugInfo.lastError === 'string' ? 
                          debugInfo.lastError : 
                          JSON.stringify(debugInfo.lastError, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* No Data Message */}
                  {!debugInfo.apiPayload && !debugInfo.apiResponse && !debugInfo.lastError && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">🔍</div>
                      <p>No webhook requests recorded yet.</p>
                      <p className="text-sm mt-2">Make a booking request to see webhook data here.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chat' && debugInfo && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg mb-4">🤖 Chat System Status</h3>
                  
                  {/* Chat Configuration */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-md mb-3 flex items-center">
                      ⚙️ Configuration
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        debugInfo.chatInfo?.isConfigured 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {debugInfo.chatInfo?.isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                      </span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium text-gray-600">Webhook URL</div>
                        <div className="font-mono text-xs mt-1 break-all">
                          {debugInfo.chatInfo?.webhookUrl || 'Not configured'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium text-gray-600">Status</div>
                        <div className={`text-sm mt-1 ${
                          debugInfo.chatInfo?.isConfigured ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {debugInfo.chatInfo?.isConfigured ? '✅ Ready' : '❌ Needs configuration'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Information */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-md mb-3">
                      🆔 Session Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium text-gray-600">Current Session ID</div>
                        <div className="font-mono text-xs mt-1 break-all">
                          {debugInfo.chatInfo?.sessionId || 'No session'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium text-gray-600">Session Persistence</div>
                        <div className={`text-sm mt-1 ${
                          debugInfo.chatInfo?.hasSessionInStorage ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {debugInfo.chatInfo?.hasSessionInStorage ? '✅ Stored in localStorage' : '⚠️ Not persisted'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-md mb-3">🔧 Environment Setup</h4>
                    
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm font-medium text-gray-600 mb-2">Required Environment Variable</div>
                      <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                        NEXT_PUBLIC_CHAT_WEBHOOK_URL
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Set this in your .env.local file to enable chat functionality
                      </div>
                    </div>
                  </div>

                  {/* Markdown Support */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-md mb-3">✨ Markdown Support</h4>
                    
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm font-medium text-gray-600 mb-2">Supported Formatting in AI Responses:</div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div><code className="bg-gray-100 px-1 rounded">**bold text**</code> → <strong>bold text</strong></div>
                        <div><code className="bg-gray-100 px-1 rounded">*italic text*</code> → <em>italic text</em></div>
                        <div><code className="bg-gray-100 px-1 rounded">__underlined__</code> → <u>underlined</u></div>
                        <div><code className="bg-gray-100 px-1 rounded">`code text`</code> → <code className="bg-gray-200 px-1 rounded">code text</code></div>
                        <div><code className="bg-gray-100 px-1 rounded">~~strikethrough~~</code> → <s>strikethrough</s></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        AI responses automatically render these markdown formats
                      </div>
                    </div>
                  </div>

                  {/* Chat Actions */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-md mb-3">🎯 Quick Actions</h4>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          chatService.resetSession();
                          loadDebugInfo();
                          setLastAction('Chat session reset - new session ID generated');
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        🔄 Reset Chat Session
                      </button>
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            const sessionId = localStorage.getItem('surf-chat-session-id');
                            if (sessionId) {
                              navigator.clipboard.writeText(sessionId);
                              setLastAction('Session ID copied to clipboard');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        📋 Copy Session ID
                      </button>
                      <button
                        onClick={() => window.open('/chat', '_blank')}
                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
                      >
                        💬 Open Chat
                      </button>
                    </div>
                  </div>

                  {/* Raw Chat Data */}
                  <div>
                    <h4 className="font-semibold text-md mb-3">📋 Raw Chat Debug Data</h4>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-64">
                      {JSON.stringify(debugInfo.chatInfo, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'system' && debugInfo && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Complete System Information</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 