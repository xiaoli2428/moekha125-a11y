import { useState, useEffect, useRef } from 'react';
import priceService from '../services/priceService';
import demoAccountService from '../services/demoAccountService';

const PAIRS = [
  { id: 'BTC/USDT', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ETH/USDT', name: 'Ethereum', symbol: 'ETH' },
  { id: 'SOL/USDT', name: 'Solana', symbol: 'SOL' },
  { id: 'XRP/USDT', name: 'Ripple', symbol: 'XRP' },
  { id: 'BNB/USDT', name: 'BNB', symbol: 'BNB' },
  { id: 'DOGE/USDT', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'ADA/USDT', name: 'Cardano', symbol: 'ADA' },
  { id: 'XAU/USD', name: 'Gold', symbol: 'XAU' },
];

const DURATIONS = [
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 180, label: '3m' },
  { value: 300, label: '5m' },
];

export default function BinaryTrading() {
  const [prices, setPrices] = useState({});
  const [selectedPair, setSelectedPair] = useState(PAIRS[0]);
  const [direction, setDirection] = useState('up');
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState(60);
  const [accountMode, setAccountMode] = useState('demo');
  const [activeTrade, setActiveTrade] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [trades, setTrades] = useState([]);
  const [notification, setNotification] = useState(null);
  const [chartData, setChartData] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const unsubscribe = priceService.subscribe((newPrices) => {
      setPrices(newPrices);
      updateChart(newPrices[selectedPair.id]?.price || 0);
    });
    setAccountMode(demoAccountService.getAccountMode());
    return () => unsubscribe();
  }, [selectedPair]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const updateChart = (price) => {
    setChartData((prev) => {
      const newData = [...prev, { time: Date.now(), price }];
      return newData.slice(-60); // Keep last 60 data points
    });
  };

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current || chartData.length < 2) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const prices = chartData.map(d => d.price);
    const min = Math.min(...prices) * 0.999;
    const max = Math.max(...prices) * 1.001;
    const range = max - min || 1;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = prices[prices.length - 1] >= prices[0] ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    chartData.forEach((point, i) => {
      const x = (i / (chartData.length - 1)) * width;
      const y = height - ((point.price - min) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, prices[prices.length - 1] >= prices[0] ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw entry line if there's an active trade
    if (activeTrade) {
      const entryY = height - ((activeTrade.entryPrice - min) / range) * height;
      ctx.strokeStyle = '#fff';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, entryY);
      ctx.lineTo(width, entryY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [chartData, activeTrade]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePlaceTrade = () => {
    if (activeTrade) {
      showNotification('Wait for current trade to complete', 'error');
      return;
    }

    const balance = demoAccountService.getDemoBalance();
    if (accountMode === 'demo' && amount > balance) {
      showNotification('Insufficient demo balance', 'error');
      return;
    }

    const entryPrice = prices[selectedPair.id]?.price || 0;
    const tradeId = Date.now();

    const trade = {
      id: tradeId,
      pair: selectedPair.id,
      direction,
      amount,
      duration,
      entryPrice,
      startTime: Date.now(),
    };

    setActiveTrade(trade);
    setCountdown(duration);
    showNotification(`Trade placed! ${direction === 'up' ? '📈' : '📉'} ${selectedPair.symbol}`, 'info');

    // Resolve trade after duration
    setTimeout(() => {
      const currentPrice = priceService.getCurrentPrice(selectedPair.id);
      const isWin = accountMode === 'demo' 
        ? demoAccountService.shouldAutoWin()
        : (direction === 'up' ? currentPrice > entryPrice : currentPrice < entryPrice);
      
      const payout = isWin ? demoAccountService.calculatePayout(amount) : 0;
      
      if (accountMode === 'demo') {
        if (isWin) {
          demoAccountService.updateDemoBalance(payout - amount);
        } else {
          demoAccountService.updateDemoBalance(-amount);
        }
        demoAccountService.recordTrade(amount, isWin, payout);
      }

      const completedTrade = {
        ...trade,
        exitPrice: currentPrice,
        isWin,
        payout,
        status: isWin ? 'win' : 'loss'
      };

      setTrades(prev => [completedTrade, ...prev.slice(0, 9)]);
      setActiveTrade(null);
      setCountdown(0);
      
      showNotification(
        isWin ? `🎉 Won! +$${(payout - amount).toFixed(2)}` : `❌ Lost -$${amount.toFixed(2)}`,
        isWin ? 'success' : 'error'
      );
    }, duration * 1000);
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const currentPrice = prices[selectedPair.id]?.price || 0;
  const priceChange = prices[selectedPair.id]?.change24h || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-center ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-black/50 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Binary Options</h1>
            <p className="text-sm text-gray-400">Predict price direction</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            accountMode === 'demo' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {accountMode === 'demo' ? `Demo: $${demoAccountService.getDemoBalance().toFixed(0)}` : 'Real'}
          </div>
        </div>
      </div>

      {/* Pair Selection */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2">
          {PAIRS.map((pair) => (
            <button
              key={pair.id}
              onClick={() => setSelectedPair(pair)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedPair.id === pair.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {pair.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Price Display */}
      <div className="px-4 pb-2">
        <div className="text-center">
          <div className="text-3xl font-bold">${formatPrice(currentPrice)}</div>
          <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pb-4">
        <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
          <canvas
            ref={canvasRef}
            width={window.innerWidth - 32}
            height={180}
            className="w-full"
          />
        </div>
      </div>

      {/* Active Trade Overlay */}
      {activeTrade && (
        <div className="mx-4 mb-4 p-4 bg-purple-500/20 border border-purple-500/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                activeTrade.direction === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {activeTrade.direction === 'up' ? '📈' : '📉'}
              </div>
              <div>
                <div className="font-semibold">{activeTrade.pair}</div>
                <div className="text-sm text-gray-400">${activeTrade.amount} • Entry: ${formatPrice(activeTrade.entryPrice)}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{countdown}s</div>
              <div className="text-xs text-gray-400">remaining</div>
            </div>
          </div>
        </div>
      )}

      {/* Trade Form */}
      <div className="px-4 space-y-4">
        {/* Duration */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Duration</label>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                disabled={!!activeTrade}
                className={`flex-1 py-3 rounded-lg font-medium transition ${
                  duration === d.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                } disabled:opacity-50`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Amount (USDT)</label>
          <div className="flex gap-2">
            {[10, 50, 100, 500].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                disabled={!!activeTrade}
                className={`flex-1 py-3 rounded-lg font-medium transition ${
                  amount === val
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                } disabled:opacity-50`}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        {/* Direction Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => { setDirection('up'); handlePlaceTrade(); }}
            disabled={!!activeTrade}
            className="py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            UP
          </button>
          <button
            onClick={() => { setDirection('down'); handlePlaceTrade(); }}
            disabled={!!activeTrade}
            className="py-4 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            DOWN
          </button>
        </div>

        {/* Payout Info */}
        <div className="text-center text-sm text-gray-400 pb-4">
          Potential Payout: <span className="text-green-400 font-semibold">${(amount * 0.85).toFixed(2)}</span>
          <span className="text-gray-500"> (85% return)</span>
        </div>
      </div>

      {/* Recent Trades */}
      {trades.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Trades</h3>
          <div className="space-y-2">
            {trades.slice(0, 5).map((trade) => (
              <div 
                key={trade.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  trade.isWin ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{trade.direction === 'up' ? '📈' : '📉'}</span>
                  <div>
                    <div className="font-medium">{trade.pair}</div>
                    <div className="text-xs text-gray-400">${trade.amount}</div>
                  </div>
                </div>
                <div className={`font-bold ${trade.isWin ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.isWin ? '+' : '-'}${trade.isWin ? (trade.payout - trade.amount).toFixed(2) : trade.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
