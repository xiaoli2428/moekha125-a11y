import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://moekha125-a11y.onrender.com/api';

// Retry fetch with timeout and exponential backoff
const fetchWithRetry = async (url, options = {}, retries = 3, timeout = 15000) => {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      console.log(`Attempt ${i + 1}/${retries} failed:`, err.message);
      
      if (i === retries - 1) throw err;
      
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};

export default function SimpleLogin({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'wallet'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [debugLog, setDebugLog] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState('');
  const [hasEthereum, setHasEthereum] = useState(false);

  const addLog = (msg) => {
    console.log(msg);
    setDebugLog(prev => [...prev.slice(-15), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  // Check server with retry logic
  const checkServer = useCallback(async () => {
    setServerStatus('checking');
    addLog('Checking server connection...');
    
    try {
      const response = await fetchWithRetry(`${API_URL}/health`, {}, 3, 10000);
      
      if (response.ok) {
        setServerStatus('online');
        addLog('✅ Server online');
        setRetryCount(0);
        return true;
      } else {
        throw new Error(`Status: ${response.status}`);
      }
    } catch (err) {
      const errorMsg = err.name === 'AbortError' ? 'Timeout' : err.message;
      addLog(`❌ Server check failed: ${errorMsg}`);
      setServerStatus('offline');
      return false;
    }
  }, []);

  // Check server and ethereum on mount
  useEffect(() => {
    addLog('Component mounted');
    checkServer();
    
    // Check if ethereum is available
    setHasEthereum(typeof window !== 'undefined' && !!window.ethereum);
    
    // Retry server check periodically if offline
    const interval = setInterval(() => {
      if (serverStatus === 'offline') {
        setRetryCount(prev => prev + 1);
        checkServer();
      }
    }, 30000); // Retry every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkServer, serverStatus]);

  // ========== EMAIL LOGIN ==========
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    addLog('Email login started');
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      addLog(`Sending login request...`);
      const response = await fetchWithRetry(`${API_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }, 3, 20000);
      
      addLog(`Response status: ${response.status}`);
      const data = await response.json();
      addLog(`Got data: ${data.token ? 'has token' : 'no token'}`);
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      addLog('Login successful, calling onLogin');
      setSuccess('Login successful!');
      setTimeout(() => onLogin?.(data), 500);
    } catch (err) {
      addLog(`Login error: ${err.message}`);
      const errorMsg = err.name === 'AbortError' 
        ? 'Connection timeout. Please check your internet and try again.'
        : err.message || 'Network error - please try again';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ========== EMAIL REGISTER ==========
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    addLog('Register started');
    
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
      addLog('📝 Attempting registration...');
      const response = await fetchWithRetry(`${API_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      }, 3, 20000);
      
      const data = await response.json();
      addLog(`📝 Register response: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      setSuccess('Account created! Please login.');
      setMode('login');
      setPassword('');
    } catch (err) {
      addLog(`📝 Register error: ${err.message}`);
      const errorMsg = err.name === 'AbortError' 
        ? 'Connection timeout. Please check your internet and try again.'
        : err.message || 'Network error - please try again';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ========== WALLET LOGIN (Direct window.ethereum) ==========
  const handleWalletLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      addLog('🔗 Starting wallet login...');
      
      // Check for ethereum provider
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install MetaMask or use a wallet browser.');
      }
      
      // Request accounts
      addLog('🔗 Requesting accounts...');
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }
      
      const address = accounts[0];
      setWalletAddress(address);
      addLog(`🔗 Got address: ${address.slice(0, 10)}...`);
      
      // Create message
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;
      
      // Request signature using personal_sign
      addLog('🔗 Requesting signature...');
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      
      addLog('🔗 Got signature, sending to backend...');
      
      // Send to backend with retry
      const response = await fetchWithRetry(`${API_URL}/auth/wallet-login`, {
        method: 'POST',
        body: JSON.stringify({ address, message, signature })
      }, 3, 20000);
      
      const data = await response.json();
      addLog(`🔗 Backend response: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(data.error || 'Wallet login failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('walletAddress', address);
      
      setSuccess('Wallet login successful!');
      setTimeout(() => onLogin?.(data), 500);
      
    } catch (err) {
      addLog(`🔗 Wallet error: ${err.message}`);
      
      // Handle user rejection
      if (err.code === 4001) {
        setError('You rejected the request. Please try again.');
      } else if (err.code === -32002) {
        setError('Request pending. Please check your wallet.');
      } else if (err.name === 'AbortError') {
        setError('Connection timeout. Please check your internet and try again.');
      } else {
        setError(err.message || 'Wallet connection failed');
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
          {/* Server Status + Retry/Test Buttons */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500' : 
                serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span>Server: {serverStatus}</span>
              {serverStatus === 'offline' && (
                <button
                  onClick={() => checkServer()}
                  className="text-yellow-400 hover:text-yellow-300 underline ml-2"
                >
                  Retry
                </button>
              )}
            </div>
            <button
              onClick={async () => {
                addLog('Testing API directly...');
                try {
                  const r = await fetchWithRetry(`${API_URL}/health`, {}, 2, 15000);
                  const d = await r.json();
                  addLog(`API test result: ${JSON.stringify(d)}`);
                  alert(`API Test: ${r.ok ? 'SUCCESS' : 'FAILED'}\n${JSON.stringify(d)}`);
                  if (r.ok) setServerStatus('online');
                } catch (e) {
                  addLog(`API test error: ${e.message}`);
                  alert(`API Test Error: ${e.message}\n\nIf server is blocked in your region, try using a VPN or contact support.`);
                }
              }}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Test API
            </button>
          </div>

          {/* Offline Warning */}
          {serverStatus === 'offline' && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg p-3 mb-4 text-sm">
              ⚠️ Server unreachable. This may be due to network restrictions in your region. 
              Try using a VPN or different network connection.
              {retryCount > 0 && <span className="ml-2">(Retry #{retryCount})</span>}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg p-3 mb-4 text-sm">
              ✓ {success}
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
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading || serverStatus === 'offline'}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Logging in...' : 'Login'}
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
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="johndoe"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              <button
                type="submit"
                disabled={loading || serverStatus === 'offline'}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ========== WALLET LOGIN ========== */}
          {mode === 'wallet' && (
            <div className="space-y-4">
              {walletAddress && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
                  ✓ Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                </div>
              )}

              {hasEthereum ? (
                <button
                  onClick={handleWalletLogin}
                  disabled={loading || serverStatus === 'offline'}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>🔗 Connect & Sign</>
                  )}
                </button>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ No wallet detected in this browser
                  </p>
                  
                  {isMobile ? (
                    <div className="space-y-3">
                      <p className="text-gray-400 text-xs">Open this site in your wallet app:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://metamask.app.link/dapp/${window.location.host}`}
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
                            alert('URL copied! Paste in your wallet browser.');
                          }}
                          className="py-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/30 transition"
                        >
                          📋 Copy URL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Please install MetaMask or another Web3 wallet.
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                Wallet login doesn't require registration
              </p>
            </div>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-gray-500 text-xs mt-4">
          {mode === 'login' && 'Need an account? Switch to Register tab'}
          {mode === 'register' && 'Already have an account? Switch to Login tab'}
          {mode === 'wallet' && 'Connect any Web3 wallet - no registration needed'}
        </p>

        {/* Debug Log */}
        {debugLog.length > 0 && (
          <div className="mt-4 p-3 bg-black/50 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Debug Log:</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(debugLog.join('\n'))
                    .then(() => alert('Log copied!'));
                }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Copy
              </button>
            </div>
            <div className="text-[10px] text-gray-500 font-mono max-h-32 overflow-y-auto">
              {debugLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Debug info button */}
        <button
          onClick={() => {
            const info = {
              url: window.location.href,
              userAgent: navigator.userAgent,
              hasEthereum: !!window.ethereum,
              serverStatus,
              apiUrl: API_URL,
              debugLog,
              timestamp: new Date().toISOString()
            };
            navigator.clipboard.writeText(JSON.stringify(info, null, 2))
              .then(() => alert('Debug info copied!'))
              .catch(() => console.log('Debug:', info));
          }}
          className="w-full mt-4 py-2 text-xs text-gray-500 hover:text-gray-400"
        >
          📋 Copy Full Debug Info
        </button>
      </div>
    </div>
  );
}
