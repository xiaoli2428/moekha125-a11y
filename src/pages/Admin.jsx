import { useState, useEffect } from 'react';
import { adminAPI, tradingAPI, chatAPI, coinsAPI } from '../services/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [tradingLevels, setTradingLevels] = useState([]);
  const [arbitrageLevels, setArbitrageLevels] = useState([]);
  const [arbitrageTrades, setArbitrageTrades] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReply, setChatReply] = useState('');
  const [coins, setCoins] = useState([]);
  const [selectedUserForAddresses, setSelectedUserForAddresses] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ coin_symbol: '', network: '', address: '' });
  const [newCoin, setNewCoin] = useState({ symbol: '', name: '', networks: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'users') {
        const data = await adminAPI.getAllUsers();
        setUsers(data);
      } else if (activeTab === 'trades') {
        const data = await adminAPI.getAllTrades();
        setTrades(data);
      } else if (activeTab === 'stats') {
        const data = await adminAPI.getDashboardStats();
        setStats(data);
      } else if (activeTab === 'levels') {
        const data = await adminAPI.getTradingLevels();
        setTradingLevels(data);
      } else if (activeTab === 'ai-levels') {
        const data = await adminAPI.getArbitrageLevels();
        setArbitrageLevels(data);
      } else if (activeTab === 'ai-trades') {
        const data = await adminAPI.getArbitrageTrades();
        setArbitrageTrades(data);
      } else if (activeTab === 'kyc') {
        const response = await adminAPI.getAllKYCSubmissions();
        setKycSubmissions(response.submissions || []);
      } else if (activeTab === 'chat') {
        const response = await chatAPI.getAllChats();
        setChats(response.chats || []);
      } else if (activeTab === 'coins') {
        const response = await coinsAPI.getAllCoins();
        setCoins(response.coins || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleUpdateBalance = async (userId, newBalance) => {
    try {
      await adminAPI.updateUserBalance(userId, parseFloat(newBalance));
      alert('Balance updated successfully');
      loadData();
    } catch (error) {
      alert('Failed to update balance');
    }
  };

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      await adminAPI.updateUserStatus(userId, status);
      alert('Status updated successfully');
      loadData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleSettleTrade = async (tradeId, result) => {
    try {
      await adminAPI.settleTrade(tradeId, result);
      alert(`Trade settled as ${result}`);
      loadData();
    } catch (error) {
      alert('Failed to settle trade');
    }
  };

  const handleUpdateLevel = async (levelId, updates) => {
    setLoading(true);
    try {
      await adminAPI.updateTradingLevel(levelId, updates);
      alert('Trading level updated successfully');
      loadData();
    } catch (error) {
      alert('Failed to update level');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLevel = async () => {
    const newLevel = {
      name: `Level ${tradingLevels.length + 1}`,
      min_amount: 10,
      max_amount: 100,
      payout_percentage: 85,
      is_active: true
    };
    setLoading(true);
    try {
      await adminAPI.createTradingLevel(newLevel);
      alert('Trading level created');
      loadData();
    } catch (error) {
      alert('Failed to create level');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
          {[
            { key: 'users', label: 'Users' },
            { key: 'kyc', label: 'KYC' },
            { key: 'trades', label: 'Trades' },
            { key: 'levels', label: 'Trade Levels' },
            { key: 'ai-levels', label: 'AI Levels' },
            { key: 'ai-trades', label: 'AI Trades' },
            { key: 'chat', label: 'Live Chat' },
            { key: 'coins', label: 'Coins' },
            { key: 'stats', label: 'Stats' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'kyc' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4">KYC Submissions</h2>
            <div className="space-y-4">
              {kycSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white/3 rounded-lg p-6 border border-white/10"
                >
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">User</div>
                      <div className="font-medium">{submission.users?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Full Name</div>
                      <div className="font-medium">{submission.full_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Document Type</div>
                      <div className="font-medium">{submission.document_type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Document Number</div>
                      <div className="font-medium">{submission.document_number}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Submitted</div>
                      <div className="text-sm">{new Date(submission.submitted_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Status</div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          submission.status === 'approved'
                            ? 'bg-green-500/20 text-green-300'
                            : submission.status === 'rejected'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Front Image</div>
                      <img
                        src={submission.front_image_url}
                        alt="Front"
                        className="w-full h-48 object-contain bg-black/20 rounded"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Back Image</div>
                      <img
                        src={submission.back_image_url}
                        alt="Back"
                        className="w-full h-48 object-contain bg-black/20 rounded"
                      />
                    </div>
                  </div>
                  {submission.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          const notes = prompt('Add notes (optional):');
                          await adminAPI.reviewKYC(submission.id, 'approved', notes || '');
                          alert('KYC approved');
                          loadData();
                        }}
                        className="px-4 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          const notes = prompt('Rejection reason:');
                          if (notes) {
                            await adminAPI.reviewKYC(submission.id, 'rejected', notes);
                            alert('KYC rejected');
                            loadData();
                          }
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {submission.admin_notes && (
                    <div className="mt-3 p-3 bg-white/5 rounded text-sm">
                      <strong>Admin Notes:</strong> {submission.admin_notes}
                    </div>
                  )}
                </div>
              ))}
              {kycSubmissions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No KYC submissions yet
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Username</th>
                    <th className="text-left py-3 px-4">Balance</th>
                    <th className="text-left py-3 px-4">Credit Score</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.username}</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          defaultValue={user.balance}
                          onBlur={(e) =>
                            e.target.value !== user.balance.toString() &&
                            handleUpdateBalance(user.id, e.target.value)
                          }
                          className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="10"
                          max="100"
                          defaultValue={user.credit_score || 10}
                          onBlur={async (e) => {
                            const newScore = parseInt(e.target.value);
                            if (newScore >= 10 && newScore <= 100 && newScore !== user.credit_score) {
                              try {
                                await adminAPI.updateUserCreditScore(user.id, newScore);
                                loadData();
                              } catch (error) {
                                alert('Failed to update credit score');
                              }
                            } else if (newScore < 10 || newScore > 100) {
                              alert('Credit score must be between 10 and 100');
                              e.target.value = user.credit_score || 10;
                            }
                          }}
                          className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.status}
                          onChange={(e) =>
                            handleUpdateUserStatus(user.id, e.target.value)
                          }
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4">Trading History</h2>
            <div className="space-y-3">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="bg-white/3 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg">{trade.pair}</div>
                      <div className="text-sm text-gray-400">
                        User: {trade.user_email}
                      </div>
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
                  <div className="grid grid-cols-5 gap-4 text-sm mb-3">
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
                      <span className="text-gray-400">Exit:</span>{' '}
                      <span className="font-medium">
                        ${trade.exit_price || 'N/A'}
                      </span>
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
                  {trade.result === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSettleTrade(trade.id, 'win')}
                        className="px-4 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition text-sm"
                      >
                        Settle as Win
                      </button>
                      <button
                        onClick={() => handleSettleTrade(trade.id, 'loss')}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition text-sm"
                      >
                        Settle as Loss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trading Levels Tab */}
        {activeTab === 'levels' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Trading Levels Configuration</h2>
              <button
                onClick={handleCreateLevel}
                disabled={loading || tradingLevels.length >= 5}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                Add Level
              </button>
            </div>
            <div className="space-y-4">
              {tradingLevels.map((level, index) => (
                <div
                  key={level.id}
                  className="bg-white/3 rounded-lg p-6 border border-white/10"
                >
                  <div className="grid md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Level Name
                      </label>
                      <input
                        type="text"
                        defaultValue={level.name}
                        onBlur={(e) =>
                          e.target.value !== level.name &&
                          handleUpdateLevel(level.id, { name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Min Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={level.min_amount}
                        onBlur={(e) =>
                          e.target.value !== level.min_amount.toString() &&
                          handleUpdateLevel(level.id, {
                            min_amount: parseFloat(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Max Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={level.max_amount}
                        onBlur={(e) =>
                          e.target.value !== level.max_amount.toString() &&
                          handleUpdateLevel(level.id, {
                            max_amount: parseFloat(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Payout (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={level.payout_percentage}
                        onBlur={(e) =>
                          e.target.value !==
                            level.payout_percentage.toString() &&
                          handleUpdateLevel(level.id, {
                            payout_percentage: parseFloat(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Status
                      </label>
                      <select
                        value={level.is_active ? 'active' : 'inactive'}
                        onChange={(e) =>
                          handleUpdateLevel(level.id, {
                            is_active: e.target.value === 'active'
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {tradingLevels.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No trading levels configured. Click "Add Level" to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Arbitrage Levels Tab */}
        {activeTab === 'ai-levels' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">AI Arbitrage Levels Configuration</h2>
              <button
                onClick={async () => {
                  const newLevel = {
                    name: `AI Level ${arbitrageLevels.length + 1}`,
                    min_amount: 100,
                    max_amount: 500,
                    duration_seconds: 600,
                    profit_percentage: 3.5,
                    loss_percentage: 2.0,
                    is_active: true
                  };
                  try {
                    await adminAPI.createArbitrageLevel(newLevel);
                    alert('AI Level created');
                    loadData();
                  } catch (error) {
                    alert('Failed to create level');
                  }
                }}
                disabled={loading || arbitrageLevels.length >= 5}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                Add AI Level
              </button>
            </div>
            <div className="space-y-4">
              {arbitrageLevels.map((level) => (
                <div
                  key={level.id}
                  className="bg-white/3 rounded-lg p-6 border border-white/10"
                >
                  <div className="grid md:grid-cols-7 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Level Name
                      </label>
                      <input
                        type="text"
                        defaultValue={level.name}
                        onBlur={(e) =>
                          e.target.value !== level.name &&
                          adminAPI.updateArbitrageLevel(level.id, { name: e.target.value }).then(loadData)
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Min Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={level.min_amount}
                        onBlur={(e) =>
                          e.target.value !== level.min_amount.toString() &&
                          adminAPI.updateArbitrageLevel(level.id, { min_amount: parseFloat(e.target.value) }).then(loadData)
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Max Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={level.max_amount}
                        onBlur={(e) =>
                          e.target.value !== level.max_amount.toString() &&
                          adminAPI.updateArbitrageLevel(level.id, { max_amount: parseFloat(e.target.value) }).then(loadData)
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration (sec)
                      </label>
                      <input
                        type="number"
                        defaultValue={level.duration_seconds}
                        onBlur={(e) =>
                          e.target.value !== level.duration_seconds.toString() &&
                          adminAPI.updateArbitrageLevel(level.id, { duration_seconds: parseInt(e.target.value) }).then(loadData)
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Profit (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={level.profit_percentage}
                        onBlur={(e) =>
                          e.target.value !== level.profit_percentage.toString() &&
                          adminAPI.updateArbitrageLevel(level.id, { profit_percentage: parseFloat(e.target.value) }).then(loadData)
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Loss (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={level.loss_percentage}
                        onBlur={(e) =>
                          e.target.value !== level.loss_percentage.toString() &&
                          adminAPI.updateArbitrageLevel(level.id, { loss_percentage: parseFloat(e.target.value) }).then(loadData)
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Status
                      </label>
                      <select
                        value={level.is_active ? 'active' : 'inactive'}
                        onChange={(e) =>
                          adminAPI.updateArbitrageLevel(level.id, { is_active: e.target.value === 'active' }).then(loadData)
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {arbitrageLevels.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No AI arbitrage levels configured. Click "Add AI Level" to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Arbitrage Trades Tab */}
        {activeTab === 'ai-trades' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4">AI Arbitrage Trading History</h2>
            <div className="space-y-3">
              {arbitrageTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="bg-white/3 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg">{trade.pair}</div>
                      <div className="text-sm text-gray-400">
                        Level: {trade.ai_arbitrage_levels?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(trade.executed_at).toLocaleString()}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        trade.result === 'profit'
                          ? 'bg-green-500/20 text-green-300'
                          : trade.result === 'loss'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {trade.result || 'pending'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-400">Amount:</span>{' '}
                      <span className="font-medium">${trade.amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Buy:</span>{' '}
                      <span className="font-medium">${trade.buy_price}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Sell:</span>{' '}
                      <span className="font-medium">${trade.sell_price}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Profit:</span>{' '}
                      <span
                        className={`font-medium ${
                          trade.profit > 0
                            ? 'text-green-400'
                            : trade.profit < 0
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}
                      >
                        ${trade.profit} ({trade.profit_percentage}%)
                      </span>
                    </div>
                  </div>
                  {trade.result === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          adminAPI.settleArbitrageTrade(trade.id, 'profit').then(() => {
                            alert('Trade settled as profit');
                            loadData();
                          });
                        }}
                        className="px-4 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition text-sm"
                      >
                        Settle as Profit
                      </button>
                      <button
                        onClick={() => {
                          adminAPI.settleArbitrageTrade(trade.id, 'loss').then(() => {
                            alert('Trade settled as loss');
                            loadData();
                          });
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition text-sm"
                      >
                        Settle as Loss
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {arbitrageTrades.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No AI arbitrage trades yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
              <div className="text-sm text-gray-300 mb-2">Total Users</div>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
              <div className="text-sm text-gray-300 mb-2">Total Trades</div>
              <div className="text-3xl font-bold">{stats.totalTrades}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
              <div className="text-sm text-gray-300 mb-2">Platform Volume</div>
              <div className="text-3xl font-bold">
                ${stats.totalVolume?.toFixed(2)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border border-yellow-500/30">
              <div className="text-sm text-gray-300 mb-2">Active Users</div>
              <div className="text-3xl font-bold">{stats.activeUsers}</div>
            </div>
          </div>
        )}

        {/* Live Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="font-semibold">Conversations</h2>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No conversations yet</div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.user_id}
                      onClick={async () => {
                        setSelectedChatUser(chat);
                        const res = await chatAPI.getUserMessages(chat.user_id);
                        setChatMessages(res.messages || []);
                      }}
                      className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${
                        selectedChatUser?.user_id === chat.user_id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{chat.user?.username || chat.user?.email}</div>
                          <p className="text-sm text-gray-400 truncate">{chat.last_message}</p>
                        </div>
                        {chat.unread_count > 0 && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/10 flex flex-col h-[600px]">
              {selectedChatUser ? (
                <>
                  <div className="p-4 border-b border-white/10">
                    <div className="font-semibold">{selectedChatUser.user?.username || selectedChatUser.user?.email}</div>
                    <div className="text-xs text-gray-400">User ID: {selectedChatUser.user_id.slice(0, 8)}</div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.is_from_admin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-xl px-4 py-2 ${
                          msg.is_from_admin ? 'bg-purple-600' : 'bg-gray-700'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs text-gray-300 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatReply}
                        onChange={(e) => setChatReply(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg"
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && chatReply.trim()) {
                            await chatAPI.sendAdminReply(selectedChatUser.user_id, chatReply);
                            setChatReply('');
                            const res = await chatAPI.getUserMessages(selectedChatUser.user_id);
                            setChatMessages(res.messages || []);
                          }
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (chatReply.trim()) {
                            await chatAPI.sendAdminReply(selectedChatUser.user_id, chatReply);
                            setChatReply('');
                            const res = await chatAPI.getUserMessages(selectedChatUser.user_id);
                            setChatMessages(res.messages || []);
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Select a conversation to view messages
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coins & Addresses Tab */}
        {activeTab === 'coins' && (
          <div className="space-y-6">
            {/* Supported Coins */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">Supported Coins</h2>
              
              {/* Add New Coin */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Symbol (e.g., BTC)"
                  value={newCoin.symbol}
                  onChange={(e) => setNewCoin({ ...newCoin, symbol: e.target.value.toUpperCase() })}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg w-32"
                />
                <input
                  type="text"
                  placeholder="Name (e.g., Bitcoin)"
                  value={newCoin.name}
                  onChange={(e) => setNewCoin({ ...newCoin, name: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg flex-1"
                />
                <input
                  type="text"
                  placeholder="Networks (comma-separated)"
                  value={newCoin.networks}
                  onChange={(e) => setNewCoin({ ...newCoin, networks: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg flex-1"
                />
                <button
                  onClick={async () => {
                    if (newCoin.symbol && newCoin.name) {
                      await coinsAPI.createCoin({
                        symbol: newCoin.symbol,
                        name: newCoin.name,
                        networks: newCoin.networks.split(',').map(n => n.trim()).filter(Boolean)
                      });
                      setNewCoin({ symbol: '', name: '', networks: '' });
                      const res = await coinsAPI.getAllCoins();
                      setCoins(res.coins || []);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Add Coin
                </button>
              </div>

              {/* Coins Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Symbol</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Networks</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coins.map((coin) => (
                      <tr key={coin.id} className="border-b border-white/5">
                        <td className="py-3 px-4 font-medium">{coin.symbol}</td>
                        <td className="py-3 px-4">{coin.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {(coin.networks || []).map((n, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs">{n}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${coin.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {coin.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={async () => {
                              await coinsAPI.updateCoin(coin.id, { is_active: !coin.is_active });
                              const res = await coinsAPI.getAllCoins();
                              setCoins(res.coins || []);
                            }}
                            className="text-sm text-purple-400 hover:text-purple-300 mr-3"
                          >
                            {coin.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this coin?')) {
                                await coinsAPI.deleteCoin(coin.id);
                                const res = await coinsAPI.getAllCoins();
                                setCoins(res.coins || []);
                              }
                            }}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Deposit Addresses */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">User Deposit Addresses</h2>
              
              {/* Select User */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Select User</label>
                <select
                  value={selectedUserForAddresses?.id || ''}
                  onChange={async (e) => {
                    const user = users.find(u => u.id === e.target.value);
                    setSelectedUserForAddresses(user);
                    if (user) {
                      const res = await coinsAPI.getUserAddresses(user.id);
                      setUserAddresses(res.addresses || []);
                    }
                  }}
                  className="w-full md:w-64 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg"
                >
                  <option value="">-- Select a user --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.email} ({user.username})</option>
                  ))}
                </select>
              </div>

              {selectedUserForAddresses && (
                <>
                  {/* Add New Address */}
                  <div className="flex gap-3 mb-6">
                    <select
                      value={newAddress.coin_symbol}
                      onChange={(e) => setNewAddress({ ...newAddress, coin_symbol: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg"
                    >
                      <option value="">Select Coin</option>
                      {coins.filter(c => c.is_active).map((coin) => (
                        <option key={coin.id} value={coin.symbol}>{coin.symbol}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Network (e.g., ERC20)"
                      value={newAddress.network}
                      onChange={(e) => setNewAddress({ ...newAddress, network: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg w-40"
                    />
                    <input
                      type="text"
                      placeholder="Deposit Address"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg flex-1"
                    />
                    <button
                      onClick={async () => {
                        if (newAddress.coin_symbol && newAddress.network && newAddress.address) {
                          await coinsAPI.setUserAddress(selectedUserForAddresses.id, newAddress);
                          setNewAddress({ coin_symbol: '', network: '', address: '' });
                          const res = await coinsAPI.getUserAddresses(selectedUserForAddresses.id);
                          setUserAddresses(res.addresses || []);
                        }
                      }}
                      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>

                  {/* Addresses Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4">Coin</th>
                          <th className="text-left py-3 px-4">Network</th>
                          <th className="text-left py-3 px-4">Address</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAddresses.map((addr) => (
                          <tr key={addr.id} className="border-b border-white/5">
                            <td className="py-3 px-4 font-medium">{addr.coin_symbol}</td>
                            <td className="py-3 px-4">{addr.network}</td>
                            <td className="py-3 px-4 font-mono text-sm">{addr.address}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this address?')) {
                                    await coinsAPI.deleteUserAddress(addr.id);
                                    const res = await coinsAPI.getUserAddresses(selectedUserForAddresses.id);
                                    setUserAddresses(res.addresses || []);
                                  }
                                }}
                                className="text-sm text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {userAddresses.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        No deposit addresses set for this user
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
