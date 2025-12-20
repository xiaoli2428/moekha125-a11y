import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function Referral() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);

  // Mock referral stats
  const stats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 2450.00,
    pendingEarnings: 125.00
  };

  // Mock referred users
  const mockReferrals = [
    { id: 1, username: 'user_abc1', joinedAt: '2025-12-15', earnings: 150 },
    { id: 2, username: 'user_def2', joinedAt: '2025-12-10', earnings: 320 },
    { id: 3, username: 'user_ghi3', joinedAt: '2025-12-05', earnings: 85 },
    { id: 4, username: 'user_jkl4', joinedAt: '2025-11-28', earnings: 420 },
    { id: 5, username: 'user_mno5', joinedAt: '2025-11-20', earnings: 275 },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
      setReferrals(mockReferrals);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = user?.shortUid || user?.id?.slice(0, 8) || 'XXXXX';
  const referralLink = `https://onchainweb.app/ref/${referralCode}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const text = `Join OnchainWeb and start trading crypto! Use my referral code: ${referralCode}`;
    const url = referralLink;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
    }
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-gray-400 mb-8">Invite friends and earn rewards together</p>

        {/* Referral Code Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6">
          <h2 className="text-lg opacity-80 mb-2">Your Referral Code</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-mono font-bold tracking-wider">{referralCode}</div>
            <button
              onClick={() => handleCopy(referralCode)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <div className="text-sm opacity-70 mb-1">Your Referral Link</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                onClick={() => handleCopy(referralLink)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="flex-1 py-2 bg-[#1DA1F2] hover:opacity-90 rounded-lg transition flex items-center justify-center gap-2"
            >
              𝕏 Twitter
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="flex-1 py-2 bg-[#0088cc] hover:opacity-90 rounded-lg transition flex items-center justify-center gap-2"
            >
              ✈️ Telegram
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex-1 py-2 bg-[#25D366] hover:opacity-90 rounded-lg transition flex items-center justify-center gap-2"
            >
              💬 WhatsApp
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-gray-400 text-sm mb-1">Total Referrals</div>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-gray-400 text-sm mb-1">Active Users</div>
            <div className="text-2xl font-bold text-green-400">{stats.activeReferrals}</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-gray-400 text-sm mb-1">Total Earnings</div>
            <div className="text-2xl font-bold text-purple-400">${stats.totalEarnings}</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="text-gray-400 text-sm mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">${stats.pendingEarnings}</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                1️⃣
              </div>
              <h3 className="font-semibold mb-1">Share Your Code</h3>
              <p className="text-sm text-gray-400">Share your unique referral code or link with friends</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                2️⃣
              </div>
              <h3 className="font-semibold mb-1">Friends Sign Up</h3>
              <p className="text-sm text-gray-400">They create an account using your referral code</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                3️⃣
              </div>
              <h3 className="font-semibold mb-1">Earn Rewards</h3>
              <p className="text-sm text-gray-400">Get 10% of their trading fees as commission</p>
            </div>
          </div>
        </div>

        {/* Referred Users */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xl font-bold">Your Referrals</h2>
          </div>
          
          {referrals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              <p>No referrals yet. Start sharing your code!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {referrals.map(ref => (
                <div key={ref.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center font-bold">
                      {ref.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{ref.username}</div>
                      <div className="text-sm text-gray-400">
                        Joined {new Date(ref.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+${ref.earnings}</div>
                    <div className="text-xs text-gray-400">earned</div>
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
