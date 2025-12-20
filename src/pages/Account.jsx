import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // In production, call API to update profile
    setEditing(false);
    // Show success message
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {/* Profile Card */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-6">
          {/* Header with avatar */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.kycName || user?.username || 'User'}</h2>
                <p className="text-white/70">UID: {user?.id?.slice(0, 8) || 'N/A'}</p>
                {user?.kycStatus === 'verified' && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                    ✓ KYC Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <div className="px-4 py-2 bg-white/5 rounded-lg">{user?.username || 'Not set'}</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <div className="px-4 py-2 bg-white/5 rounded-lg">{user?.email || 'Not set'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
                <div className="px-4 py-2 bg-white/5 rounded-lg text-sm truncate">
                  {user?.walletAddress || user?.wallet_address || 'Not connected'}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Member Since</label>
                <div className="px-4 py-2 bg-white/5 rounded-lg">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-bold mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-gray-400">Add an extra layer of security</div>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Change Password</div>
                <div className="text-sm text-gray-400">Update your password</div>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
