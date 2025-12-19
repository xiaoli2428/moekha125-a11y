import { useState, useEffect, useCallback } from 'react';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers5/react';
import { ethers } from 'ethers';

const API_URL = import.meta.env.VITE_API_URL || 'https://moekha125-a11y.onrender.com/api';

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect specific wallet browser
const detectWalletBrowser = () => {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('coinbase')) return 'coinbase';
  if (ua.includes('metamask')) return 'metamask';
  if (ua.includes('trust')) return 'trust';
  if (window.ethereum?.isMetaMask) return 'metamask';
  if (window.ethereum?.isCoinbaseWallet) return 'coinbase';
  if (window.ethereum?.isTrust) return 'trust';
  return null;
};

export default function MultiWalletConnectV2({ onWalletLogin }) {
  const { open } = useWeb3Modal();
  const { address: modalAddress, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();
  
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [debugInfo, setDebugInfo] = useState('');
  const [walletBrowser, setWalletBrowser] = useState(null);

  useEffect(() => {
    setIsMobileDevice(isMobile());
    setWalletBrowser(detectWalletBrowser());
    
    const checkServer = async () => {
      try {
        // Correct health endpoint path
        const healthUrl = API_URL.replace('/api', '') + '/api/health';
        console.log('🏥 Checking server health:', healthUrl);
        const res = await fetch(healthUrl, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        console.log('🏥 Server response:', data);
        setServerStatus(res.ok && data.status === 'ok' ? 'online' : 'offline');
      } catch (e) {
        console.error('🏥 Server check failed:', e);
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  // Handle Web3Modal connection with retry logic for mobile
  const [providerRetries, setProviderRetries] = useState(0);
  const MAX_PROVIDER_RETRIES = 5;

  useEffect(() => {
    console.log('📡 Connection state changed:', { isConnected, modalAddress, hasProvider: !!walletProvider, retries: providerRetries });
    
    if (isConnected && modalAddress && walletProvider) {
      console.log('✓ All conditions met, attempting login...');
      setProviderRetries(0);
      handleWebModalLogin();
    } else if (isConnected && modalAddress && !walletProvider) {
      console.warn('⚠️ Connected but no provider - retry', providerRetries + 1, '/', MAX_PROVIDER_RETRIES);
      
      if (providerRetries < MAX_PROVIDER_RETRIES) {
        // Wait and increment retry counter
        const timeout = setTimeout(() => {
          setProviderRetries(prev => prev + 1);
        }, 1500);
        return () => clearTimeout(timeout);
      } else {
        // Max retries reached - show clear error
        setError('Wallet connected but provider not available. Please disconnect and try again, or use email login.');
        setConnecting(false);
      }
    }
  }, [isConnected, modalAddress, walletProvider, providerRetries]);

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setProviderRetries(0);
      setError('');
      setSuccessMessage('');
      console.log('🔌 Wallet disconnected');
    } catch (e) {
      console.error('Disconnect error:', e);
    }
  };

  const handleWebModalLogin = async () => {
    if (connecting) return;
    setConnecting(true);
    setError('');
    
    try {
      console.log('🔐 Starting wallet login...');
      console.log('📱 Device:', isMobileDevice ? 'Mobile' : 'Desktop');
      console.log('🔗 Wallet browser:', walletBrowser || 'none detected');
      console.log('💼 Address:', modalAddress);
      console.log('🔌 Provider available:', !!walletProvider);

      if (!walletProvider) {
        throw new Error('Wallet provider not available. Please ensure your wallet is properly connected.');
      }

      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${modalAddress}\nTimestamp: ${timestamp}`;
      
      console.log('✍️ Requesting signature...');
      let signature;
      try {
        signature = await signer.signMessage(message);
        console.log('✓ Signature obtained:', signature.slice(0, 20) + '...');
      } catch (signErr) {
        console.error('❌ Sign error:', signErr);
        throw new Error(`Failed to sign message: ${signErr.message}`);
      }
      
      console.log('📤 Sending auth request to backend...');
      const response = await fetch(`${API_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ address: modalAddress, message, signature }),
      });

      console.log('📊 Backend response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', { status: response.status, hasToken: !!data.token });
      
      if (!response.ok) {
        const errorMsg = data.error || data.message || `Server error: ${response.status}`;
        console.error('❌ Server error:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!data.token) {
        throw new Error('No authentication token received from server');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('walletAddress', modalAddress);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('✓ Login successful!');
      setSuccessMessage(`✓ Logged in as ${modalAddress.slice(0, 10)}...`);
      setTimeout(() => {
        if (onWalletLogin) onWalletLogin(data);
      }, 500);
    } catch (err) {
      console.error('❌ Wallet login error:', err);
      const errorMessage = err.message || 'Connection failed. Please try again.';
      setError(errorMessage);
      
      // Store detailed error info
      const debugData = {
        error: errorMessage,
        stack: err.stack,
        address: modalAddress,
        time: new Date().toISOString(),
        isMobile: isMobileDevice,
        userAgent: navigator.userAgent
      };
      console.error('📋 Debug info:', debugData);
      setDebugInfo(JSON.stringify(debugData, null, 2));
    } finally {
      setConnecting(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setConnecting(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setSuccessMessage(`✓ Logged in as ${email}`);
      setTimeout(() => {
        if (onWalletLogin) onWalletLogin(data);
      }, 500);
    } catch (err) {
      console.error('Email login error:', err);
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const copyDebugInfo = () => {
    const fullDebugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      isMobile: isMobileDevice,
      walletBrowser: walletBrowser,
      isConnected: isConnected,
      hasProvider: !!walletProvider,
      providerRetries: providerRetries,
      address: modalAddress || 'Not connected',
      serverStatus: serverStatus,
      apiUrl: API_URL,
      previousError: error || debugInfo,
      location: window.location.href,
      browserInfo: {
        language: navigator.language,
        onLine: navigator.onLine,
        cookiesEnabled: navigator.cookieEnabled,
        platform: navigator.platform,
        hasEthereum: typeof window !== 'undefined' && !!window.ethereum,
        ethereumInfo: typeof window !== 'undefined' && window.ethereum ? {
          isMetaMask: !!window.ethereum.isMetaMask,
          isCoinbaseWallet: !!window.ethereum.isCoinbaseWallet,
          isTrust: !!window.ethereum.isTrust,
        } : null
      }
    };
    
    const debugText = JSON.stringify(fullDebugInfo, null, 2);
    navigator.clipboard.writeText(debugText).then(() => {
      alert('✓ Debug info copied!\n\nShare this with support if login fails.');
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      console.log('Debug info:', debugText);
      alert('Debug info logged to console (Ctrl+Shift+J to view)');
    });
  };

  return (
    <div className="space-y-4">
      {/* Debug and Status Bar */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500 px-2 py-1 bg-gray-800 rounded">
        <button 
          onClick={copyDebugInfo} 
          className="hover:text-white transition"
          title="Copy debug information for support"
        >
          📋 Debug Info
        </button>
        <div className="flex items-center gap-2">
          {walletBrowser && (
            <span className="text-blue-400">🔗 {walletBrowser}</span>
          )}
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' : 
              serverStatus === 'offline' ? 'bg-red-500' : 
              'bg-yellow-500 animate-pulse'
            }`}></div>
            <span>Server: {serverStatus}</span>
          </div>
        </div>
      </div>

      {/* Connection Status with Disconnect */}
      {isConnected && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm flex items-center justify-between">
          <div>
            ✓ Wallet: {modalAddress?.slice(0, 8)}...{modalAddress?.slice(-6)}
            {connecting && <span className="ml-2 opacity-70">Signing...</span>}
            {!walletProvider && providerRetries > 0 && (
              <span className="ml-2 text-yellow-400">⏳ Waiting for provider ({providerRetries}/{MAX_PROVIDER_RETRIES})</span>
            )}
          </div>
          <button 
            onClick={handleDisconnect}
            className="text-xs px-2 py-1 bg-red-500/20 rounded hover:bg-red-500/30 transition"
          >
            Disconnect
          </button>
        </div>
      )}

      {/* Error Messages with Details */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm space-y-2">
          <div className="font-semibold">❌ {error}</div>
          {isConnected && (
            <button 
              onClick={handleDisconnect}
              className="text-xs px-3 py-1 bg-red-500/30 rounded hover:bg-red-500/40 transition"
            >
              Disconnect & Retry
            </button>
          )}
          <details className="text-xs cursor-pointer">
            <summary className="underline opacity-70">Show technical details</summary>
            <div className="mt-2 p-2 bg-red-900/20 rounded font-mono whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
              {debugInfo || 'No additional details'}
            </div>
          </details>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
          {successMessage}
        </div>
      )}

      {/* Web3Modal - Universal Button */}
      <button
        onClick={() => {
          console.log('🔗 Opening Web3Modal...');
          open();
        }}
        disabled={connecting || !serverStatus === 'online'}
        className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:from-gray-600 disabled:to-gray-700 font-semibold"
      >
        {connecting ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Signing with {isConnected ? 'wallet' : 'wallet'}...</span>
          </>
        ) : isConnected ? (
          <>
            ✓ Wallet Connected - Complete Sign
          </>
        ) : (
          <>
            🔗 Connect Wallet (All devices & wallets)
          </>
        )}
      </button>

      {/* Info for iPhone users */}
      {isMobileDevice && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
          <strong>💡 iPhone Tips:</strong><br/>
          • Tap "Connect Wallet" to open wallet selector<br/>
          • For Coinbase: Ensure you're in the Coinbase app browser, not Safari<br/>
          • For Onchain: Install from App Store if not present<br/>
          • If stuck: Try email login below as backup
        </div>
      )}

      {/* Email/Password Login */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-900 text-gray-500">or login with email</span>
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={connecting}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition disabled:opacity-50 font-medium"
        >
          {connecting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Mobile Deep Links */}
      {isMobileDevice && (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <p className="text-xs text-gray-400 text-center">Open this page in your wallet app:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const host = window.location.host;
                window.location.href = `https://metamask.app.link/dapp/${host}`;
              }}
              className="py-2 px-3 bg-orange-500/10 border border-orange-500/20 rounded text-xs hover:bg-orange-500/20 transition flex items-center justify-center gap-1"
            >
              🦊 MetaMask
            </button>
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                window.location.href = `https://go.cb-w.com/dapp?cb_url=${url}`;
              }}
              className="py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs hover:bg-blue-500/20 transition flex items-center justify-center gap-1"
            >
              💰 Coinbase
            </button>
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                window.location.href = `https://link.trustwallet.com/open_url?url=${url}`;
              }}
              className="py-2 px-3 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs hover:bg-cyan-500/20 transition flex items-center justify-center gap-1"
            >
              🛡️ Trust
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('URL copied! Paste it in your wallet app browser.');
              }}
              className="py-2 px-3 bg-purple-500/10 border border-purple-500/20 rounded text-xs hover:bg-purple-500/20 transition flex items-center justify-center gap-1"
            >
              📋 Copy URL
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-2">
        {isConnected 
          ? (walletProvider 
              ? '✓ Wallet ready. Complete sign to login.' 
              : '⏳ Waiting for wallet provider...')
          : 'Click "Connect Wallet" to get started'}
      </p>
    </div>
  );
}
