// Static imports (required for Vercel serverless)
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Main handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Initialize Supabase
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return res.status(500).json({ error: 'Supabase config missing' });

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, password_hash, role, status')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account suspended' });

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate token
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });
    const token = jwt.sign({ userId: user.id, role: user.role || 'user' }, secret, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
