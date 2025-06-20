import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password is required' 
      });
    }

    // Use server-side environment variable for security
    const ADMIN_PASSWORD = process.env.ADMIN_DEBUG_PASSWORD || 'ZeksSurf2024!Admin#Debug';

    if (password === ADMIN_PASSWORD) {
      return res.status(200).json({ 
        success: true, 
        message: 'Authentication successful' 
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password' 
      });
    }

  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 