import express from 'express';
import { getAllPrices, getPrice, getOHLCV, getMarketChart } from '../services/priceService.js';

const router = express.Router();

// Get all prices (no auth required for market data)
router.get('/prices', async (req, res) => {
  try {
    const prices = await getAllPrices();
    res.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Get price for a specific pair
router.get('/price/:pair', async (req, res) => {
  try {
    const pair = req.params.pair.replace('-', '/');
    const price = await getPrice(pair);
    
    if (!price) {
      return res.status(404).json({ error: 'Pair not found' });
    }
    
    res.json({ pair, ...price });
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// Get OHLCV (candlestick) data
router.get('/ohlcv/:pair', async (req, res) => {
  try {
    const pair = req.params.pair.replace('-', '/');
    const days = parseInt(req.query.days) || 1;
    
    const ohlcv = await getOHLCV(pair, days);
    res.json({ pair, data: ohlcv });
  } catch (error) {
    console.error('Error fetching OHLCV:', error);
    res.status(500).json({ error: 'Failed to fetch OHLCV data' });
  }
});

// Get market chart data
router.get('/chart/:pair', async (req, res) => {
  try {
    const pair = req.params.pair.replace('-', '/');
    const days = parseInt(req.query.days) || 1;
    
    const chart = await getMarketChart(pair, days);
    res.json({ pair, ...chart });
  } catch (error) {
    console.error('Error fetching chart:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

export default router;
