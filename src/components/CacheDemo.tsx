import { useState, useEffect } from 'react';
import { bookingService } from '@/lib/bookingService';

export const CacheDemo = () => {
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const updateCacheInfo = () => {
    setCacheInfo(bookingService.getCacheInfo());
  };

  useEffect(() => {
    updateCacheInfo();
  }, []);

  const handleTestFetch = async (beach: string, forceRefresh: boolean = false) => {
    setIsLoading(true);
    setLastAction(`Fetching ${beach} data (${forceRefresh ? 'force refresh' : 'with cache'})`);
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await bookingService.fetchAvailableSlots(beach, tomorrow, forceRefresh);
      setLastAction(`✅ Successfully fetched ${beach} data`);
    } catch (error) {
      setLastAction(`❌ Failed to fetch ${beach} data: ${error}`);
    } finally {
      setIsLoading(false);
      updateCacheInfo();
    }
  };

  const handleClearCache = () => {
    bookingService.clearAllCache();
    setLastAction('🗑️ Cleared entire cache');
    updateCacheInfo();
  };

  const handleClearExpired = () => {
    bookingService.cleanExpiredCache();
    setLastAction('🧹 Cleaned expired cache entries');
    updateCacheInfo();
  };

  const handleClearSpecific = (date: string, beach: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    bookingService.clearCacheForDate(tomorrow, beach);
    setLastAction(`🗑️ Cleared cache for ${beach} on ${date}`);
    updateCacheInfo();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🗄️ Booking Cache System Demo</h2>
        <p className="text-gray-600 mb-6">
          Test the caching functionality for the surf lesson booking system. 
          Cache entries expire after 24 hours and are automatically cleaned up.
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => handleTestFetch('Doheny')}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Fetch Doheny
          </button>
          <button
            onClick={() => handleTestFetch('San Onofre')}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Fetch San Onofre
          </button>
          <button
            onClick={() => handleTestFetch('T-Street')}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Fetch T-Street
          </button>
          <button
            onClick={() => handleTestFetch('Doheny', true)}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Force Refresh
          </button>
        </div>

        {/* Cache Management */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ Clear All Cache
          </button>
          <button
            onClick={handleClearExpired}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            🧹 Clean Expired
          </button>
          <button
            onClick={updateCacheInfo}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🔄 Refresh Info
          </button>
        </div>

        {/* Status */}
        {lastAction && (
          <div className="mb-6 p-3 bg-gray-100 rounded border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-800">Last Action:</div>
            <div className="text-sm text-gray-600">{lastAction}</div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-6 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Cache Info Display */}
      {cacheInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Cache Statistics</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{cacheInfo.totalEntries}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{cacheInfo.validEntries}</div>
              <div className="text-sm text-gray-600">Valid Entries</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{cacheInfo.expiredEntries}</div>
              <div className="text-sm text-gray-600">Expired Entries</div>
            </div>
          </div>

          {/* Cache Entries Details */}
          {cacheInfo.entries && cacheInfo.entries.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-3 text-gray-800">Cache Entries:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Beach</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Age (hours)</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cacheInfo.entries.map((entry: any, index: number) => (
                      <tr key={entry.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm text-gray-900">{entry.beach}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{entry.date}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{entry.age}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.isValid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.isValid ? '✅ Valid' : '❌ Expired'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => handleClearSpecific(entry.date, entry.beach)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            🗑️ Clear
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {cacheInfo.entries && cacheInfo.entries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No cache entries found. Try fetching some data first!
            </div>
          )}
        </div>
      )}

      {/* Cache Key Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">🔑 Cache Key Examples</h3>
        <div className="space-y-2 text-sm font-mono bg-gray-100 p-4 rounded">
          <div><span className="text-blue-600">2024-12-15_doheny</span> - Doheny on Dec 15, 2024</div>
          <div><span className="text-blue-600">2024-12-15_san_onofre</span> - San Onofre on Dec 15, 2024</div>
          <div><span className="text-blue-600">2024-12-15_t-street</span> - T-Street on Dec 15, 2024</div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Cache keys are generated by combining the date (YYYY-MM-DD) and beach name (lowercase, spaces replaced with underscores).
        </p>
      </div>

      {/* Console Log Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-2xl mr-2">🖥️</span>
          <div>
            <h4 className="font-medium text-yellow-800">Console Logging</h4>
            <p className="text-sm text-yellow-700">
              Check your browser's console for detailed cache operation logs including hits, misses, 
              API calls, and cleanup operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 