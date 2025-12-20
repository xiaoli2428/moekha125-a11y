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

async function generateUniqueShortUID() {
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    const uid = Math.floor(10000 + Math.random() * 90000).toString();
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('short_uid', uid)
      .maybeSingle();
    
    if (!existing) {
      return uid;
    }
  }
  // Fallback to 6-digit UID if 5-digit is exhausted
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const { email, username, wallet_address } = req.body;

    // At least email or wallet_address required
    if (!email && !wallet_address) {
      return res.status(400).json({ error: 'Email or wallet address is required' });
    }

    // Check if user already exists
    let query = supabase.from('users').select('id');
    if (email && wallet_address) {
      query = query.or(`email.eq.${email},wallet_address.ilike.${wallet_address}`);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      query = query.ilike('wallet_address', wallet_address);
    }
    
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate unique UID
    const shortUid = await generateUniqueShortUID();

    // Create user - matching actual DB schema
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email || null,
        wallet_address: wallet_address ? wallet_address.toLowerCase() : null,
        username: username || email?.split('@')[0] || `user_${shortUid}`,
        short_uid: shortUid,
        role: 'user',
        profile_data: {}
      })
      .select('id, email, username, wallet_address, role, short_uid, created_at')
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ 
        error: 'Failed to create user',
        detail: error.message
      });
    }

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.wallet_address,
        role: user.role,
        shortUid: user.short_uid
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
