import { useState, useEffect } from 'react';

// Use relative path - will work on same domain (Vercel)
const API_URL = '/api';

export default function SimpleLogin({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState('');
  const [hasEthereum, setHasEthereum] = useState(false);

  useEffect(() => {
    // Check if ethereum is available
    setHasEthereum(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

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
      
      setSuccess('Wallet connected successfully!');
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

  const getWalletDeepLinks = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    return [
      {
        name: 'Coinbase Wallet',
        icon: '🔵',
        url: `https://go.cb-w.com/dapp?cb_url=${currentUrl}`
      },
      {
        name: 'MetaMask',
        icon: '🦊',
        url: `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
      },
      {
        name: 'Trust Wallet',
        icon: '🛡️',
        url: `https://link.trustwallet.com/open_url?coin_id=60&url=${currentUrl}`
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">OnchainWeb</h1>
          <p className="text-gray-400 text-sm">
            Connect your wallet to get started
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

          {/* Connected wallet display */}
          {walletAddress && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 mb-4 text-center">
              <span className="text-purple-300 text-sm">
                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          )}

          {/* Main wallet connect button */}
          {hasEthereum ? (
            <button
              onClick={handleWalletLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold text-white flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Connecting...
                </>
              ) : (
                <>
                  <span className="text-2xl">🔗</span>
                  Connect Wallet
                </>
              )}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                {isMobile 
                  ? 'Open this page in your wallet app to connect' 
                  : 'Install a wallet extension like MetaMask to connect'}
              </p>
            </div>
          )}

          {/* Mobile deep links */}
          {isMobile && !hasEthereum && (
            <div className="mt-4">
              <p className="text-gray-400 text-xs text-center mb-3">
                Or open with your wallet app:
              </p>
              <div className="space-y-2">
                {getWalletDeepLinks().map((wallet) => (
                  <a
                    key={wallet.name}
                    href={wallet.url}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    <span>{wallet.icon}</span>
                    <span>{wallet.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Desktop install links */}
          {!isMobile && !hasEthereum && (
            <div className="mt-4">
              <p className="text-gray-400 text-xs text-center mb-3">
                Get a wallet:
              </p>
              <div className="flex gap-2 justify-center">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
                >
                  MetaMask
                </a>
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
                >
                  Coinbase Wallet
                </a>
              </div>
            </div>
          )}

          {/* Footer text */}
          <p className="text-gray-500 text-xs text-center mt-6">
            By connecting, you agree to our Terms of Service
          </p>
        </div>

        {/* Help link */}
        <div className="text-center mt-4">
          <p className="text-gray-500 text-xs">
            Having trouble? Make sure you're using a supported wallet
          </p>
        </div>
      </div>
    </div>
  );
}
