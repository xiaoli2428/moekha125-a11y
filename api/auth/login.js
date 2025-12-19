import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, wallet_address } = req.body;

    if (!email && !wallet_address) {
      return res.status(400).json({ error: 'Email or wallet address required' });
    }

    // Find user by email or wallet
    let query = supabase
      .from('users')
      .select('id, email, username, wallet_address, role, short_uid, created_at, last_seen');
    
    if (email) {
      query = query.eq('email', email);
    } else {
      query = query.ilike('wallet_address', wallet_address);
    }
    
    const { data: user, error } = await query.maybeSingle();

    if (error) {
      console.error('Login query error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last_seen
    await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', user.id);

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role || 'user' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.wallet_address,
        role: user.role || 'user',
        shortUid: user.short_uid
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
