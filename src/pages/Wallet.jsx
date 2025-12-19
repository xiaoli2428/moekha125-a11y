import { useState, useEffect } from 'react';
import { walletAPI, authAPI } from '../services/api';

// Supported cryptocurrencies for deposit/withdraw
const CRYPTO_OPTIONS = [
  { 
    id: 'usdt_trc20', 
    name: 'USDT', 
    network: 'TRC20 (Tron)', 
    icon: '💵',
    address: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6',
    minDeposit: 10,
    minWithdraw: 20,
    fee: 1
  },
  { 
    id: 'usdt_erc20', 
    name: 'USDT', 
    network: 'ERC20 (Ethereum)', 
    icon: '💵',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E0',
    minDeposit: 50,
    minWithdraw: 100,
    fee: 15
  },
  { 
    id: 'usdt_bep20', 
    name: 'USDT', 
    network: 'BEP20 (BSC)', 
    icon: '💵',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E0',
    minDeposit: 10,
    minWithdraw: 20,
    fee: 0.5
  },
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    network: 'BTC Network', 
    icon: '₿',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    minDeposit: 0.001,
    minWithdraw: 0.002,
    fee: 0.0001
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    network: 'ERC20', 
    icon: 'Ξ',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E0',
    minDeposit: 0.01,
    minWithdraw: 0.02,
    fee: 0.005
  },
];

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0]);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const profile = await authAPI.getProfile();
      setBalance(profile.balance || 0);
      const txs = await walletAPI.getTransactions();
      setTransactions(txs || []);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for mobile
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

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await walletAPI.deposit(parseFloat(amount));
      alert('Deposit request submitted! Your balance will be updated once the transaction is confirmed.');
      setAmount('');
      loadWalletData();
    } catch (error) {
      alert(error.response?.data?.error || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAddress) {
      alert('Please enter your withdrawal address');
      return;
    }
    setLoading(true);
    try {
      await walletAPI.withdraw(parseFloat(amount));
      alert(`Withdrawal request submitted!\n\nAmount: ${amount} USD\nCoin: ${selectedCrypto.name} (${selectedCrypto.network})\nAddress: ${withdrawAddress}\nFee: $${selectedCrypto.fee}\n\nYour withdrawal will be processed within 24 hours.`);
      setAmount('');
      setWithdrawAddress('');
      loadWalletData();
    } catch (error) {
      alert(error.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await walletAPI.transfer(recipient, parseFloat(amount));
      alert('Transfer successful!');
      setAmount('');
      setRecipient('');
      loadWalletData();
    } catch (error) {
      alert(error.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 md:p-8 mb-6">
          <div className="text-sm opacity-80 mb-2">Available Balance</div>
          <div className="text-4xl md:text-5xl font-bold">${balance.toFixed(2)}</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Actions */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 md:p-6">
            <div className="flex gap-1 md:gap-2 mb-6 border-b border-white/10 overflow-x-auto">
              {['deposit', 'withdraw', 'transfer'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 md:px-4 py-2 font-medium capitalize transition whitespace-nowrap text-sm md:text-base ${
                    activeTab === tab
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'deposit' && (
              <div className="space-y-4">
                {/* Crypto Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Cryptocurrency
                  </label>
                  <select
                    value={selectedCrypto.id}
                    onChange={(e) => setSelectedCrypto(CRYPTO_OPTIONS.find(c => c.id === e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <option key={crypto.id} value={crypto.id} className="bg-gray-800">
                        {crypto.icon} {crypto.name} - {crypto.network}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deposit Address */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">
                    Send {selectedCrypto.name} ({selectedCrypto.network}) to:
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 break-all font-mono text-sm mb-3">
                    {selectedCrypto.address}
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedCrypto.address)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>✓ Copied!</>
                    ) : (
                      <>📋 Copy Address</>
                    )}
                  </button>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="text-yellow-400 font-medium mb-2">⚠️ Important</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Minimum deposit: {selectedCrypto.minDeposit} {selectedCrypto.name}</li>
                    <li>• Network: <span className="text-purple-400">{selectedCrypto.network}</span></li>
                    <li>• Deposits below minimum will not be credited</li>
                    <li>• Only send {selectedCrypto.name} to this address</li>
                    <li>• Confirmation time: 10-30 minutes</li>
                  </ul>
                </div>

                {/* Manual Deposit Form */}
                <form onSubmit={handleDeposit} className="space-y-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    Already sent? Enter amount to notify us:
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amount Sent (USD equivalent)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="100.00"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !amount}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {loading ? 'Processing...' : 'Confirm Deposit'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div className="space-y-4">
                {/* Crypto Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Cryptocurrency
                  </label>
                  <select
                    value={selectedCrypto.id}
                    onChange={(e) => setSelectedCrypto(CRYPTO_OPTIONS.find(c => c.id === e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <option key={crypto.id} value={crypto.id} className="bg-gray-800">
                        {crypto.icon} {crypto.name} - {crypto.network}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Withdrawal Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your {selectedCrypto.name} Address ({selectedCrypto.network})
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                    placeholder={`Enter your ${selectedCrypto.network} address`}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={selectedCrypto.minWithdraw}
                    max={balance}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder={`Min: $${selectedCrypto.minWithdraw}`}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Available: ${balance.toFixed(2)}
                  </div>
                </div>

                {/* Fee Info */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Withdrawal Amount:</span>
                    <span>${amount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Network Fee:</span>
                    <span className="text-red-400">-${selectedCrypto.fee}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>You Receive:</span>
                      <span className="text-green-400">
                        ${amount ? Math.max(0, parseFloat(amount) - selectedCrypto.fee).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="text-yellow-400 font-medium mb-2">⚠️ Important</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Minimum withdrawal: ${selectedCrypto.minWithdraw}</li>
                    <li>• Network: <span className="text-purple-400">{selectedCrypto.network}</span></li>
                    <li>• Processing time: 1-24 hours</li>
                    <li>• Double-check your address before submitting</li>
                  </ul>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={loading || !amount || !withdrawAddress || parseFloat(amount) < selectedCrypto.minWithdraw}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </div>
            )}

            {activeTab === 'transfer' && (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipient Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="username or email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={balance}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="25.00"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Available: ${balance.toFixed(2)} • No transfer fees
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? 'Processing...' : 'Transfer'}
                </button>
              </form>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            {transactions.length === 0 ? (
              <div className="text-gray-400 text-center py-12">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white/3 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium capitalize">
                          {tx.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                    {tx.description && (
                      <div className="text-sm text-gray-400 mt-2">
                        {tx.description}
                      </div>
                    )}
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
