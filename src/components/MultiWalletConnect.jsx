import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Wallet icons
const walletIcons = {
  metamask: "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjM1NSIgdmlld0JveD0iMCAwIDM5NyAzNTUiIHdpZHRoPSIzOTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSAtMSkiPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTIuMDA0NzE3IDEzLjgxMDE5OHYtMTguMDU5NDlsNC4yNDUyODMtNC4yNDkyOTJoMjkuNzE2OTgydjIxLjI0NjQ1OSAxNC44NzI1MjNoLTMxLjgzOTYyNGwtMzkuMjY4ODY4LTE2Ljk5NzE2OXoiIGZpbGw9IiNjZGJkYjIiLz48cGF0aCBkPSJtMTk5LjUyODMwNSAzMjcuMTk1NDcyIDUwLjk0MzM5NyAxMy44MTAxOTh2LTE4LjA1OTQ5bDQuMjQ1MjgzLTQuMjQ5MjkyaDI5LjcxNjk4MXYyMS4yNDY0NTkgMTQuODcyNTIzaC0zMS44Mzk2MjNsLTM5LjI2ODg2OC0xNi45OTcxNjl6IiBmaWxsPSIjY2RiZGIyIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSA0ODMuOTYyMjcgMCkiLz48cGF0aCBkPSJtMTcwLjg3MjY0NCAyODcuODg5NTIzLTQuMjQ1MjgzIDM1LjA1NjY1NyA1LjMwNjYwNC00LjI0OTI5Mmg1NS4xODg2OGw2LjM2NzkyNSA0LjI0OTI5Mi00LjI0NTI4NC0zNS4wNTY2NTctOC40OTA1NjUtNS4zMTE2MTUtNDIuNDUyODMgMS4wNjIzMjN6IiBmaWxsPSIjMzkzOTM5Ii8+PHBhdGggZD0ibTE0Mi4yMTYwODQgNTAuOTkxNTAyMiAyNS40NzE2OTggNTkuNDkwMDg1OCAxMS42NzQ1MjggMTczLjE1ODY0M2g0MS4zOTE1MTFsMTIuNzM1ODQ5LTE3My4xNTg2NDMgMjMuMzQ5MDU2LTU5LjQ5MDA4NTh6IiBmaWxsPSIjZjg5YzM1Ii8+PHBhdGggZD0ibTMwLjc3ODM0NjEgMTgxLjY1NzIyNi05LjU1MTg4NjggODAuOTc4NTMzaDU0LjEyNjE3ODdsNC4yNDUyODMtNjcuMTY4MTAzbDcuNDI5MjQ1My0yMy43NDY2MSA0OS44MjAzNi0uMTAxMjQ4bDguNDYxNzQ1LTIuMDI0NTAzIDEyLjc4Mjg4LTE2Ljg1NTQ2NnoiIGZpbGw9IiNmODljMzUiLz48cGF0aCBkPSJtODcuMDI4MzQ0OCAyMDcuNzM5MTY5IDUxLjM2NzE2NDIgMS43NDA3NyAyNC42MTczNzMgNDUuNjA5NjIxIDI1LjQ0ODc4NC0xMS41NTU4MjVjMCAuMDAzMjM2LjAwMDU5Mi0uMTI5MjI5LjAwMDU5Mi0uNDQyNjQ5bC0uMDAwNTkyLS41NTAwMzZjLTEuOTI2Mzc5LTEzLjY4Njg3LTEyLjUxNjY1My0yNC44MjY4Mi0yNi4yMzU1ODUtMjYuNjk1OTMxaC0uMDc5MjkzYy0xLjEyNzg5OC0uMTU0MDM4LTIuMjc4MjIyLS4yMzY0NTQtMy40MzQ4ODItLjI0Njk0OGgtLTY0LjU0NDMxNWMtNC43Mzc0MzItLjEzOTQzLTguNzc4NDUzIDMuMTQ3NDUtOS4xMTkwNTcgNy40Mjk2N2wtMy4wOTI2NjQgMTguMTYzNTYyIDUuMDcxNzI2LTMyLjQ1MzIzNHoiIGZpbGw9IiNkODdjMzAiLz48cGF0aCBkPSJtODcuMDI4MzQ0OCAyMDcuNzM5MTY5IDEuMDE2OTk0NiA1OS4wMTcxNTEtNS4xNjk4MTI2LTQ4LjExNjI4NnoiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTM1LjU4Njg3NCAyNzMuNjg0NTc5IDEuMjIxNTMyIDI1LjgyNDE0OSAyMi4wMTQ4NjItMTcuMjc2NDQzIDI4LjY2MDgzNyAzLjM0Nzg1LTE1LjE0NjI0NS0zOC40NjAwNzgiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTc0Ljc2NjM3MyAyNjAuMTc5NDYgMS41NzI0ODUgMS41NjE3Njl2MTEuMzM4ODgxbC0yMy4wNDM1MzItNC42NjM2NjQgMTMuOTQ5OTU5LTI5LjUxNzI0MnoiIGZpbGw9IiNkODdjMzAiLz48L2c+PC9zdmc+",
  walletconnect: "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJhZGlhbEdyYWRpZW50IGlkPSJhIiBjeD0iMCUiIGN5PSI1MCUiIHI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzVkOWRmNiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwNmZmZiIvPjwvcmFkaWFsR3JhZGllbnQ+PHBhdGggZD0ibTI1NiAwYzE0MS4zODUgMCAyNTYgMTE0LjYxNSAyNTYgMjU2cy0xMTQuNjE1IDI1Ni0yNTYgMjU2LTI1Ni0xMTQuNjE1LTI1Ni0yNTYgMTE0LjYxNS0yNTYgMjU2LTI1NnoiIGZpbGw9InVybCgjYSkiLz48cGF0aCBkPSJtNjQuNjkxNzU1OCAyMzcuNzQ4NzYzNWMuMDMxNDE1OC01OS40MTYyNzk1IDQ4LjIwNzY5NTItMTA3LjU4Njk2NiAxMDcuNjI2OTI5Mi0xMDcuNjE4MzYzMWg2Mi4zNjI2M2M1OS40MTkyMzQtLjAzMTM5NzEgMTA3LjU5NTY1IDQ4LjEzODk4ODYgMTA3LjYyNzA2NiAxMDcuNTU1MjY4MWwuMDMxNDE1IDU5LjQ3ODcxOTVjLjAzMTQxNSA1OS40MTYyOC00OC4xNDUyNTQgMTA3LjU4Njk2Ni0xMDcuNTY0NDg4IDEwNy42MTgzNjNoLTYyLjM2MjYzMWMtNTkuNDE5MjMzNy4wMzE0LTEwNy41OTU2NDg2LTQ4LjEzODk4OC0xMDcuNjI3MDY0Mi0xMDcuNTU1MjY4em0xMDcuNjI2OTI5Mi00Ni4zNzMzNjg1Yy00Ni44Njk5MDIgMC04NC44NzM4NDUgMzguMDAzOTM3LTg0Ljg3Mzg0NSA4NC44NzM4NDUgMCA0Ni44Njk5MDcgMzguMDAzOTQzIDg0Ljg3Mzg0NSA4NC44NzM4NDUgODQuODczODQ1aDYyLjM2MjYzYzQ2Ljg2OTkgMCA4NC44NzM4NDUtMzguMDAzOTM4IDg0Ljg3Mzg0NS04NC44NzM4NDUgMC00Ni44Njk5MDgtMzguMDAzOTQ1LTg0Ljg3Mzg0NS04NC44NzM4NDUtODQuODczODQ1em02OC43MDgwODMgNTMuNjkxNTgxNWMyMC41ODc4NTIgMjAuNTg3ODUyIDIwLjU4Nzg1MiA1My45NjcxMDQgMCA3NC41NTQ5NTZsLTYyLjM2MjYzIDYyLjM2MjYzYy0yMC41ODc4NTIgMjAuNTg3ODUyLTUzLjk2NzEwNCAyMC41ODc4NTItNzQuNTU0OTU2IDBsLTYyLjM2MjYzLTYyLjM2MjYzYy0yMC41ODc4NTItMjAuNTg3ODUyLTIwLjU4Nzg1Mi01My45NjcxMDQgMC03NC41NTQ5NTZsNjIuMzYyNjMtNjIuMzYyNjNjMjAuNTg3ODUyLTIwLjU4Nzg1MTkgNTMuOTY3MTA0LTIwLjU4Nzg1MTkgNzQuNTU0OTU2IDB6IiBmaWxsPSIjZmZmIi8+PC9zdmc+",
  coinbase: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSIjMDA1MkZGIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNTEyIDc2OEM2NTMuNTA0IDc2OCA3NjggNjUzLjUwNCA3NjggNTEyQzc2OCAzNzAuNDk2IDY1My41MDQgMjU2IDUxMiAyNTZDMzcwLjQ5NiAyNTYgMjU2IDM3MC40OTYgMjU2IDUxMkMyNTYgNjUzLjUwNCAzNzAuNDk2IDc2OCA1MTIgNzY4Wk00MjEuMzMzIDQ2OS4zMzNDNDQ0LjY2NyA0NjkuMzMzIDQ2OS4zMzMgNDQ0LjY2NyA0NjkuMzMzIDQyMS4zMzNDNDY5LjMzMyA0MTMuMzMzIDQ2OS4zMzMgMzg0IDUxMiAzODRDNTU0LjY2NyAzODQgNTU0LjY2NyA0MTMuMzMzIDU1NC42NjcgNDIxLjMzM0M1NTQuNjY3IDQ0NC42NjcgNTc5LjMzMyA0NjkuMzMzIDYwMi42NjcgNDY5LjMzM0M2MTAuNjY3IDQ2OS4zMzMgNjQwIDQ2OS4zMzMgNjQwIDUxMkM2NDAgNTU0LjY2NyA2MTAuNjY3IDU1NC42NjcgNjAyLjY2NyA1NTQuNjY3QzU3OS4zMzMgNTU0LjY2NyA1NTQuNjY3IDU3OS4zMzMgNTU0LjY2NyA2MDIuNjY3QzU1NC42NjcgNjEwLjY2NyA1NTQuNjY3IDY0MCA1MTIgNjQwQzQ2OS4zMzMgNjQwIDQ2OS4zMzMgNjEwLjY2NyA0NjkuMzMzIDYwMi42NjdDNDY5LjMzMyA1NzkuMzMzIDQ0NC42NjcgNTU0LjY2NyA0MjEuMzMzIDU1NC42NjdDNDEzLjMzMyA1NTQuNjY3IDM4NCA1NTQuNjY3IDM4NCA1MTJDMzg0IDQ2OS4zMzMgNDEzLjMzMyA0NjkuMzMzIDQyMS4zMzMgNDY5LjMzM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
  trust: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjUxMiIgZmlsbD0iIzBCMTQyNiIvPgo8cGF0aCBkPSJNNTEyIDI1NkM1MTIgMjU2IDY5NiAzMjAgNjk2IDQ4MEM2OTYgNjQwIDY1NiA3NjggNTEyIDc2OEMzNjggNzY4IDMyOCA2NDAgMzI4IDQ4MEMzMjggMzIwIDUxMiAyNTYgNTEyIDI1NloiIHN0cm9rZT0iIzMzNzVCQiIgc3Ryb2tlLXdpZHRoPSI2NCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo="
};

