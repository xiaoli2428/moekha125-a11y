import { handleCors, setCorsHeaders, authenticate, isAdmin } from '../../lib/auth.js';
import supabase from '../../lib/supabase.js';

const FALLBACK_PRICES = {
    'BTC/USDT': 43500,
    'ETH/USDT': 2300,
    'BNB/USDT': 320,
    'SOL/USDT': 98
};

export default async function handler(req, res) {
    handleCors(req, res);
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // All trading routes require authentication
        const user = await authenticate(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Route: POST /api/trading/place
        if (req.method === 'POST' && req.url === '/api/trading/place') {
            return placeTrade(req, res, user);
        }

        // Route: GET /api/trading
        if (req.method === 'GET' && req.url === '/api/trading') {
            return getTrades(req, res, user);
        }

        // Route: GET /api/trading/[id]
        if (req.method === 'GET' && req.url.match(/^\/api\/trading\/[^/]+$/)) {
            const tradeId = req.url.split('/').pop();
            return getTradeById(req, res, user, tradeId);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Trading error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function placeTrade(req, res, user) {
    try {
        const { pair, direction, amount, duration } = req.body;
        const userId = user.id;

        if (!pair || !direction || !amount || !duration) {
            return res.status(400).json({ error: 'Missing required fields: pair, direction, amount, duration' });
        }

        if (!['up', 'down'].includes(direction)) {
            return res.status(400).json({ error: 'Direction must be "up" or "down"' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        if (duration < 60 || duration > 3600) {
            return res.status(400).json({ error: 'Duration must be between 60 and 3600 seconds' });
        }

        // Check user balance
        const { data: userBalance, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

        if (userError || !userBalance) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (parseFloat(userBalance.balance) < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Deduct amount from balance
        const newBalance = parseFloat(userBalance.balance) - parseFloat(amount);
        await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', userId);

        // Get entry price (fallback to default)
        const entryPrice = FALLBACK_PRICES[pair] || 100;
        const expiresAt = new Date(Date.now() + duration * 1000);

        // Create trade
        const { data: trade, error: tradeError } = await supabase
            .from('binary_trades')
            .insert({
                user_id: userId,
                pair,
                direction,
                amount: parseFloat(amount),
                entry_price: entryPrice,
                duration,
                payout_percentage: 85.00,
                result: 'pending',
                expires_at: expiresAt
            })
            .select()
            .single();

        if (tradeError) {
            console.error('Trade creation error:', tradeError);
            return res.status(500).json({ error: 'Failed to create trade' });
        }

        res.status(201).json({
            message: 'Trade placed successfully',
            trade,
            newBalance
        });
    } catch (error) {
        console.error('Place trade error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTrades(req, res, user) {
    try {
        const userId = user.id;
        const status = req.query.status || 'all';

        let query = supabase
            .from('binary_trades')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (status !== 'all') {
            query = query.eq('result', status);
        }

        const { data: trades, error } = await query;

        if (error) {
            console.error('Get trades error:', error);
            return res.status(500).json({ error: 'Failed to fetch trades' });
        }

        res.json({ trades, total: trades.length });
    } catch (error) {
        console.error('Get trades error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTradeById(req, res, user, tradeId) {
    try {
        const { data: trade, error } = await supabase
            .from('binary_trades')
            .select('*')
            .eq('id', tradeId)
            .eq('user_id', user.id)
            .single();

        if (error || !trade) {
            return res.status(404).json({ error: 'Trade not found' });
        }

        res.json({ trade });
    } catch (error) {
        console.error('Get trade error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
