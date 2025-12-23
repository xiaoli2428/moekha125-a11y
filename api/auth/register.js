import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase config missing');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function generateToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password, username } = req.body || {};

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be 6+ characters' });
    }

    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        username,
        role: 'user',
        balance: 0,
        status: 'active',
        credit_score: 100
      }])
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Failed to create user', detail: error.message });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
  } catch (error) {
  console.error('Register error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
}
