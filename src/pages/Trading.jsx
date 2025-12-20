import { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';
import priceService from '../services/priceService';
import demoAccountService from '../services/demoAccountService';
import TradingChart from '../components/TradingChart';

export default function Trading() {
  const [accountMode, setAccountMode] = useState('demo');
  const [prices, setPrices] = useState({});
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [tradeType, setTradeType] = useState('binary');
  const [direction, setDirection] = useState('up');
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState([]);
  const [demoStats, setDemoStats] = useState(null);
  const [notification, setNotification] = useState(null);

  const tradingPairs = [
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT',
    'BNB/USDT', 'DOGE/USDT', 'ADA/USDT', 'XAU/USD'
  ];

  useEffect(() => {
    const unsubscribe = priceService.subscribe((newPrices) => {
      setPrices(newPrices);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setAccountMode(demoAccountService.getAccountMode());
    updateDemoStats();
  }, []);

  const updateDemoStats = () => {
    setDemoStats(demoAccountService.getStatistics());
  };

  const currentPrice = prices[selectedPair]?.price || 0;

  const toggleAccountMode = () => {
    const newMode = demoAccountService.toggleAccountMode();
    setAccountMode(newMode);
    updateDemoStats();
    showNotification(`Switched to ${newMode === 'demo' ? 'Demo' : 'Real'} account`, 'info');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePlaceTrade = async () => {
    if (amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);

    try {
      if (accountMode === 'demo') {
        await simulateDemoTrade();
      } else {
        await tradingAPI.placeTrade({
          pair: selectedPair,
          type: tradeType,
          direction,
          amount,
          duration,
          entryPrice: currentPrice
        });
        showNotification('Trade placed successfully!', 'success');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to place trade', 'error');
    } finally {
      setLoading(false);
    }
  };

  const simulateDemoTrade = async () => {
    const currentBalance = demoAccountService.getDemoBalance();
    
    if (amount > currentBalance) {
      showNotification('Insufficient demo balance', 'error');
      return;
    }

    const entryPrice = currentPrice;
    const tradeId = Date.now();
    
    const newTrade = {
      id: tradeId,
      pair: selectedPair,
      type: tradeType,
      direction,
      amount,
      duration,
      entryPrice,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    setTrades(prev => [newTrade, ...prev]);
    showNotification(`Trade placed! ${direction === 'up' ? '📈' : '📉'} ${selectedPair}`, 'info');

    setTimeout(() => {
      const result = demoAccountService.simulateDemoTrade(amount, direction, selectedPair, duration);
      
      setTrades(prev => prev.map(t => 
        t.id === tradeId 
          ? { ...t, status: result.isWin ? 'win' : 'loss', exitPrice: currentPrice, profit: result.profit }
          : t
      ));

      demoAccountService.recordTrade(amount, result.isWin, result.isWin ? result.payout : 0);
      updateDemoStats();

      showNotification(result.message, result.isWin ? 'success' : 'error');
    }, duration * 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-down ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="bg-black/50 border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Trading</h1>
            <p className="text-sm text-gray-400">
              {tradeType === 'binary' ? 'Binary Options' : 'Spot Trading'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {accountMode === 'demo' && demoStats && (
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-400">Demo Balance</div>
                <div className="text-lg font-bold text-green-400">
                  ${demoStats.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            )}
            
            <button
              onClick={toggleAccountMode}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                accountMode === 'demo'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'bg-green-500/20 text-green-300 border border-green-500/50'
              }`}
            >
              <span className="text-xl">{accountMode === 'demo' ? '🎮' : '💰'}</span>
              <span className="hidden md:inline">{accountMode === 'demo' ? 'Demo Account' : 'Real Account'}</span>
              <span className="md:hidden">{accountMode === 'demo' ? 'Demo' : 'Real'}</span>
              <span className="text-xs opacity-70">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 md:gap-3 pb-2 min-w-max">
            {tradingPairs.map((pair) => {
              const priceData = prices[pair];
              const isSelected = selectedPair === pair;
              const isPositive = priceData?.change24h >= 0;
              
              return (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`flex-shrink-0 px-3 md:px-4 py-2 md:py-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-sm md:text-base">
                    {pair.includes('XAU') ? '🥇 ' : ''}{pair.split('/')[0]}
                  </div>
                  {priceData ? (
                    <>
                      <div className="font-mono text-xs md:text-sm">
                        ${priceData.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: pair.includes('BTC') ? 0 : 2
                        })}
                      </div>
                      <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '↗' : '↘'} {Math.abs(priceData.change24h).toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500">Loading...</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTradeType('binary')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  tradeType === 'binary'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                Binary Options
              </button>
              <button
                onClick={() => setTradeType('normal')}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  tradeType === 'normal'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                Spot Trading
              </button>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{selectedPair}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="text-2xl md:text-3xl font-mono font-bold">
                      ${currentPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: selectedPair.includes('BTC') ? 0 : 2
                      })}
                    </div>
                    {prices[selectedPair] && (
                      <div className={`text-sm ${prices[selectedPair].change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {prices[selectedPair].change24h >= 0 ? '▲' : '▼'} {Math.abs(prices[selectedPair].change24h).toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  <div>Updates every 1s</div>
                  <div className="text-green-400">● Live</div>
                </div>
              </div>
              
              <TradingChart 
                pair={selectedPair} 
                prices={prices}
                height={window.innerWidth < 768 ? 300 : 400}
              />
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-4 lg:block hidden">
              <h3 className="font-bold mb-3">Recent Trades</h3>
              {trades.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No trades yet. Place your first trade!
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {trades.slice(0, 10).map(trade => (
                    <div
                      key={trade.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        trade.status === 'win' ? 'bg-green-500/10 border-green-500/30' :
                        trade.status === 'loss' ? 'bg-red-500/10 border-red-500/30' :
                        'bg-white/5 border-white/10'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">
                          {trade.direction === 'up' ? '📈' : '📉'} {trade.pair}
                        </div>
                        <div className="text-xs text-gray-400">
                          ${trade.amount} • {trade.duration}s
                        </div>
                      </div>
                      <div className="text-right">
                        {trade.status === 'pending' ? (
                          <div className="text-yellow-400 text-sm">Pending...</div>
                        ) : (
                          <div className={`font-bold ${trade.status === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {accountMode === 'demo' && demoStats && (
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">Demo Account</h3>
                  <button
                    onClick={() => {
                      demoAccountService.resetDemoAccount();
                      updateDemoStats();
                      showNotification('Demo account reset!', 'info');
                    }}
                    className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition"
                  >
                    Reset
                  </button>
                </div>
                <div className="text-3xl font-bold mb-2">
                  ${demoStats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Win Rate</div>
                    <div className="text-green-400 font-semibold">{demoStats.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Total Trades</div>
                    <div className="font-semibold">{demoStats.totalTrades}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
              <h3 className="font-bold mb-4">Place Trade</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDirection('up')}
                    className={`py-3 rounded-lg font-semibold transition ${
                      direction === 'up'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    📈 UP / Call
                  </button>
                  <button
                    onClick={() => setDirection('down')}
                    className={`py-3 rounded-lg font-semibold transition ${
                      direction === 'down'
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    📉 DOWN / Put
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  min="1"
                  step="1"
                />
                <div className="flex gap-2 mt-2">
                  {[10, 50, 100, 500].map(val => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className="flex-1 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition"
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              {tradeType === 'binary' && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                    min="30"
                    step="30"
                  />
                  <div className="flex gap-2 mt-2">
                    {[30, 60, 120, 300].map(val => (
                      <button
                        key={val}
                        onClick={() => setDuration(val)}
                        className="flex-1 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition"
                      >
                        {val}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Entry Price:</span>
                  <span className="font-mono">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Potential Profit:</span>
                  <span className="text-green-400 font-semibold">+${(amount * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk:</span>
                  <span className="text-red-400 font-semibold">-${amount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceTrade}
                disabled={loading}
                className={`w-full py-4 rounded-lg font-bold text-lg transition ${
                  direction === 'up'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90'
                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Placing...' : `${direction === 'up' ? 'BUY UP' : 'BUY DOWN'}`}
              </button>

              {accountMode === 'demo' && (
                <div className="text-center text-xs text-blue-400 mt-2">
                  🎮 Demo mode: Trades auto-win 85% of the time
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-4 lg:hidden">
          <h3 className="font-bold mb-3">Recent Trades</h3>
          {trades.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No trades yet. Place your first trade!
            </div>
          ) : (
            <div className="space-y-2">
              {trades.slice(0, 5).map(trade => (
                <div
                  key={trade.id}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                    trade.status === 'win' ? 'bg-green-500/10 border-green-500/30' :
                    trade.status === 'loss' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-white/5 border-white/10'
                  }`}
                >
                  <div>
                    <div className="font-semibold">
                      {trade.direction === 'up' ? '📈' : '📉'} {trade.pair}
                    </div>
                    <div className="text-xs text-gray-400">
                      ${trade.amount} • {trade.duration}s
                    </div>
                  </div>
                  <div className="text-right">
                    {trade.status === 'pending' ? (
                      <div className="text-yellow-400 text-sm">Pending...</div>
                    ) : (
                      <div className={`font-bold ${trade.status === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
