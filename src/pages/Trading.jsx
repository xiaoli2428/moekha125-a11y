import { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';

export default function Trading() {
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState({
    pair: 'BTC/USDT',
    direction: 'up',
    amount: '10',
    duration: 60,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrades();
    const interval = setInterval(loadTrades, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTrades = async () => {
    try {
      const data = await tradingAPI.getTrades();
      setTrades(data);
    } catch (error) {
      console.error('Failed to load trades:', error);
    }
  };

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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Trading Form */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-6">Place Trade</h2>
            <form onSubmit={handleTrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trading Pair
                </label>
                <select
                  value={form.pair}
                  onChange={(e) => setForm({ ...form, pair: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="BTC/USDT">BTC/USDT</option>
                  <option value="ETH/USDT">ETH/USDT</option>
                  <option value="SOL/USDT">SOL/USDT</option>
                  <option value="BNB/USDT">BNB/USDT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Direction
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value={60}>60 seconds</option>
                  <option value={300}>5 minutes</option>
                  <option value={900}>15 minutes</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Placing...' : 'Place Trade'}
              </button>
            </form>
          </div>

          {/* Active Trades */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-6">Your Trades</h2>
            {trades.length === 0 ? (
              <div className="text-gray-400 text-center py-12">
                No trades yet. Place your first trade!
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {trades.map((trade) => (
                  <div
                    key={trade.id}
                    className="bg-white/3 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-lg">{trade.pair}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(trade.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trade.result === 'win'
                            ? 'bg-green-500/20 text-green-300'
                            : trade.result === 'loss'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {trade.result || 'pending'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Direction:</span>{' '}
                        <span className="font-medium">
                          {trade.direction === 'up' ? '📈 Up' : '📉 Down'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Amount:</span>{' '}
                        <span className="font-medium">${trade.amount}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Entry:</span>{' '}
                        <span className="font-medium">${trade.entry_price}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">P/L:</span>{' '}
                        <span
                          className={`font-medium ${
                            trade.profit_loss > 0
                              ? 'text-green-400'
                              : trade.profit_loss < 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}
                        >
                          ${trade.profit_loss}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
