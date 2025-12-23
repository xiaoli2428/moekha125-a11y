import { ethers } from 'ethers';
import { handleCors, setCorsHeaders } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';
import { generateToken } from '../../lib/jwt.js';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
      console.error('Signature verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature', detail: err.message });
    }

    // Check if recovered address matches the claimed address
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Check if user with this wallet address exists
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, wallet_address, role, created_at')
      .ilike('wallet_address', address)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Wallet query error:', error);
      return res.status(500).json({ error: 'Database error', detail: error.message });
    }

    // If user doesn't exist, create a new one
    if (!user) {
      const username = `wallet_${address.slice(0, 8).toLowerCase()}`;

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username,
          wallet_address: address.toLowerCase(),
          role: 'user'
        })
        .select()
        .single();

      if (createError) {
        console.error('Create wallet user error:', createError);
        return res.status(500).json({ error: 'Failed to create user', detail: createError.message });
      }

      user = newUser;
    }

    // Generate token
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
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
