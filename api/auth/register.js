import bcrypt from 'bcrypt';
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
    const { email, password, username } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique UID
    const shortUid = await generateUniqueShortUID();

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        username,
        short_uid: shortUid,
        role: 'user',
        balance: 0,
        status: 'active',
        credit_score: 100
      })
      .select('id, email, username, role, balance, credit_score, short_uid, created_at')
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
        role: user.role,
        balance: parseFloat(user.balance) || 0,
        creditScore: user.credit_score,
        shortUid: user.short_uid
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
