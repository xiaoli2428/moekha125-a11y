import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('Supabase config missing');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET missing');
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
}

export default async function handler(req, res) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') return res.status(200).end();
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const supabase = getSupabase();
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, username, wallet_address, role, balance, credit_score, status, created_at')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ error: 'Account is suspended or banned' });
        }

        res.status(200).json({
            id: user.id,
            email: user.email,
            username: user.username,
            walletAddress: user.wallet_address,
            role: user.role || 'user',
            balance: parseFloat(user.balance) || 0,
            creditScore: user.credit_score || 100,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
