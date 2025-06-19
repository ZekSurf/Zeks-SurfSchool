import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { supabaseCacheService } from '@/lib/supabaseCacheService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test 1: Check if cache table exists and is accessible
    console.log('🧪 Test 1: Checking cache table access...');
    const { data: tableTest, error: tableError } = await supabase
      .from('time_slots_cache')
      .select('*')
      .limit(1);

    // Test 2: Try to create a test cache entry
    console.log('🧪 Test 2: Creating test cache entry...');
    const testCacheKey = `test_${Date.now()}`;
    const testDate = new Date().toISOString().split('T')[0];
    const testData = {
      slots: [
        { id: 'test-1', time: '9:00 AM', available: true }
      ],
      beach: 'Test Beach',
      date: testDate
    };

    const { data: insertData, error: insertError } = await supabase
      .from('time_slots_cache')
      .insert({
        cache_key: testCacheKey,
        beach: 'Test Beach',
        date: testDate,
        data: testData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select();

    // Test 3: Try to read the test entry back
    console.log('🧪 Test 3: Reading test cache entry...');
    const { data: readData, error: readError } = await supabase
      .from('time_slots_cache')
      .select('*')
      .eq('cache_key', testCacheKey)
      .single();

    // Test 4: Try the cache service methods
    console.log('🧪 Test 4: Testing cache service...');
    let cacheServiceTest = null;
    let cacheServiceError = null;
    try {
      const cacheInfo = await supabaseCacheService.getCacheInfo();
      cacheServiceTest = {
        cacheInfoSuccess: true,
        totalEntries: cacheInfo.totalEntries,
        validEntries: cacheInfo.validEntries
      };
    } catch (error) {
      cacheServiceError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 5: Clean up test entry
    console.log('🧪 Test 5: Cleaning up test entry...');
    const { error: deleteError } = await supabase
      .from('time_slots_cache')
      .delete()
      .eq('cache_key', testCacheKey);

    const results = {
      test1_table_access: {
        success: !tableError,
        error: tableError?.message || null,
        accessible: !!tableTest
      },
      test2_insert: {
        success: !insertError,
        error: insertError?.message || null,
        inserted_id: insertData?.[0]?.id || null
      },
      test3_read: {
        success: !readError,
        error: readError?.message || null,
        data_matches: readData?.data ? JSON.stringify(readData.data) === JSON.stringify(testData) : false
      },
      test4_cache_service: {
        success: !cacheServiceError,
        error: cacheServiceError,
        data: cacheServiceTest
      },
      test5_cleanup: {
        success: !deleteError,
        error: deleteError?.message || null
      },
      overall_status: !tableError && !insertError && !readError && !cacheServiceError && !deleteError ? 'PASS' : 'FAIL'
    };

    console.log('🧪 Cache Test Results:', results);

    return res.status(200).json({
      message: 'Cache system test completed',
      results
    });

  } catch (error) {
    console.error('Cache test error:', error);
    return res.status(500).json({ 
      error: 'Cache test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 