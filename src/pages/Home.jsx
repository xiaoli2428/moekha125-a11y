import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { walletAPI, authAPI } from '../services/api';
import priceService from '../services/priceService';
import demoAccountService from '../services/demoAccountService';
import CryptoNews from '../components/CryptoNews';

// Featured coins for quick view
const FEATURED_COINS = [
  { id: 'BTC/USDT', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { id: 'ETH/USDT', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'SOL/USDT', symbol: 'SOL', name: 'Solana', color: '#00FFA3' },
  { id: 'XAU/USD', symbol: 'XAU', name: 'Gold', color: '#FFD700' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountMode, setAccountMode] = useState('demo');
  const [prices, setPrices] = useState({});

  useEffect(() => {
    loadDashboard();
    setAccountMode(demoAccountService.getAccountMode());
    
    const unsubscribe = priceService.subscribe((newPrices) => {
      setPrices(newPrices);
    });
    return () => unsubscribe();
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
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              accountMode === 'demo'
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
            to="/trade"
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
            to="/wallet"
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
            to="/ai-arbitrage"
            className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-center">AI Bot</span>
          </Link>
          
          <Link 
            to="/support"
            className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-center">Support</span>
          </Link>
        </div>
      </div>

      {/* Market Preview */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-400">Market</h2>
          <Link to="/market" className="text-xs text-purple-400 hover:text-purple-300">See All →</Link>
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
                to="/market"
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
          <Link to="/asset-history" className="text-xs text-purple-400 hover:text-purple-300">View All →</Link>
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.amount >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
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
