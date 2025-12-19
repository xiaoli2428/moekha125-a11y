import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

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
      .select('id, email, username, role, balance, status, credit_score, wallet_address')
      .eq('wallet_address', address.toLowerCase())
      .maybeSingle();

    // If user doesn't exist, create a new one
    if (!user) {
      const username = `wallet_${address.slice(0, 8).toLowerCase()}`;
      const email = `${address.toLowerCase()}@wallet.onchainweb`;
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          username,
          wallet_address: address.toLowerCase(),
          password_hash: 'wallet_auth',
          role: 'user',
          balance: 0,
          status: 'active',
          credit_score: 100
        })
        .select('id, email, username, role, balance, status, credit_score, wallet_address')
        .single();

      if (createError) {
        console.error('Wallet user creation error:', createError);
        return res.status(500).json({ error: 'Failed to create wallet user' });
      }

      user = newUser;
    }

    // Check status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    // Generate token
    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      message: 'Wallet login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
        creditScore: user.credit_score,
        walletAddress: user.wallet_address
      }
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
