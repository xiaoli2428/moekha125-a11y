import { useState, useEffect } from 'react';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers5/react';
import { ethers } from 'ethers';

const API_URL = import.meta.env.VITE_API_URL || 'https://onchainweb-api-production.up.railway.app/api';

export default function UniversalLogin({ onLogin }) {
  // Auth mode: 'wallet' | 'email-login' | 'email-register'
  const [authMode, setAuthMode] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // Web3Modal hooks
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();

  // Server status
  const [serverOnline, setServerOnline] = useState(null);

  // Check if mobile
  const isMobile = typeof window !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Check server health on mount
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(r => r.json())
      .then(d => setServerOnline(d.status === 'ok'))
      .catch(() => setServerOnline(false));
  }, []);

  // Auto-login when wallet connected
  useEffect(() => {
    if (isConnected && address && walletProvider && !loading) {
      handleWalletLogin();
    }
  }, [isConnected, address, walletProvider]);

  // ========== WALLET LOGIN ==========
  const handleWalletLogin = async () => {
    if (!address || !walletProvider) {
      setError('Wallet not properly connected. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create ethers provider and signer
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();

      // Create message to sign
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;

      // Request signature
      const signature = await signer.signMessage(message);

      // Send to backend
      const response = await fetch(`${API_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Wallet login failed');
      }

      // Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('Login successful!');
      setTimeout(() => onLogin?.(data), 500);

    } catch (err) {
      console.error('Wallet login error:', err);
      setError(err.message || 'Failed to login with wallet');
      // Disconnect on error so user can retry
      try { await disconnect(); } catch { }
    } finally {
      setLoading(false);
    }
  };

  // ========== EMAIL REGISTER ==========
  const handleEmailRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Please login now.');
      setAuthMode('email-login');
      setPassword('');
      setUsername('');

    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  // ========== EMAIL LOGIN ==========
  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('Login successful!');
      setTimeout(() => onLogin?.(data), 500);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">OnchainWeb</h1>
          <p className="text-gray-400">
            {authMode === 'wallet' && 'Connect your wallet to login'}
            {authMode === 'email-login' && 'Login to your account'}
            {authMode === 'email-register' && 'Create a new account'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          {/* Server Status */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
            <div className={`w-2 h-2 rounded-full ${serverOnline === null ? 'bg-yellow-500 animate-pulse' :
                serverOnline ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            <span>Server: {serverOnline === null ? 'Checking...' : serverOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg p-3 mb-4 text-sm">
              {success}
            </div>
          )}

          {/* ========== WALLET MODE ========== */}
          {authMode === 'wallet' && (
            <div className="space-y-4">
              {/* Connected Status */}
              {isConnected && (
                <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
                  <span>✓ {address?.slice(0, 8)}...{address?.slice(-6)}</span>
                  <button
                    onClick={() => disconnect()}
                    className="text-xs px-2 py-1 bg-red-500/20 rounded hover:bg-red-500/30"
                  >
                    Disconnect
                  </button>
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={() => open()}
                disabled={loading || serverOnline === false}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-semibold text-white flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Signing in...</span>
                  </>
                ) : isConnected ? (
                  '✓ Complete Sign In'
                ) : (
                  '🔗 Connect Wallet'
                )}
              </button>

              {/* Mobile Deep Links */}
              {isMobile && !isConnected && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center">Or open in wallet app:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.location.href = `https://metamask.app.link/dapp/${window.location.host}`}
                      className="py-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs"
                    >
                      🦊 MetaMask
                    </button>
                    <button
                      onClick={() => window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`}
                      className="py-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs"
                    >
                      💰 Coinbase
                    </button>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-gray-900 text-gray-500 text-sm">or use email</span>
                </div>
              </div>

              {/* Email Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAuthMode('email-login')}
                  className="py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-white text-sm"
                >
                  Login with Email
                </button>
                <button
                  onClick={() => setAuthMode('email-register')}
                  className="py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-white text-sm"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* ========== EMAIL LOGIN MODE ========== */}
          {authMode === 'email-login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading || serverOnline === false}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-semibold text-white"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setAuthMode('email-register'); setError(''); }}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Need an account? Register
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('wallet'); setError(''); }}
                  className="text-gray-400 hover:text-white"
                >
                  Use Wallet
                </button>
              </div>
            </form>
          )}

          {/* ========== EMAIL REGISTER MODE ========== */}
          {authMode === 'email-register' && (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading || serverOnline === false}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-semibold text-white"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setAuthMode('email-login'); setError(''); }}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Already have an account? Login
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('wallet'); setError(''); }}
                  className="text-gray-400 hover:text-white"
                >
                  Use Wallet
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-500 text-xs mt-4">
          {authMode === 'wallet' && 'Connect any Web3 wallet to login instantly - no registration needed'}
          {authMode === 'email-login' && 'Enter your registered email and password'}
          {authMode === 'email-register' && 'Create an account, then login with your email'}
        </p>
      </div>
    </div>
  );
}
