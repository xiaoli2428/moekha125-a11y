import { handleCors, setCorsHeaders, authenticate, isAdmin } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

export default async function handler(req, res) {
    handleCors(req, res);
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const user = await authenticate(req);
        if (!user || !isAdmin(user)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // GET /api/admin/dashboard
        if (req.method === 'GET' && req.url === '/api/admin/dashboard') {
            return getDashboard(req, res);
        }

        // GET /api/admin/users
        if (req.method === 'GET' && req.url === '/api/admin/users') {
            return getUsers(req, res);
        }

        // GET /api/admin/users/[id]
        if (req.method === 'GET' && req.url.match(/^\/api\/admin\/users\/[^/]+$/)) {
            const userId = req.url.split('/').pop();
            return getUserDetails(req, res, userId);
        }

        // PATCH /api/admin/users/[id]/status
        if (req.method === 'PATCH' && req.url.includes('/status')) {
            const userId = req.url.split('/')[4];
            return updateUserStatus(req, res, userId);
        }

        // GET /api/admin/trades
        if (req.method === 'GET' && req.url === '/api/admin/trades') {
            return getAllTrades(req, res);
        }

        // GET /api/admin/transactions
        if (req.method === 'GET' && req.url === '/api/admin/transactions') {
            return getAllTransactions(req, res);
        }

        // GET /api/admin/support-tickets
        if (req.method === 'GET' && req.url === '/api/admin/support-tickets') {
            return getAllSupportTickets(req, res);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Admin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getDashboard(req, res) {
    try {
        // Get total users
        const { count: totalUsers } = await supabase
            .from('users')
            .select('id', { count: 'exact' });

        // Get active users (logged in last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const { count: activeUsers } = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .gte('last_login', sevenDaysAgo.toISOString());

        // Get total volume (sum of all trades)
        const { data: trades } = await supabase
            .from('binary_trades')
            .select('amount');

        const totalVolume = trades ? trades.reduce((sum, t) => sum + (t.amount || 0), 0) : 0;

        // Get pending support tickets
        const { count: pendingTickets } = await supabase
            .from('support_tickets')
            .select('id', { count: 'exact' })
            .eq('status', 'open');

        res.json({
            dashboard: {
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                totalVolume: totalVolume.toFixed(2),
                pendingTickets: pendingTickets || 0,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
}

async function getUsers(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const { data: users, count } = await supabase
            .from('users')
            .select('id, email, username, role, balance, status, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        res.json({ users, total: count, limit, offset });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

async function getUserDetails(req, res, userId) {
    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's trades
        const { data: trades } = await supabase
            .from('binary_trades')
            .select('*')
            .eq('user_id', userId)
            .limit(10);

        // Get user's transactions
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .limit(10);

        res.json({
            user,
            recentTrades: trades || [],
            recentTransactions: transactions || []
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
}

async function updateUserStatus(req, res, userId) {
    try {
        const { status } = req.body;

        if (!['active', 'suspended', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update user status' });
        }

        res.json({ message: 'User status updated', user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllTrades(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const { data: trades, count } = await supabase
            .from('binary_trades')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        res.json({ trades, total: count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
}

async function getAllTransactions(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const { data: transactions, count } = await supabase
            .from('transactions')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        res.json({ transactions, total: count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
}

async function getAllSupportTickets(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const status = req.query.status || 'all';

        let query = supabase
            .from('support_tickets')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: tickets, count } = await query.range(offset, offset + limit - 1);

        res.json({ tickets, total: count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
}
