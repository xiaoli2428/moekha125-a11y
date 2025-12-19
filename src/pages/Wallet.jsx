import { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const profile = await walletAPI.getProfile();
      setBalance(profile.balance);
      const txs = await walletAPI.getTransactions();
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await walletAPI.deposit(parseFloat(amount));
      alert('Deposit successful!');
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
    setLoading(true);
    try {
      await walletAPI.withdraw(parseFloat(amount));
      alert('Withdrawal successful!');
      setAmount('');
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-8 mb-8">
          <div className="text-sm opacity-80 mb-2">Available Balance</div>
          <div className="text-5xl font-bold">${balance.toFixed(2)}</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Actions */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex gap-2 mb-6 border-b border-white/10">
              {['deposit', 'withdraw', 'transfer'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium capitalize transition ${
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
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="100.00"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? 'Processing...' : 'Deposit'}
                </button>
              </form>
            )}

            {activeTab === 'withdraw' && (
              <form onSubmit={handleWithdraw} className="space-y-4">
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
                    placeholder="50.00"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? 'Processing...' : 'Withdraw'}
                </button>
              </form>
            )}

            {activeTab === 'transfer' && (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="recipient@example.com"
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
