import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import priceService from '../services/priceService';
import demoAccountService from '../services/demoAccountService';

// Coin data with icons
const COINS = [
  { id: 'BTC/USDT', name: 'Bitcoin', symbol: 'BTC', color: '#F7931A' },
  { id: 'ETH/USDT', name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
  { id: 'SOL/USDT', name: 'Solana', symbol: 'SOL', color: '#00FFA3' },
  { id: 'XRP/USDT', name: 'Ripple', symbol: 'XRP', color: '#23292F' },
  { id: 'BNB/USDT', name: 'BNB', symbol: 'BNB', color: '#F3BA2F' },
  { id: 'DOGE/USDT', name: 'Dogecoin', symbol: 'DOGE', color: '#C3A634' },
  { id: 'ADA/USDT', name: 'Cardano', symbol: 'ADA', color: '#0033AD' },
  { id: 'XAU/USD', name: 'Gold', symbol: 'XAU', color: '#FFD700' },
];

export default function Market() {
  const [prices, setPrices] = useState({});
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [tradeMode, setTradeMode] = useState('buy');
  const [amount, setAmount] = useState('');
  const [accountMode, setAccountMode] = useState('demo');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = priceService.subscribe((newPrices) => {
      setPrices(newPrices);
    });
    setAccountMode(demoAccountService.getAccountMode());
    return () => unsubscribe();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTrade = async () => {
    if (!selectedCoin || !amount || parseFloat(amount) <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);
    
    // Simulate trade execution
    setTimeout(() => {
      if (accountMode === 'demo') {
        const balance = demoAccountService.getDemoBalance();
        const tradeAmount = parseFloat(amount);
        
        if (tradeMode === 'buy') {
          demoAccountService.updateDemoBalance(-tradeAmount);
          showNotification(`Bought ${amount} USDT worth of ${selectedCoin.symbol}`, 'success');
        } else {
          demoAccountService.updateDemoBalance(tradeAmount * 0.99); // 1% fee
          showNotification(`Sold ${amount} USDT worth of ${selectedCoin.symbol}`, 'success');
        }
      } else {
        showNotification(`${tradeMode === 'buy' ? 'Buy' : 'Sell'} order placed for ${selectedCoin.symbol}`, 'success');
      }
      
      setAmount('');
      setSelectedCoin(null);
      setLoading(false);
    }, 1000);
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const formatChange = (change) => {
    if (!change) return '+0.00%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Market</h1>
            <p className="text-sm text-gray-400">Live Prices & Normal Trade</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            accountMode === 'demo' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {accountMode === 'demo' ? 'Demo' : 'Real'}
          </div>
        </div>
      </div>

      {/* Coin List */}
      <div className="p-4">
        <div className="space-y-3">
          {COINS.map((coin) => {
            const priceData = prices[coin.id] || {};
            const price = priceData.price || 0;
            const change = priceData.change24h || 0;
            const isUp = change >= 0;

            return (
              <div
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                className={`bg-white/5 rounded-xl p-4 border transition-all cursor-pointer ${
                  selectedCoin?.id === coin.id 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Coin Icon */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: coin.color }}
                    >
                      {coin.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold">{coin.symbol}</div>
                      <div className="text-sm text-gray-400">{coin.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">${formatPrice(price)}</div>
                    <div className={`text-sm ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                      {formatChange(change)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade Modal */}
      {selectedCoin && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
          <div className="bg-gray-800 w-full max-w-lg rounded-t-3xl p-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedCoin.color }}
                >
                  {selectedCoin.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedCoin.symbol}</div>
                  <div className="text-gray-400">{selectedCoin.name}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCoin(null)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Price Display */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  ${formatPrice(prices[selectedCoin.id]?.price || 0)}
                </div>
                <div className={`text-sm ${(prices[selectedCoin.id]?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatChange(prices[selectedCoin.id]?.change24h || 0)} (24h)
                </div>
              </div>
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setTradeMode('buy')}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  tradeMode === 'buy' 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeMode('sell')}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  tradeMode === 'sell' 
                    ? 'bg-red-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Amount (USDT)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 text-lg"
              />
              {accountMode === 'demo' && (
                <div className="text-xs text-gray-500 mt-2">
                  Demo Balance: ${demoAccountService.getDemoBalance().toFixed(2)}
                </div>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mb-6">
              {[10, 50, 100, 500].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                >
                  ${val}
                </button>
              ))}
            </div>

            {/* Trade Button */}
            <button
              onClick={handleTrade}
              disabled={loading || !amount}
              className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                tradeMode === 'buy'
                  ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-500/50'
                  : 'bg-red-500 hover:bg-red-600 disabled:bg-red-500/50'
              }`}
            >
              {loading ? 'Processing...' : `${tradeMode === 'buy' ? 'Buy' : 'Sell'} ${selectedCoin.symbol}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
