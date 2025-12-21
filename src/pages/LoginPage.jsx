import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

/**
 * Fast login page - NO web3 imports or setup
 * This page loads instantly without ethers or @web3modal
 */
export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ========== EMAIL/PASSWORD LOGIN ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await authAPI.register(formData);
        alert('Registration successful! Please login.');
        setIsRegister(false);
        setFormData({ email: '', password: '', username: '' });
      } else {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin?.(response.user);
        navigate('/app');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ========== WALLET LOGIN (lazy loads web3 only on click) ==========
  const handleWalletLoginClick = async () => {
    setError('');
    setLoading(true);

    try {
      // Only import web3modal setup when user clicks "Connect Wallet"
      const { walletLogin } = await import('../web3modal/setup');
      
      const user = await walletLogin();
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('walletAddress', user.address);
      
      onLogin?.(user);
      navigate('/app');
    } catch (err) {
      if (err.code === 4001) {
        setError('Request cancelled. Please try again.');
      } else if (err.code === -32002) {
        setError('Please check your wallet for pending request.');
      } else {
        setError(err.message || 'Connection failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">OnchainWeb</h1>
          <p className="text-gray-400">DeFi Trading Platform</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Wallet Connect Button */}
        <button
          onClick={handleWalletLoginClick}
          disabled={loading}
          className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Form Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2 rounded-md transition ${
              !isRegister
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2 rounded-md transition ${
              isRegister
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Choose a username"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Your wallet address is your account ID
        </p>
      </div>
    </div>
  );
}
