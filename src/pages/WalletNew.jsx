import { useState, useEffect } from 'react';
import { walletAPI, authAPI } from '../services/api';
import priceService from '../services/priceService';
import demoAccountService from '../services/demoAccountService';

// Crypto holdings display
const COIN_HOLDINGS = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', pair: 'BTC/USDT' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', pair: 'ETH/USDT' },
  { symbol: 'SOL', name: 'Solana', color: '#00FFA3', pair: 'SOL/USDT' },
  { symbol: 'USDT', name: 'Tether', color: '#26A17B', pair: null },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F', pair: 'BNB/USDT' },
];

// Deposit networks
const NETWORKS = [
  { id: 'trc20', name: 'TRC20 (Tron)', icon: '🔴', address: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6', fee: 1 },
  { id: 'erc20', name: 'ERC20 (Ethereum)', icon: '🔵', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E0', fee: 15 },
  { id: 'bep20', name: 'BEP20 (BSC)', icon: '🟡', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E0', fee: 0.5 },
];

export default function WalletNew() {
  const [balance, setBalance] = useState(0);
  const [accountMode, setAccountMode] = useState('demo');
  const [prices, setPrices] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [copied, setCopied] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadWalletData();
    setAccountMode(demoAccountService.getAccountMode());
    
    const unsubscribe = priceService.subscribe((newPrices) => {
      setPrices(newPrices);
    });
    return () => unsubscribe();
  }, []);

  const loadWalletData = async () => {
    try {
      const profile = await authAPI.getProfile();
      setBalance(profile.balance || 0);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const getDisplayBalance = () => {
    if (accountMode === 'demo') {
      return demoAccountService.getDemoBalance();
    }
    return balance;
  };

  // Mock holdings based on balance (in demo mode, show some example holdings)
  const getHoldings = () => {
    const displayBalance = getDisplayBalance();
    if (displayBalance === 0) return [];
    
    return COIN_HOLDINGS.map((coin) => {
      let amount = 0;
      let usdValue = 0;
      
      if (coin.symbol === 'USDT') {
        amount = displayBalance * 0.4; // 40% in USDT
        usdValue = amount;
      } else if (coin.pair && prices[coin.pair]) {
        usdValue = displayBalance * (0.15 - Math.random() * 0.1); // Random allocation
        amount = usdValue / prices[coin.pair].price;
      }
      
      return { ...coin, amount, usdValue };
    }).filter(h => h.usdValue > 0);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawAmount) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (amount < 10) {
      showNotification('Minimum withdrawal is $10', 'error');
      return;
    }
    
    if (amount > getDisplayBalance()) {
      showNotification('Insufficient balance', 'error');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      if (accountMode === 'demo') {
        demoAccountService.updateDemoBalance(-amount);
      }
      showNotification(`Withdrawal request submitted for $${amount}`, 'success');
      setWithdrawAmount('');
      setWithdrawAddress('');
      setLoading(false);
    }, 1500);
  };

  const displayBalance = getDisplayBalance();
  const holdings = getHoldings();

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

      {/* Header with Balance */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Wallet</h1>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            accountMode === 'demo' ? 'bg-white/20 text-white' : 'bg-green-500/30 text-green-300'
          }`}>
            {accountMode === 'demo' ? 'Demo' : 'Real'}
          </div>
        </div>
        
        <div className="text-center py-4">
          <div className="text-sm opacity-80 mb-1">Total Balance</div>
          <div className="text-4xl font-bold">${displayBalance.toFixed(2)}</div>
          <div className="text-sm opacity-80 mt-1">≈ {(displayBalance / 98500).toFixed(6)} BTC</div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className="py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition"
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className="py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition"
          >
            Withdraw
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className="py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition"
          >
            Assets
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Assets</h2>
            
            {holdings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">💰</div>
                <p>No assets yet</p>
                <p className="text-sm mt-1">Deposit funds to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {holdings.map((coin) => (
                  <div 
                    key={coin.symbol}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
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
                        <div className="font-semibold">
                          {coin.symbol === 'USDT' ? coin.amount.toFixed(2) : coin.amount.toFixed(6)}
                        </div>
                        <div className="text-sm text-gray-400">${coin.usdValue.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio Summary */}
            <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Portfolio Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">+$0.00</div>
                  <div className="text-xs text-gray-400">24h Profit</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{holdings.length}</div>
                  <div className="text-xs text-gray-400">Assets</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deposit' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Deposit</h2>
            
            {/* Network Selection */}
            <div className="space-y-2 mb-6">
              {NETWORKS.map((network) => (
                <button
                  key={network.id}
                  onClick={() => setSelectedNetwork(network)}
                  className={`w-full p-3 rounded-xl text-left transition flex items-center gap-3 ${
                    selectedNetwork.id === network.id
                      ? 'bg-purple-500/20 border border-purple-500'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <span className="text-xl">{network.icon}</span>
                  <span className="font-medium">{network.name}</span>
                </button>
              ))}
            </div>

            {/* Deposit Address */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">Send USDT to:</div>
              <div className="bg-gray-800 rounded-lg p-3 break-all font-mono text-sm mb-3">
                {selectedNetwork.address}
              </div>
              <button
                onClick={() => copyToClipboard(selectedNetwork.address)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
              >
                {copied ? '✓ Copied!' : '📋 Copy Address'}
              </button>
            </div>

            {/* Notes */}
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="text-yellow-400 font-medium mb-2">⚠️ Important</div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Minimum deposit: $10</li>
                <li>• Only send USDT via {selectedNetwork.name}</li>
                <li>• Deposits confirmed in 10-30 minutes</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Withdraw</h2>
            
            {/* Network Selection */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Network</label>
              <select
                value={selectedNetwork.id}
                onChange={(e) => setSelectedNetwork(NETWORKS.find(n => n.id === e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {NETWORKS.map((network) => (
                  <option key={network.id} value={network.id} className="bg-gray-800">
                    {network.icon} {network.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Withdraw Address */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Your Address</label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="Enter your wallet address"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Available: ${displayBalance.toFixed(2)} • Fee: ${selectedNetwork.fee}
              </div>
            </div>

            {/* Summary */}
            {withdrawAmount && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Amount:</span>
                  <span>${withdrawAmount}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Fee:</span>
                  <span className="text-red-400">-${selectedNetwork.fee}</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>You Receive:</span>
                    <span className="text-green-400">
                      ${Math.max(0, parseFloat(withdrawAmount) - selectedNetwork.fee).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleWithdraw}
              disabled={loading || !withdrawAddress || !withdrawAmount}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl font-bold text-lg transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
