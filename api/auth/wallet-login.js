import { ethers } from 'ethers';
import { handleCors, setCorsHeaders } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';
import { generateToken } from '../../lib/jwt.js';

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

export default async function handler(req, res) {
  handleCors(req, res);
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, message, signature } = req.body;

    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Address, message, and signature are required' });
    }

    // Verify the signature matches the address (ethers v5 syntax)
    let recoveredAddress;
    try {
      recoveredAddress = ethers.utils.verifyMessage(message, signature);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Check if recovered address matches the claimed address
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Check if user with this wallet address exists
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, wallet_address, role, short_uid, created_at')
      .ilike('wallet_address', address)
      .maybeSingle();

    // If user doesn't exist, create a new one
    if (!user) {
      const shortUid = await generateUniqueShortUID();
      const username = `wallet_${address.slice(0, 8).toLowerCase()}`;

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username,
          wallet_address: address.toLowerCase(),
          short_uid: shortUid,
          role: 'user',
          profile_data: {}
        })
        .select('id, email, username, wallet_address, role, short_uid, created_at')
        .single();

      if (createError) {
        console.error('Create wallet user error:', createError);
        return res.status(500).json({ error: 'Failed to create user', detail: createError.message });
      }

      user = newUser;
    } else {
      // Update last_seen for existing user
      await supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role || 'user' });

    res.status(200).json({
      message: 'Wallet login successful',
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
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
