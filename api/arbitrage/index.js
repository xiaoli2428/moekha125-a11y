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
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!isAdmin(user)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // POST /api/arbitrage/settings
        if (req.method === 'POST' && req.url === '/api/arbitrage/settings') {
            return createArbitrageSetting(req, res, user);
        }

        // GET /api/arbitrage/settings
        if (req.method === 'GET' && req.url === '/api/arbitrage/settings') {
            return getArbitrageSettings(req, res);
        }

        // PATCH /api/arbitrage/settings/[id]/toggle
        if (req.method === 'PATCH' && req.url.includes('/toggle')) {
            const settingId = req.url.split('/')[4];
            return toggleArbitrage(req, res, settingId);
        }

        // GET /api/arbitrage/trades
        if (req.method === 'GET' && req.url === '/api/arbitrage/trades') {
            return getArbitrageTrades(req, res);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Arbitrage error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function createArbitrageSetting(req, res, user) {
    try {
        const { name, minProfitPercentage, maxTradeAmount, tradingPairs, intervalSeconds } = req.body;

        const { data: setting, error } = await supabase
            .from('ai_arbitrage_settings')
            .insert({
                name,
                is_active: false,
                min_profit_percentage: minProfitPercentage || 0.50,
                max_trade_amount: maxTradeAmount || 1000,
                trading_pairs: tradingPairs || ['ETH/USDT', 'BTC/USDT'],
                interval_seconds: intervalSeconds || 60,
                created_by: user.id
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to create arbitrage setting' });
        }

        res.status(201).json({ message: 'Arbitrage setting created', setting });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getArbitrageSettings(req, res) {
    try {
        const { data: settings, error } = await supabase
            .from('ai_arbitrage_settings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch settings' });
        }

        res.json({ settings, total: settings.length });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function toggleArbitrage(req, res, settingId) {
    try {
        const { data: setting, error } = await supabase
            .from('ai_arbitrage_settings')
            .update({ is_active: !req.body.isActive })
            .eq('id', settingId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to toggle arbitrage' });
        }

        res.json({ message: 'Arbitrage toggled', setting });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getArbitrageTrades(req, res) {
    try {
        const { data: trades, error } = await supabase
            .from('arbitrage_trades')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch trades' });
        }

        res.json({ trades, total: trades.length });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
