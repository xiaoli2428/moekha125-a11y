import { useState, useEffect } from 'react';
import { tradingAPI, marketAPI } from '../services/api';
import TradingChart from '../components/TradingChart';

export default function Trading() {
  const [trades, setTrades] = useState([]);
  const [prices, setPrices] = useState({});
  const [form, setForm] = useState({
    pair: 'BTC/USDT',
    direction: 'up',
    amount: '10',
    duration: 60,
  });
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(true);

  // Available trading pairs
  const tradingPairs = [
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT',
    'DOGE/USDT', 'XRP/USDT', 'ADA/USDT', 'MATIC/USDT',
    'DOT/USDT', 'AVAX/USDT', 'LINK/USDT', 'UNI/USDT'
  ];

  useEffect(() => {
    loadTrades();
    loadPrices();
    const tradeInterval = setInterval(loadTrades, 5000);
    const priceInterval = setInterval(loadPrices, 10000);
    return () => {
      clearInterval(tradeInterval);
      clearInterval(priceInterval);
    };
  }, []);

  const loadTrades = async () => {
    try {
      const data = await tradingAPI.getTrades();
      setTrades(data);
    } catch (error) {
      console.error('Failed to load trades:', error);
    }
  };

  const loadPrices = async () => {
    try {
      const data = await marketAPI.getAllPrices();
      setPrices(data);
      setPriceLoading(false);
    } catch (error) {
      console.error('Failed to load prices:', error);
      setPriceLoading(false);
    }
  };

  const currentPrice = prices[form.pair];

  const handleTrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tradingAPI.placeTrade({
        ...form,
        amount: parseFloat(form.amount),
      });
      alert('Trade placed successfully!');
      setForm({ ...form, amount: '10' });
      loadTrades();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to place trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Binary Options Trading</h1>

        {/* Market Overview */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {tradingPairs.slice(0, 8).map((pair) => {
              const priceData = prices[pair];
              return (
                <button
                  key={pair}
                  onClick={() => setForm({ ...form, pair })}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border transition ${
                    form.pair === pair
                      ? 'bg-purple-600/30 border-purple-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold">{pair.split('/')[0]}</div>
                  {priceData ? (
                    <>
                      <div className="font-mono text-sm">
                        ${priceData.price?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                      <div className={`text-xs ${priceData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h?.toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm">Loading...</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <TradingChart pair={form.pair} />
          </div>

          {/* Trading Form */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">Place Trade</h2>
              
              {/* Current Price Display */}
              {currentPrice && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="text-2xl font-bold font-mono">
                    ${currentPrice.price?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className={`text-sm ${currentPrice.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    24h: {currentPrice.change24h >= 0 ? '+' : ''}{currentPrice.change24h?.toFixed(2)}%
                  </div>
                </div>
              )}

              <form onSubmit={handleTrade} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Trading Pair</label>
                  <select
                    value={form.pair}
                    onChange={(e) => setForm({ ...form, pair: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {tradingPairs.map((pair) => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Direction</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, direction: 'up' })}
                      className={`py-3 rounded-lg font-semibold transition ${
                        form.direction === 'up'
                          ? 'bg-green-500 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-300'
                      }`}
                    >
                      📈 Up
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, direction: 'down' })}
                      className={`py-3 rounded-lg font-semibold transition ${
                        form.direction === 'down'
                          ? 'bg-red-500 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-300'
                      }`}
                    >
                      📉 Down
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                  {/* Quick amount buttons */}
                  <div className="flex gap-2 mt-2">
                    {[10, 50, 100, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setForm({ ...form, amount: amt.toString() })}
                        className="flex-1 py-1 px-2 bg-white/5 rounded text-sm hover:bg-white/10"
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={60}>60 seconds</option>
                    <option value={120}>2 minutes</option>
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                    <option value={900}>15 minutes</option>
                    <option value={1800}>30 minutes</option>
                    <option value={3600}>1 hour</option>
                  </select>
                </div>

                {/* Payout Info */}
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Potential Payout</span>
                    <span className="text-green-400 font-semibold">
                      ${(parseFloat(form.amount || 0) * 1.85).toFixed(2)} (85%)
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || priceLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? 'Placing...' : `Trade ${form.direction === 'up' ? '📈 UP' : '📉 DOWN'}`}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Active Trades Table */}
        <div className="mt-8 bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-6">Your Trades</h2>
          {trades.length === 0 ? (
            <div className="text-gray-400 text-center py-12">
              No trades yet. Place your first trade!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4">Pair</th>
                    <th className="text-left py-3 px-4">Direction</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Entry Price</th>
                    <th className="text-left py-3 px-4">Exit Price</th>
                    <th className="text-left py-3 px-4">P/L</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-white/5">
                      <td className="py-3 px-4 font-semibold">{trade.pair}</td>
                      <td className="py-3 px-4">
                        <span className={trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}>
                          {trade.direction === 'up' ? '📈 Up' : '📉 Down'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">${trade.amount}</td>
                      <td className="py-3 px-4 font-mono">${parseFloat(trade.entry_price).toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">
                        {trade.exit_price ? `$${parseFloat(trade.exit_price).toFixed(2)}` : '-'}
                      </td>
                      <td className={`py-3 px-4 font-mono font-semibold ${
                        trade.profit_loss > 0 ? 'text-green-400' : 
                        trade.profit_loss < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {trade.profit_loss ? `$${parseFloat(trade.profit_loss).toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          trade.result === 'win' ? 'bg-green-500/20 text-green-300' :
                          trade.result === 'loss' ? 'bg-red-500/20 text-red-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {trade.result || 'pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(trade.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
