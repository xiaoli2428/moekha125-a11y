import { handleCors, setCorsHeaders, authenticate } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

export default async function handler(req, res) {
    handleCors(req, res);
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Parse query params
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        // Fetch user transactions
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('id, type, amount, balance_before, balance_after, description, status, created_at')
            .eq('user_id', decoded.userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Transactions query error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(200).json(transactions || []);
    } catch (error) {
        console.error('Transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
