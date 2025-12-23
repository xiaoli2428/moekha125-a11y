export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

        // Dynamic imports
        const { createClient } = await import('@supabase/supabase-js');
        const jwt = await import('jsonwebtoken').then(m => m.default);

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        // Verify token
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'JWT_SECRET missing' });

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (e) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Initialize Supabase
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_KEY;
        if (!url || !key) return res.status(500).json({ error: 'Supabase config missing' });

        const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
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

        return res.status(200).json({
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
        return res.status(500).json({ error: 'Internal server error' });
    }
}
