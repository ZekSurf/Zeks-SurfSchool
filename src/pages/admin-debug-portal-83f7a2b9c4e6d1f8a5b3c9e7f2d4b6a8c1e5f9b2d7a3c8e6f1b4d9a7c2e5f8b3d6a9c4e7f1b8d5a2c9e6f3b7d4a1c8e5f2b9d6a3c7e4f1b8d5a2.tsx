import { useState, useEffect } from 'react';
import Head from 'next/head';
import { bookingService } from '@/lib/bookingService';
import { bookingCache } from '@/lib/bookingCache';
import { chatService } from '@/lib/chatService';

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
}

export default function AdminDebugPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  // The admin password - use environment variable or fallback to default
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DEBUG_PASSWORD || 'ZekoSurf2024!Admin#Debug';

  useEffect(() => {
    // Check if already authenticated in session
    const authStatus = sessionStorage.getItem('admin_debug_auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      loadDebugInfo();
    }

    // Check if user is locked out
    const lockoutTime = localStorage.getItem('admin_debug_lockout');
    if (lockoutTime && Date.now() - parseInt(lockoutTime) < 30 * 60 * 1000) { // 30 min lockout
      setIsLocked(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      alert('Too many failed attempts. Please wait 30 minutes before trying again.');
      return;
    }

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_debug_auth', 'authenticated');
      setLoginAttempts(0);
      localStorage.removeItem('admin_debug_lockout');
      loadDebugInfo();
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
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_debug_auth');
    setPassword('');
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
        chatInfo: getChatInfo()
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
    link.download = `zeko-debug-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    setLastAction('Debug data exported');
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
        <title>Admin Debug Portal - Zeko Surf School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🔧</div>
              <div>
                <h1 className="text-xl font-bold">Admin Debug Portal</h1>
                <p className="text-sm text-gray-300">Zeko Surf School - System Diagnostics</p>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: '📊 Overview', icon: '📊' },
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
                        {debugInfo.environment.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">Environment</div>
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