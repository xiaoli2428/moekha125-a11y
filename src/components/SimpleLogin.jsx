import { useState, useEffect } from 'react';

const API_URL = 'https://moekha125-a11y.onrender.com/api';

export default function SimpleLogin({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState('');
  const [hasEthereum, setHasEthereum] = useState(false);

  useEffect(() => {
    // Check if ethereum is available
    setHasEthereum(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

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
      setError(err.message || 'Login failed. Please try again.');
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
      
      setSuccess('Account created! Please login.');
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ========== WALLET LOGIN ==========
  const handleWalletLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check for ethereum provider
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please open this page in your wallet app browser.');
      }
      
      // Request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }
      
      const address = accounts[0];
      setWalletAddress(address);
      
      // Create message
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;
      
      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      
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
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('walletAddress', address);
      
      setSuccess('Wallet connected!');
      setTimeout(() => onLogin?.(data), 500);
      
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

  const isMobile = typeof window !== 'undefined' && 
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">OnchainWeb</h1>
          <p className="text-gray-400 text-sm">
            {mode === 'login' && 'Login to your account'}
            {mode === 'register' && 'Create a new account'}
            {mode === 'wallet' && 'Connect your wallet'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg p-3 mb-4 text-sm">
              {success}
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                mode === 'login' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                mode === 'register' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => { setMode('wallet'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                mode === 'wallet' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Wallet
            </button>
          </div>

          {/* ========== LOGIN FORM ========== */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ========== REGISTER FORM ========== */}
          {mode === 'register' && (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="username"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="At least 6 characters"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ========== WALLET SECTION ========== */}
          {mode === 'wallet' && (
            <div className="space-y-4">
              {hasEthereum ? (
                <div className="space-y-4">
                  {walletAddress && (
                    <div className="text-center text-sm text-gray-400">
                      Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                  )}
                  
                  <button
                    onClick={handleWalletLogin}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        Connecting...
                      </>
                    ) : (
                      <>
                        🔗 Connect & Sign
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Click to connect your wallet and sign a message to login
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {isMobile ? (
                    <div className="space-y-3">
                      <p className="text-gray-400 text-sm text-center mb-4">
                        Open this page in your wallet app:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={`https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`}
                          className="py-3 bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm text-center hover:bg-orange-500/30 transition"
                        >
                          🦊 MetaMask
                        </a>
                        <a
                          href={`https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`}
                          className="py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-center hover:bg-blue-500/30 transition"
                        >
                          💰 Coinbase
                        </a>
                        <a
                          href={`https://link.trustwallet.com/open_url?url=${encodeURIComponent(window.location.href)}`}
                          className="py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm text-center hover:bg-cyan-500/30 transition"
                        >
                          🛡️ Trust
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setSuccess('URL copied! Paste in your wallet browser.');
                            setTimeout(() => setSuccess(''), 3000);
                          }}
                          className="py-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/30 transition"
                        >
                          📋 Copy URL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-gray-400 text-sm">
                        Please install a Web3 wallet extension like MetaMask to continue.
                      </p>
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block py-3 px-6 bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm hover:bg-orange-500/30 transition"
                      >
                        🦊 Install MetaMask
                      </a>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                No registration required for wallet login
              </p>
            </div>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-gray-500 text-xs mt-4">
          {mode === 'login' && 'Need an account? Switch to Register tab'}
          {mode === 'register' && 'Already have an account? Switch to Login tab'}
          {mode === 'wallet' && 'Connect any Web3 wallet to get started'}
        </p>
      </div>
    </div>
  );
}
