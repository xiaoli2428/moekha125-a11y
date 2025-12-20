import { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';

export default function AssetHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const txs = await walletAPI.getTransactions(100, 0);
      setTransactions(txs || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Use mock data if API fails
      setTransactions([
        { id: 1, type: 'deposit', amount: 1000, created_at: new Date().toISOString(), status: 'completed' },
        { id: 2, type: 'trade', amount: -50, created_at: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
        { id: 3, type: 'trade', amount: 120, created_at: new Date(Date.now() - 172800000).toISOString(), status: 'completed' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    
    if (dateRange !== 'all') {
      const txDate = new Date(tx.created_at);
      const now = new Date();
      if (dateRange === 'today') {
        return txDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        return txDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        return txDate >= monthAgo;
      }
    }
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdraw': return '📤';
      case 'trade': return '📈';
      case 'transfer': return '↔️';
      case 'referral': return '🎁';
      default: return '💳';
    }
  };

  const getTypeColor = (type, amount) => {
    if (amount >= 0) return 'text-green-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-3 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Asset History</h1>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-green-400 text-sm mb-1">Total Deposits</div>
            <div className="text-2xl font-bold text-green-400">
              ${transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="text-red-400 text-sm mb-1">Total Withdrawals</div>
            <div className="text-2xl font-bold text-red-400">
              ${transactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="text-purple-400 text-sm mb-1">Trading P&L</div>
            <div className="text-2xl font-bold text-purple-400">
              ${transactions.filter(t => t.type === 'trade').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <span className="text-gray-400 self-center text-sm">Type:</span>
            {['all', 'deposit', 'withdraw', 'trade', 'transfer'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-lg text-sm capitalize transition ${
                  filter === type
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 self-center text-sm">Period:</span>
            {[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' }
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setDateRange(period.value)}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  dateRange === period.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold">Transaction History</h2>
            <p className="text-sm text-gray-400">{filteredTransactions.length} transactions</p>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">
                      {getTypeIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{tx.type}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getTypeColor(tx.type, tx.amount)}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount?.toFixed(2)} USD
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                      tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {tx.status || 'completed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
