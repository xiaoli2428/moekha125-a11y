import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

function generateToken(payload) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  if (!JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function getSupabase() {
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!URL || !KEY) throw new Error(`Supabase config missing: URL=${!!URL}, KEY=${!!KEY}`);
  return createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { address, message, signature } = req.body;

    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Missing: address, message, or signature' });
    }

    let recoveredAddress;
    try {
      recoveredAddress = ethers.utils.verifyMessage(message, signature);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature', detail: err.message });
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Address mismatch' });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, wallet_address, role, created_at')
      .ilike('wallet_address', address)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database query error', detail: error.message });
    }

    if (!user) {
      const username = `wallet_${address.slice(0, 8).toLowerCase()}`;
      const dummyEmail = `${address.toLowerCase()}@wallet.onchainweb`;
      const dummyPasswordHash = 'wallet_login_no_password';

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username,
          email: dummyEmail,
          password_hash: dummyPasswordHash,
          wallet_address: address.toLowerCase(),
          role: 'user',
          balance: 0,
          status: 'active',
          credit_score: 100
        })
        .select('id, email, username, wallet_address, role, created_at')
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Failed to create user', detail: createError.message });
      }
      user = newUser;
    }

    const token = generateToken({ userId: user.id, role: user.role || 'user' });

    return res.status(200).json({
      message: 'Wallet login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.wallet_address,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    return res.status(500).json({ error: 'Internal error', detail: error.message });
  }
}
