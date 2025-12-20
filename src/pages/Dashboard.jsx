import { useState, useEffect } from 'react';
import { walletAPI, authAPI } from '../services/api';
import CryptoNews from '../components/CryptoNews';
import demoAccountService from '../services/demoAccountService';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountMode, setAccountMode] = useState('demo');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
    setAccountMode(demoAccountService.getAccountMode());
  }, []);

  const loadDashboard = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
      const txs = await walletAPI.getTransactions();
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountMode = () => {
    const newMode = demoAccountService.toggleAccountMode();
    setAccountMode(newMode);
    // Redirect to trading page to show the new account mode
    navigate('/trade');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          {/* Demo/Real Account Switcher */}
          <button
            onClick={toggleAccountMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              accountMode === 'demo'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-90'
            }`}
          >
            <span className="text-xl">{accountMode === 'demo' ? '🎮' : '💰'}</span>
            <span>{accountMode === 'demo' ? 'Demo Account' : 'Real Account'}</span>
          </button>
        </div>

        {/* Balance and Credit Score Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-80">Total Balance</div>
              {accountMode === 'demo' && (
                <span className="text-xs bg-blue-500/30 px-2 py-1 rounded-full">Demo Mode</span>
              )}
            </div>
            <div className="text-5xl font-bold mb-4">
              ${accountMode === 'demo' 
                ? demoAccountService.getDemoBalance().toFixed(2)
                : user?.balance?.toFixed(2) || '0.00'}
            </div>
            <div className="flex gap-4">
              <span className="text-sm">
                UID: <span className="font-semibold">{user?.id?.slice(0, 8)}</span>
              </span>
            </div>
          </div>

          {/* Credit Score Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8">
            <div className="text-sm opacity-80 mb-2">Credit Score</div>
            <div className="flex items-end gap-3 mb-4">
              <div className="text-5xl font-bold">{user?.credit_score || 10}</div>
              <div className="text-2xl opacity-60 mb-1">/ 100</div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${user?.credit_score || 10}%` }}
              ></div>
            </div>
            <div className="text-sm opacity-80">
              {(user?.credit_score || 10) >= 80 ? 'Excellent Credit' : 
               (user?.credit_score || 10) >= 50 ? 'Good Credit' :
               (user?.credit_score || 10) >= 30 ? 'Fair Credit' : 'Building Credit'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <a
            href="/trade"
            className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition"
          >
            <div className="text-2xl mb-2">📈</div>
            <div className="font-semibold">Binary Trading</div>
            <div className="text-sm text-gray-400 mt-1">Start trading now</div>
          </a>
          <a
            href="/wallet"
            className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-semibold">Wallet</div>
            <div className="text-sm text-gray-400 mt-1">Manage funds</div>
          </a>
          <a
            href="/arbitrage"
            className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition"
          >
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-semibold">AI Arbitrage</div>
            <div className="text-sm text-gray-400 mt-1">Auto trading</div>
          </a>
          <a
            href="/support"
            className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition"
          >
            <div className="text-2xl mb-2">💬</div>
            <div className="font-semibold">Support</div>
            <div className="text-sm text-gray-400 mt-1">Get help</div>
          </a>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center py-3 border-b border-white/5"
                >
                  <div>
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : ''}${tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crypto News Section */}
        <div className="mt-8">
          <CryptoNews />
        </div>
      </div>
    </div>
  );
}
