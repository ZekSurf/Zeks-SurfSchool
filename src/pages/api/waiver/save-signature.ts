import { NextApiRequest, NextApiResponse } from 'next';
import { waiverService } from '@/lib/waiverService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      slotId,
      paymentIntentId,
      signerName,
      participantName,
      guardianName,
      isMinor,
      customerEmail,
      customerPhone,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions
    } = req.body;

    // Validate required fields
    if (!slotId || !paymentIntentId || !signerName || !participantName || 
        !customerEmail || !customerPhone || !emergencyContactName || !emergencyContactPhone) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['slotId', 'paymentIntentId', 'signerName', 'participantName', 'customerEmail', 'customerPhone', 'emergencyContactName', 'emergencyContactPhone']
      });
    }

    // Validate minor requirements
    if (isMinor && !guardianName) {
      return res.status(400).json({ error: 'Guardian name required for minors' });
    }

    // Get client info for audit trail
    const clientInfo = waiverService.getClientInfo(req);

    // Save waiver signature
    const result = await waiverService.storeTemporaryWaiverSignature({
      slotId,
      paymentIntentId,
      signerName,
      participantName,
      guardianName,
      isMinor: !!isMinor,
      customerEmail,
      customerPhone,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions,
      ipAddress: clientInfo.ip_address,
      userAgent: clientInfo.user_agent
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving waiver signature:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 