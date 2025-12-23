import { handleCors, setCorsHeaders } from '../../lib/auth.js';

// Fallback prices for market data
const FALLBACK_PRICES = {
    'BTC/USDT': { price: 43500, change_24h: 2.5, volume_24h: 25000000000 },
    'ETH/USDT': { price: 2300, change_24h: 1.8, volume_24h: 12000000000 },
    'BNB/USDT': { price: 320, change_24h: 0.5, volume_24h: 2000000000 },
    'SOL/USDT': { price: 98, change_24h: 3.2, volume_24h: 1500000000 }
};

export default async function handler(req, res) {
    handleCors(req, res);
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET /api/market/prices
        if (req.method === 'GET' && req.url === '/api/market/prices') {
            return getAllPrices(req, res);
        }

        // GET /api/market/price/:pair
        if (req.method === 'GET' && req.url.includes('/api/market/price/')) {
            const pair = req.url.split('/').pop().replace('-', '/');
            return getPrice(req, res, pair);
        }

        // GET /api/market/ohlcv/:pair
        if (req.method === 'GET' && req.url.includes('/api/market/ohlcv/')) {
            const pair = req.url.split('/').pop().replace('-', '/');
            return getOHLCV(req, res, pair);
        }

        // GET /api/market/chart/:pair
        if (req.method === 'GET' && req.url.includes('/api/market/chart/')) {
            const pair = req.url.split('/').pop().replace('-', '/');
            return getMarketChart(req, res, pair);
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('Market error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

function getAllPrices(req, res) {
    try {
        res.json(FALLBACK_PRICES);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
}

function getPrice(req, res, pair) {
    try {
        const price = FALLBACK_PRICES[pair];

        if (!price) {
            return res.status(404).json({ error: 'Pair not found' });
        }

        res.json({ pair, ...price });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price' });
    }
}

function getOHLCV(req, res, pair) {
    try {
        const price = FALLBACK_PRICES[pair] || FALLBACK_PRICES['BTC/USDT'];

        // Mock OHLCV data
        const ohlcv = {
            pair,
            open: price.price * 0.98,
            high: price.price * 1.05,
            low: price.price * 0.95,
            close: price.price,
            volume: price.volume_24h
        };

        res.json(ohlcv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch OHLCV' });
    }
}

function getMarketChart(req, res, pair) {
    try {
        const price = FALLBACK_PRICES[pair] || FALLBACK_PRICES['BTC/USDT'];

        // Mock chart data (24 hourly data points)
        const chartData = [];
        for (let i = 24; i > 0; i--) {
            const variance = (Math.random() - 0.5) * price.price * 0.02;
            chartData.push({
                timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
                price: price.price + variance
            });
        }

        res.json({ pair, data: chartData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chart' });
    }
}
