import { handleCors, setCorsHeaders, authenticate, isAdmin } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

export default async function handler(req, res) {
    handleCors(req, res);
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Public routes (no auth required)
        // GET /api/coins
        if (req.method === 'GET' && req.url === '/api/coins') {
            return getSupportedCoins(req, res);
        }

        const user = await authenticate(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // GET /api/coins/deposit-addresses
        if (req.method === 'GET' && req.url === '/api/coins/deposit-addresses') {
            return getDepositAddresses(req, res, user);
        }

        // Admin routes
        if (!isAdmin(user)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // GET /api/coins/admin/all
        if (req.method === 'GET' && req.url === '/api/coins/admin/all') {
            return getAllCoins(req, res);
        }

        // POST /api/coins/admin
        if (req.method === 'POST' && req.url === '/api/coins/admin') {
            return createCoin(req, res);
        }

        // PATCH /api/coins/admin/[id]
        if (req.method === 'PATCH' && req.url.match(/^\/api\/coins\/admin\/[^/]+$/)) {
            const coinId = req.url.split('/').pop();
            return updateCoin(req, res, coinId);
        }

        // DELETE /api/coins/admin/[id]
        if (req.method === 'DELETE' && req.url.match(/^\/api\/coins\/admin\/[^/]+$/)) {
            const coinId = req.url.split('/').pop();
            return deleteCoin(req, res, coinId);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Coins error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getSupportedCoins(req, res) {
    try {
        const { data: coins, error } = await supabase
            .from('coins')
            .select('*')
            .eq('is_active', true);

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch coins' });
        }

        res.json({ coins });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getDepositAddresses(req, res, user) {
    try {
        const { data: addresses, error } = await supabase
            .from('deposit_addresses')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch deposit addresses' });
        }

        res.json({ addresses });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllCoins(req, res) {
    try {
        const { data: coins, error } = await supabase
            .from('coins')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch coins' });
        }

        res.json({ coins });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function createCoin(req, res) {
    try {
        const { name, symbol, is_active } = req.body;

        const { data: coin, error } = await supabase
            .from('coins')
            .insert({ name, symbol, is_active })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to create coin' });
        }

        res.status(201).json({ message: 'Coin created', coin });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateCoin(req, res, coinId) {
    try {
        const { data: coin, error } = await supabase
            .from('coins')
            .update(req.body)
            .eq('id', coinId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update coin' });
        }

        res.json({ message: 'Coin updated', coin });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteCoin(req, res, coinId) {
    try {
        const { error } = await supabase
            .from('coins')
            .delete()
            .eq('id', coinId);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete coin' });
        }

        res.json({ message: 'Coin deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
