import { NextApiRequest, NextApiResponse } from 'next';
import { waiverService } from '@/lib/waiverService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET and POST requests for flexibility with cron services
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧹 Starting waiver signature cleanup...');

    const result = await waiverService.cleanupOrphanedSignatures();

    if (result.success) {
      console.log(`✅ Cleanup completed. Deleted ${result.deletedCount} orphaned waiver signatures.`);
      
      res.status(200).json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} orphaned waiver signatures`,
        deletedCount: result.deletedCount
      });
    } else {
      console.error('❌ Cleanup failed:', result.error);
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('💥 Exception during waiver cleanup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 