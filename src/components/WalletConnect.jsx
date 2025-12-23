import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { authAPI } from '../services/api';

export default function WalletConnect({ onWalletLogin }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to connect your wallet.');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      setWalletAddress(address);

      // Create a message to sign for authentication
      const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;

      // Request signature
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      // Send to backend for verification
      const data = await authAPI.walletLogin(address, message, signature);

      // Store token and notify parent
      localStorage.setItem('token', data.token);
      localStorage.setItem('walletAddress', address);

      if (onWalletLogin) {
        onWalletLogin(data);
      }

    } catch (err) {
      console.error('Wallet connection error:', err);
      if (err.code === 4001) {
        setError('You rejected the connection request');
      } else if (err.code === -32002) {
        setError('Please check MetaMask - a connection request is pending');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setConnecting(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setWalletAddress('');
          localStorage.removeItem('walletAddress');
        } else {
          setWalletAddress(accounts[0]);
        }
      });
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={connectMetaMask}
        disabled={connecting}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {connecting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            {/* MetaMask Fox Icon */}
            <svg className="w-6 h-6" viewBox="0 0 318.6 318.6" fill="none">
              <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="m274.1 35.5-99.5 73.9L193 65.8z" />
              <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="m44.4 35.5 98.7 74.6-17.5-44.3zm193.9 171.3-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9 16.2 55.3 56.7-15.6-26.5-40.6z" />
              <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="m103.6 138.2-15.8 23.9 56.3 2.5-2-60.5zm111.3 0-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5 33.9 16.5-4.7-39.3z" />
              <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="m211.8 247.4-33.9-16.5 2.7 22.1-.3 9.3zm-105 0 31.5 14.9-.2-9.3 2.5-22.1z" />
              <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="m138.8 193.5-28.2-8.3 19.9-9.1zm40.9 0 8.3-17.4 20 9.1z" />
              <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="m106.8 247.4 4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1 20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z" />
              <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="m87.8 162.1 23.6 46-.8-22.9zm120.3 23.1-.9 22.9 23.7-46zm-64-20.6-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0-2.7 18 1.2 45 6.7-34.1z" />
              <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="m179.8 193.5-6.7 34.1 4.8 3.3 29.2-22.8.9-22.9zm-69.2-8.3.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z" />
              <path fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" d="m180.3 262.3.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z" />
              <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="m177.9 230.9-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z" />
              <path fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" d="m278.3 114.2 8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z" />
              <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="m267.2 153.5-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4 3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z" />
            </svg>
            <span>Connect with MetaMask</span>
          </>
        )}
      </button>

      {!isMetaMaskInstalled() && (
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-3 border border-orange-500 text-orange-400 rounded-lg hover:bg-orange-500/10 transition-colors"
        >
          Install MetaMask
        </a>
      )}

      {walletAddress && (
        <div className="text-center text-gray-400 text-sm">
          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      )}
    </div>
  );
}