export default function MultiWalletConnect({ onWalletLogin }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWallets, setShowWallets] = useState(true);

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: walletIcons.metamask, available: typeof window !== 'undefined' && window.ethereum?.isMetaMask },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: walletIcons.coinbase, available: typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet },
    { id: 'trust', name: 'Trust Wallet', icon: walletIcons.trust, available: typeof window !== 'undefined' && window.ethereum?.isTrust },
    { id: 'walletconnect', name: 'WalletConnect', icon: walletIcons.walletconnect, available: true },
    { id: 'injected', name: 'Browser Wallet', icon: walletIcons.metamask, available: typeof window !== 'undefined' && !!window.ethereum }
  ];

  const connectWallet = async (walletId) => {
    setConnecting(true);
    setError('');
    setSelectedWallet(walletId);

    try {
      let provider;
      let accounts;

      if (walletId === 'walletconnect') {
        // For WalletConnect, we'll use a simple QR code approach
        setError('WalletConnect: Please use a browser wallet or install MetaMask');
        setConnecting(false);
        return;
      }

      // Use injected provider (works for MetaMask, Coinbase, Trust, etc.)
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install a Web3 wallet.');
      }

      // Request accounts
      accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];

      // Create a message to sign
      const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;

      // Request signature
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      // Send to backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Wallet authentication failed');
      }

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
        setError('Please check your wallet - a connection request is pending');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Wallet Options */}
      <div className="grid grid-cols-2 gap-3">
        {wallets.filter(w => w.available || w.id === 'walletconnect').map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => connectWallet(wallet.id)}
            disabled={connecting}
            className={`flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition disabled:opacity-50 ${
              selectedWallet === wallet.id ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <img src={wallet.icon} alt={wallet.name} className="w-8 h-8" />
            <span className="font-medium text-sm">{wallet.name}</span>
            {connecting && selectedWallet === wallet.id && (
              <div className="ml-auto">
                <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-400 text-center">
        Connect your wallet to access your account. Supports MetaMask, Coinbase, Trust Wallet, and more.
      </p>
    </div>
  );
}
