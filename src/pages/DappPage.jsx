import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { walletAPI, authAPI } from '../services/api';
import priceService from '../services/priceService';
import demoAccountService from '../services/demoAccountService';
import CryptoNews from '../components/CryptoNews';

/**
 * Dapp Page - ALL onchain/heavy logic is here
 * Loaded AFTER user connects wallet
 * Safe to import web3, do RPC calls, fetch pools, balances, etc.
 */

const FEATURED_COINS = [
  { id: 'BTC/USDT', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { id: 'ETH/USDT', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'SOL/USDT', symbol: 'SOL', name: 'Solana', color: '#00FFA3' },
  { id: 'XAU/USD', symbol: 'XAU', name: 'Gold', color: '#FFD700' },
];

export default function DappPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountMode, setAccountMode] = useState('demo');
  const [prices, setPrices] = useState({});

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');

    if (!token) {
      // User not authenticated - show wallet connect screen
      setLoading(false);
      return;
    }

    // User is authenticated - load dashboard
    loadDashboard();
    setAccountMode(demoAccountService.getAccountMode());

    const unsubscribe = priceService.subscribe((newPrices) => {
      setPrices(newPrices);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
      const txs = await walletAPI.getTransactions();
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // If auth fails, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // ========== WALLET CONNECT (not authenticated) ==========
  if (!user && loading === false) {
    return <WalletConnectHome />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pb-20">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const toggleAccountMode = () => {
    const newMode = demoAccountService.toggleAccountMode();
    setAccountMode(newMode);
  };

  const getDisplayBalance = () => {
    if (accountMode === 'demo') {
      return demoAccountService.getDemoBalance();
    }
    return user?.balance || 0;
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('walletAddress');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pb-20">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const displayBalance = getDisplayBalance();
  const demoStats = demoAccountService.getStatistics();

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600/30 to-indigo-600/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Welcome back,</p>
            <h1 className="text-xl font-bold">{user?.kyc_name || 'Trader'}</h1>
          </div>

          {/* Demo/Real Toggle */}
          <button
            onClick={toggleAccountMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${accountMode === 'demo'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              : 'bg-green-500/20 text-green-400 border border-green-500/50'
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${accountMode === 'demo' ? 'bg-blue-400' : 'bg-green-400'} animate-pulse`}></span>
            {accountMode === 'demo' ? 'Demo' : 'Real'}
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-80">Total Balance</span>
            {accountMode === 'demo' && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Demo</span>
            )}
          </div>
          <div className="text-4xl font-bold mb-4">${displayBalance.toFixed(2)}</div>

          {/* Quick Stats for Demo */}
          {accountMode === 'demo' && demoStats && (
            <div className="flex gap-4 pt-3 border-t border-white/20">
              <div>
                <div className="text-sm opacity-80">Trades</div>
                <div className="font-semibold">{demoStats.totalTrades}</div>
              </div>
              <div>
                <div className="text-sm opacity-80">Win Rate</div>
                <div className="font-semibold text-green-300">{demoStats.winRate.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm opacity-80">P&L</div>
                <div className={`font-semibold ${demoStats.totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {demoStats.totalProfit >= 0 ? '+' : ''}{demoStats.totalProfit.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          <Link
            to="/dashboard/trade"
            className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs text-center">Trade</span>
          </Link>

          <Link
            to="/dashboard/wallet"
            className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-xs text-center">Deposit</span>
          </Link>

          <Link
            to="/dashboard/ai-arbitrage"
            className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-center">AI Bot</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center p-4 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="text-xs text-center">Logout</span>
          </button>
        </div>
      </div>

      {/* Market Preview */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-400">Market</h2>
          <Link to="/dashboard/market" className="text-xs text-purple-400 hover:text-purple-300">See All →</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {FEATURED_COINS.map((coin) => {
            const priceData = prices[coin.id] || {};
            const price = priceData.price || 0;
            const change = priceData.change24h || 0;
            const isUp = change >= 0;

            return (
              <Link
                key={coin.id}
                to="/dashboard/market"
                className="flex-shrink-0 w-36 bg-white/5 rounded-xl p-3 border border-white/10 hover:border-white/20 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: coin.color }}
                  >
                    {coin.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{coin.symbol}</div>
                  </div>
                </div>
                <div className="font-semibold">${formatPrice(price)}</div>
                <div className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp ? '+' : ''}{change.toFixed(2)}%
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-400">Recent Activity</h2>
          <Link to="/dashboard/asset-history" className="text-xs text-purple-400 hover:text-purple-300">View All →</Link>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-gray-400 text-center py-8 text-sm">
              No transactions yet
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                      {tx.amount >= 0 ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{tx.type}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Crypto News */}
      <div className="px-4 pb-4">
        <CryptoNews />
      </div>
    </div>
  );
}

// ========== WALLET CONNECT HOME SCREEN (unauthenticated users) ==========
function WalletConnectHome() {
  const [loading, setLoading] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleWalletConnect = async () => {
    setError('');
    setLoading(true);

    try {
      // Only import web3modal setup when user clicks "Connect Wallet"
      const { walletLogin } = await import('../web3modal/setup');

      const user = await walletLogin();
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify(user));

      // Reload page to show dashboard
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Wallet connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({
        email: emailForm.email,
        password: emailForm.password,
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header with Logo */}
      <div className="bg-gradient-to-br from-purple-600/30 to-indigo-600/30 p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">OnchainWeb</h1>
        <p className="text-gray-400">DeFi Trading Platform</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Wallet Connect Card */}
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-2xl p-8 border border-purple-500/30 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
              <p className="text-gray-400 text-sm">Start trading with your Web3 wallet</p>
            </div>

            <button
              onClick={handleWalletConnect}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 mb-4"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300 mb-4">
                {error}
              </div>
            )}

            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => setShowEmailLogin(!showEmailLogin)}
                className="w-full text-sm text-purple-400 hover:text-purple-300 transition"
              >
                {showEmailLogin ? 'Hide Email Login' : 'Login with Email'}
              </button>
            </div>
          </div>

          {/* Email Login Form (hidden by default) */}
          {showEmailLogin && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Email Login</h3>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  disabled={loading}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  disabled={loading}
                />
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-green-400 mb-1">10K+</div>
              <div className="text-xs text-gray-400">Active Traders</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
              <div className="text-xs text-gray-400">Live Trading</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-purple-400 mb-1">0.1%</div>
              <div className="text-xs text-gray-400">Min Fees</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-indigo-400 mb-1">AI</div>
              <div className="text-xs text-gray-400">Bot Trading</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/50 border-t border-white/10 p-4 text-center text-sm text-gray-500">
        <p>© 2025 OnchainWeb. All rights reserved.</p>
      </div>
    </div>
  );
}
