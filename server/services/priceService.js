// Real-time price service using CoinGecko API (free, no API key required)
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Map trading pairs to CoinGecko IDs
const COIN_IDS = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'BNB': 'binancecoin',
  'DOGE': 'dogecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'MATIC': 'matic-network',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'TRX': 'tron'
};

// Cache for prices (to avoid rate limiting)
let priceCache = {};
let lastPriceFetch = 0;
const CACHE_DURATION = 10000; // 10 seconds

// Get current prices for all coins
export const getAllPrices = async () => {
  const now = Date.now();
  
  // Return cached prices if still valid
  if (now - lastPriceFetch < CACHE_DURATION && Object.keys(priceCache).length > 0) {
    return priceCache;
  }

  try {
    const coinIds = Object.values(COIN_IDS).join(',');
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const data = await response.json();
    
    // Transform to our format
    const prices = {};
    for (const [symbol, coinId] of Object.entries(COIN_IDS)) {
      if (data[coinId]) {
        prices[`${symbol}/USDT`] = {
          price: data[coinId].usd,
          change24h: data[coinId].usd_24h_change || 0,
          volume24h: data[coinId].usd_24h_vol || 0
        };
      }
    }

    priceCache = prices;
    lastPriceFetch = now;
    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Return cached prices or fallback
    return priceCache;
  }
};

// Get price for a specific pair
export const getPrice = async (pair) => {
  const prices = await getAllPrices();
  return prices[pair] || null;
};

// Get OHLCV (candlestick) data for a pair
export const getOHLCV = async (pair, days = 1) => {
  const symbol = pair.split('/')[0];
  const coinId = COIN_IDS[symbol];
  
  if (!coinId) {
    throw new Error(`Unknown coin: ${symbol}`);
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch OHLCV data');
    }

    const data = await response.json();
    
    // CoinGecko returns [timestamp, open, high, low, close]
    return data.map(candle => ({
      time: Math.floor(candle[0] / 1000), // Convert to seconds
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4]
    }));
  } catch (error) {
    console.error('Error fetching OHLCV:', error);
    throw error;
  }
};

// Get market chart data (for line charts)
export const getMarketChart = async (pair, days = 1) => {
  const symbol = pair.split('/')[0];
  const coinId = COIN_IDS[symbol];
  
  if (!coinId) {
    throw new Error(`Unknown coin: ${symbol}`);
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch market chart');
    }

    const data = await response.json();
    
    return {
      prices: data.prices.map(p => ({ time: Math.floor(p[0] / 1000), value: p[1] })),
      volumes: data.total_volumes.map(v => ({ time: Math.floor(v[0] / 1000), value: v[1] }))
    };
  } catch (error) {
    console.error('Error fetching market chart:', error);
    throw error;
  }
};

export default {
  getAllPrices,
  getPrice,
  getOHLCV,
  getMarketChart,
  COIN_IDS
};
