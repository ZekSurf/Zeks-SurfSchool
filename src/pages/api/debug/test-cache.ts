import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { supabaseCacheService } from '@/lib/supabaseCacheService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // SECURITY: Disable debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not Found' });
  }
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end('Method Not Allowed');
    }

    try {
      // SECURITY: Only allow in development
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
          success: false,
          error: 'Debug endpoints only available in development'
        });
      }

      const results: any[] = [];
      
      console.log('🧪 Test 1: Checking cache table access...');
      try {
        const info = await supabaseCacheService.getCacheInfo();
        results.push({
          test: 'Cache Info Access',
          status: 'SUCCESS',
          data: info
        });
      } catch (error) {
        results.push({
          test: 'Cache Info Access', 
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      console.log('🧪 Test 2: Testing cache service integration...');
      try {
        // Test using the public getBookingSlotsForDay method which will create cache entries
        const mockFetchFunction = async (beach: string, date: Date) => {
          return {
            beach: beach,
            date: date.toISOString().split('T')[0],
            slots: [
              {
                slotId: 'test-slot-1',
                startTime: '2024-12-01T09:00:00-08:00',
                endTime: '2024-12-01T10:30:00-08:00',
                label: 'Good',
                price: 110,
                openSpaces: '3',
                available: true,
                sky: 'Sunny'
              }
            ],
            meta: {
              fetchedAt: new Date().toISOString(),
              timezone: 'America/Los_Angeles'
            }
          };
        };

        const slots = await supabaseCacheService.getBookingSlotsForDay('2024-12-01', 'Doheny', true, mockFetchFunction);
        results.push({
          test: 'Cache Service Integration',
          status: 'SUCCESS',
          data: {
            slotsFound: slots?.slots?.length || 0,
            beach: slots?.beach,
            date: slots?.date
          }
        });
      } catch (error) {
        results.push({
          test: 'Cache Service Integration',
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      console.log('🧪 Test 3: Testing cache cleanup...');
      try {
        await supabaseCacheService.clearCacheForDate('2024-12-01', 'Doheny');
        results.push({
          test: 'Cache Cleanup',
          status: 'SUCCESS',
          data: 'Test entries cleared for date'
        });
      } catch (error) {
        results.push({
          test: 'Cache Cleanup',
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Final cache info check
      try {
        const finalInfo = await supabaseCacheService.getCacheInfo();
        results.push({
          test: 'Final Cache State',
          status: 'SUCCESS',
          data: finalInfo
        });
      } catch (error) {
        results.push({
          test: 'Final Cache State',
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      const successCount = results.filter(r => r.status === 'SUCCESS').length;
      const totalTests = results.length;

      console.log('🧪 Cache Test Results:', results);

      return res.status(200).json({
        success: true,
        summary: {
          totalTests,
          successCount,
          failureCount: totalTests - successCount,
          allPassed: successCount === totalTests
        },
        results
      });

    } catch (error) {
      console.error('Cache test error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
} 