// Real-time price service for crypto and forex
// Uses mock data that updates every second to simulate real market prices

class PriceService {
  constructor() {
    this.prices = {};
    this.subscribers = new Set();
    this.updateInterval = null;
    this.initialized = false;
    
    // Popular trading pairs with base prices
    this.basePrices = {
      'BTC/USDT': 98500.00,
      'ETH/USDT': 3650.00,
      'SOL/USDT': 185.50,
      'XRP/USDT': 0.62,
      'BNB/USDT': 615.00,
      'DOGE/USDT': 0.31,
      'ADA/USDT': 0.58,
      'MATIC/USDT': 0.95,
      'DOT/USDT': 7.20,
      'AVAX/USDT': 38.50,
      'LINK/USDT': 15.80,
      'UNI/USDT': 8.90,
      'XAU/USD': 2050.00,  // Gold
    };
    
    // Initialize prices
    Object.keys(this.basePrices).forEach(pair => {
      this.prices[pair] = {
        price: this.basePrices[pair],
        change24h: 0,
        volume24h: 0,
        high24h: this.basePrices[pair] * 1.05,
        low24h: this.basePrices[pair] * 0.95,
        lastUpdate: Date.now()
      };
    });
  }

  // Start real-time updates
  start() {
    if (this.initialized) return;
    this.initialized = true;
    
    // Update prices every second
    this.updateInterval = setInterval(() => {
      this.updatePrices();
      this.notifySubscribers();
    }, 1000);
  }

  // Stop updates
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.initialized = false;
  }

  // Update all prices with realistic fluctuations
  updatePrices() {
    Object.keys(this.prices).forEach(pair => {
      const current = this.prices[pair];
      const base = this.basePrices[pair];
      
      // Random price change: ±0.1% with occasional ±0.5% spikes
      const changePercent = Math.random() > 0.9 
        ? (Math.random() - 0.5) * 0.01  // ±0.5% spike
        : (Math.random() - 0.5) * 0.002; // ±0.1% normal
      
      const newPrice = current.price * (1 + changePercent);
      
      // Keep price within reasonable bounds (±5% from base)
      const boundedPrice = Math.max(
        base * 0.95,
        Math.min(base * 1.05, newPrice)
      );
      
      // Update 24h stats
      const priceChange = boundedPrice - base;
      const change24hPercent = (priceChange / base) * 100;
      
      this.prices[pair] = {
        price: boundedPrice,
        change24h: change24hPercent,
        volume24h: current.volume24h + Math.random() * 1000000,
        high24h: Math.max(current.high24h, boundedPrice),
        low24h: Math.min(current.low24h, boundedPrice),
        lastUpdate: Date.now()
      };
    });
  }

  // Subscribe to price updates
  subscribe(callback) {
    this.subscribers.add(callback);
    // Send initial data
    callback(this.prices);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notify all subscribers
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback(this.prices);
    });
  }

  // Get current prices
  getPrices() {
    return { ...this.prices };
  }

  // Get price for specific pair
  getPrice(pair) {
    return this.prices[pair] || null;
  }

  // Get all available pairs
  getPairs() {
    return Object.keys(this.prices);
  }

  // Get historical candle data for charts (mock data)
  getCandleData(pair, interval = '1m', limit = 100) {
    const currentPrice = this.prices[pair]?.price || this.basePrices[pair] || 100;
    const candles = [];
    let timestamp = Date.now() - (limit * 60 * 1000);
    let lastClose = currentPrice * 0.98; // Start slightly below current
    
    for (let i = 0; i < limit; i++) {
      const volatility = 0.002; // 0.2% per candle
      const change = (Math.random() - 0.5) * volatility;
      
      const open = lastClose;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * volatility);
      const low = Math.min(open, close) * (1 - Math.random() * volatility);
      const volume = Math.random() * 1000000;
      
      candles.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });
      
      lastClose = close;
      timestamp += 60 * 1000; // 1 minute
    }
    
    return candles;
  }
}

// Singleton instance
const priceService = new PriceService();

// Auto-start on import
if (typeof window !== 'undefined') {
  priceService.start();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    priceService.stop();
  });
}

export default priceService;
