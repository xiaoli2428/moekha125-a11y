import { useState, useEffect } from 'react';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react';
import { ethers } from 'ethers';

// Production API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://onchainweb-api-production.up.railway.app/api';

// Detect if we're on mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if we're inside a wallet browser (dApp browser)
const isWalletBrowser = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('trustwallet') ||
    ua.includes('metamask') ||
    ua.includes('coinbase') ||
    ua.includes('tokenpocket') ||
    ua.includes('imtoken') ||
    ua.includes('bitkeep') ||
    window.ethereum?.isTrust ||
    window.ethereum?.isMetaMask ||
    window.ethereum?.isCoinbaseWallet
  );
};

// Wallet icons
const walletIcons = {
  metamask: "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjM1NSIgdmlld0JveD0iMCAwIDM5NyAzNTUiIHdpZHRoPSIzOTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSAtMSkiPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTIuMDA0NzE3IDEzLjgxMDE5OHYtMTguMDU5NDlsNC4yNDUyODMtNC4yNDkyOTJoMjkuNzE2OTgydjIxLjI0NjQ1OSAxNC44NzI1MjNoLTMxLjgzOTYyNGwtMzkuMjY4ODY4LTE2Ljk5NzE2OXoiIGZpbGw9IiNjZGJkYjIiLz48cGF0aCBkPSJtMTk5LjUyODMwNSAzMjcuMTk1NDcyIDUwLjk0MzM5NyAxMy44MTAxOTh2LTE4LjA1OTQ5bDQuMjQ1MjgzLTQuMjQ5MjkyaDI5LjcxNjk4MXYyMS4yNDY0NTkgMTQuODcyNTIzaC0zMS44Mzk2MjNsLTM5LjI2ODg2OC0xNi45OTcxNjl6IiBmaWxsPSIjY2RiZGIyIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSA0ODMuOTYyMjcgMCkiLz48cGF0aCBkPSJtMTcwLjg3MjY0NCAyODcuODg5NTIzLTQuMjQ1MjgzIDM1LjA1NjY1NyA1LjMwNjYwNC00LjI0OTI5Mmg1NS4xODg2OGw2LjM2NzkyNSA0LjI0OTI5Mi00LjI0NTI4NC0zNS4wNTY2NTctOC40OTA1NjUtNS4zMTE2MTUtNDIuNDUyODMgMS4wNjIzMjN6IiBmaWxsPSIjMzkzOTM5Ii8+PHBhdGggZD0ibTE0Mi4yMTYwODQgNTAuOTkxNTAyMiAyNS40NzE2OTggNTkuNDkwMDg1OCAxMS42NzQ1MjggMTczLjE1ODY0M2g0MS4zOTE1MTFsMTIuNzM1ODQ5LTE3My4xNTg2NDMgMjMuMzQ5MDU2LTU5LjQ5MDA4NTh6IiBmaWxsPSIjZjg5YzM1Ii8+PHBhdGggZD0ibTMwLjc3ODM0NjEgMTgxLjY1NzIyNi05LjU1MTg4NjggODAuOTc4NTMzaDU0LjEyNjE3ODdsNC4yNDUyODMtNjcuMTY4MTAzbDcuNDI5MjQ1My0yMy43NDY2MSA0OS44MjAzNi0uMTAxMjQ4bDguNDYxNzQ1LTIuMDI0NTAzIDEyLjc4Mjg4LTE2Ljg1NTQ2NnoiIGZpbGw9IiNmODljMzUiLz48cGF0aCBkPSJtODcuMDI4MzQ0OCAyMDcuNzM5MTY5IDUxLjM2NzE2NDIgMS43NDA3NyAyNC42MTczNzMgNDUuNjA5NjIxIDI1LjQ0ODc4NC0xMS41NTU4MjVjMCAuMDAzMjM2LjAwMDU5Mi0uMTI5MjI5LjAwMDU5Mi0uNDQyNjQ5bC0uMDAwNTkyLS41NTAwMzZjLTEuOTI2Mzc5LTEzLjY4Njg3LTEyLjUxNjY1My0yNC44MjY4Mi0yNi4yMzU1ODUtMjYuNjk1OTMxaC0uMDc5MjkzYy0xLjEyNzg5OC0uMTU0MDM4LTIuMjc4MjIyLS4yMzY0NTQtMy40MzQ4ODItLjI0Njk0OGgtLTY0LjU0NDMxNWMtNC43Mzc0MzItLjEzOTQzLTguNzc4NDUzIDMuMTQ3NDUtOS4xMTkwNTcgNy40Mjk2N2wtMy4wOTI2NjQgMTguMTYzNTYyIDUuMDcxNzI2LTMyLjQ1MzIzNHoiIGZpbGw9IiNkODdjMzAiLz48cGF0aCBkPSJtODcuMDI4MzQ0OCAyMDcuNzM5MTY5IDEuMDE2OTk0NiA1OS4wMTcxNTEtNS4xNjk4MTI2LTQ4LjExNjI4NnoiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTM1LjU4Njg3NCAyNzMuNjg0NTc5IDEuMjIxNTMyIDI1LjgyNDE0OSAyMi4wMTQ4NjItMTcuMjc2NDQzIDI4LjY2MDgzNyAzLjM0Nzg1LTE1LjE0NjI0NS0zOC40NjAwNzgiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTc0Ljc2NjM3MyAyNjAuMTc5NDYgMS41NzI0ODUgMS41NjE3Njl2MTEuMzM4ODgxbC0yMy4wNDM1MzItNC42NjM2NjQgMTMuOTQ5OTU5LTI5LjUxNzI0MnoiIGZpbGw9IiNkODdjMzAiLz48L2c+PC9zdmc+",
  walletconnect: "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJhZGlhbEdyYWRpZW50IGlkPSJhIiBjeD0iMCUiIGN5PSI1MCUiIHI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzVkOWRmNiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwNmZmZiIvPjwvcmFkaWFsR3JhZGllbnQ+PHBhdGggZD0ibTI1NiAwYzE0MS4zODUgMCAyNTYgMTE0LjYxNSAyNTYgMjU2cy0xMTQuNjE1IDI1Ni0yNTYgMjU2LTI1Ni0xMTQuNjE1LTI1Ni0yNTYgMTE0LjYxNS0yNTYgMjU2LTI1NnoiIGZpbGw9InVybCgjYSkiLz48cGF0aCBkPSJtNjQuNjkxNzU1OCAyMzcuNzQ4NzYzNWMuMDMxNDE1OC01OS40MTYyNzk1IDQ4LjIwNzY5NTItMTA3LjU4Njk2NiAxMDcuNjI2OTI5Mi0xMDcuNjE4MzYzMWg2Mi4zNjI2M2M1OS40MTkyMzQtLjAzMTM5NzEgMTA3LjU5NTY1IDQ4LjEzODk4ODYgMTA3LjYyNzA2NiAxMDcuNTU1MjY4MWwuMDMxNDE1IDU5LjQ3ODcxOTVjLjAzMTQxNSA1OS40MTYyOC00OC4xNDUyNTQgMTA3LjU4Njk2Ni0xMDcuNTY0NDg4IDEwNy42MTgzNjNoLTYyLjM2MjYzMWMtNTkuNDE5MjMzNy4wMzE0LTEwNy41OTU2NDg2LTQ4LjEzODk4OC0xMDcuNjI3MDY0Mi0xMDcuNTU1MjY4em0xMDcuNjI2OTI5Mi00Ni4zNzMzNjg1Yy00Ni44Njk5MDIgMC04NC44NzM4NDUgMzguMDAzOTM3LTg0Ljg3Mzg0NSA4NC44NzM4NDUgMCA0Ni44Njk5MDcgMzguMDAzOTQzIDg0Ljg3Mzg0NSA4NC44NzM4NDUgODQuODczODQ1aDYyLjM2MjYzYzQ2Ljg2OTkgMCA4NC44NzM4NDUtMzguMDAzOTM4IDg0Ljg3Mzg0NS04NC44NzM4NDUgMC00Ni44Njk5MDgtMzguMDAzOTQ1LTg0Ljg3Mzg0NS04NC44NzM4NDUtODQuODczODQ1em02OC43MDgwODMgNTMuNjkxNTgxNWMyMC41ODc4NTIgMjAuNTg3ODUyIDIwLjU4Nzg1MiA1My45NjcxMDQgMCA3NC41NTQ5NTZsLTYyLjM2MjYzIDYyLjM2MjYzYy0yMC41ODc4NTIgMjAuNTg3ODUyLTUzLjk2NzEwNCAyMC41ODc4NTItNzQuNTU0OTU2IDBsLTYyLjM2MjYzLTYyLjM2MjYzYy0yMC41ODc4NTItMjAuNTg3ODUyLTIwLjU4Nzg1Mi01My45NjcxMDQgMC03NC41NTQ5NTZsNjIuMzYyNjMtNjIuMzYyNjNjMjAuNTg3ODUyLTIwLjU4Nzg1MTkgNTMuOTY3MTA0LTIwLjU4Nzg1MTkgNzQuNTU0OTU2IDB6IiBmaWxsPSIjZmZmIi8+PC9zdmc+",
  coinbase: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSIjMDA1MkZGIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNTEyIDc2OEM2NTMuNTA0IDc2OCA3NjggNjUzLjUwNCA3NjggNTEyQzc2OCAzNzAuNDk2IDY1My41MDQgMjU2IDUxMiAyNTZDMzcwLjQ5NiAyNTYgMjU2IDM3MC40OTYgMjU2IDUxMkMyNTYgNjUzLjUwNCAzNzAuNDk2IDc2OCA1MTIgNzY4Wk00MjEuMzMzIDQ2OS4zMzNDNDQ0LjY2NyA0NjkuMzMzIDQ2OS4zMzMgNDQ0LjY2NyA0NjkuMzMzIDQyMS4zMzNDNDY5LjMzMyA0MTMuMzMzIDQ2OS4zMzMgMzg0IDUxMiAzODRDNTU0LjY2NyAzODQgNTU0LjY2NyA0MTMuMzMzIDU1NC42NjcgNDIxLjMzM0M1NTQuNjY3IDQ0NC42NjcgNTc5LjMzMyA0NjkuMzMzIDYwMi42NjcgNDY5LjMzM0M2MTAuNjY3IDQ2OS4zMzMgNjQwIDQ2OS4zMzMgNjQwIDUxMkM2NDAgNTU0LjY2NyA2MTAuNjY3IDU1NC42NjcgNjAyLjY2NyA1NTQuNjY3QzU3OS4zMzMgNTU0LjY2NyA1NTQuNjY3IDU3OS4zMzMgNTU0LjY2NyA2MDIuNjY3QzU1NC42NjcgNjEwLjY2NyA1NTQuNjY3IDY0MCA1MTIgNjQwQzQ2OS4zMzMgNjQwIDQ2OS4zMzMgNjEwLjY2NyA0NjkuMzMzIDYwMi42NjdDNDY5LjMzMyA1NzkuMzMzIDQ0NC42NjcgNTU0LjY2NyA0MjEuMzMzIDU1NC42NjdDNDEzLjMzMyA1NTQuNjY3IDM4NCA1NTQuNjY3IDM4NCA1MTJDMzg0IDQ2OS4zMzMgNDEzLjMzMyA0NjkuMzMzIDQyMS4zMzMgNDY5LjMzM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
  trust: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjUxMiIgZmlsbD0iIzBCMTQyNiIvPgo8cGF0aCBkPSJNNTEyIDI1NkM1MTIgMjU2IDY5NiAzMjAgNjk2IDQ4MEM2OTYgNjQwIDY1NiA3NjggNTEyIDc2OEMzNjggNzY4IDMyOCA2NDAgMzI4IDQ4MEMzMjggMzIwIDUxMiAyNTYgNTEyIDI1NloiIHN0cm9rZT0iIzMzNzVCQiIgc3Ryb2tlLXdpZHRoPSI2NCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=",
  browser: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjJDMTcuNTIyOCAyMiAyMiAxNy41MjI4IDIyIDEyQzIyIDYuNDc3MTUgMTcuNTIyOCAyIDEyIDJDNi40NzcxNSAyIDIgNi40NzcxNSAyIDEyQzIgMTcuNTIyOCA2LjQ3NzE1IDIyIDEyIDIyWiIgc3Ryb2tlPSIjOEI1Q0Y2IiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMiAxMkgyMiIgc3Ryb2tlPSIjOEI1Q0Y2IiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMTIgMkMxNC41MDEzIDQuNzM4MzUgMTUuOTIyOCA4LjI5MjAzIDE2IDEyQzE1LjkyMjggMTUuNzA4IDE0LjUwMTMgMTkuMjYxNyAxMiAyMkM5LjQ5ODcyIDE5LjI2MTcgOC4wNzcyMSAxNS43MDggOCAxMkM4LjA3NzIxIDguMjkyMDMgOS40OTg3MiA0LjczODM1IDEyIDJaIiBzdHJva2U9IiM4QjVDRjYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg=="
};

// Detect wallet type from provider
const detectWalletType = () => {
  if (typeof window === 'undefined') return null;

  const ua = navigator.userAgent.toLowerCase();

  // Check user agent first for mobile wallets
  if (ua.includes('trustwallet')) return 'Trust Wallet';
  if (ua.includes('metamask')) return 'MetaMask';
  if (ua.includes('coinbase')) return 'Coinbase Wallet';
  if (ua.includes('tokenpocket')) return 'TokenPocket';
  if (ua.includes('imtoken')) return 'imToken';
  if (ua.includes('okx')) return 'OKX Wallet';
  if (ua.includes('bitget')) return 'Bitget Wallet';

  // Then check ethereum provider flags
  const eth = window.ethereum;
  if (!eth) return null;

  if (eth.isMetaMask) return 'MetaMask';
  if (eth.isCoinbaseWallet) return 'Coinbase Wallet';
  if (eth.isTrust) return 'Trust Wallet';
  if (eth.isTokenPocket) return 'TokenPocket';
  if (eth.isBraveWallet) return 'Brave Wallet';
  if (eth.isOKExWallet || eth.isOkxWallet) return 'OKX Wallet';
  if (eth.isBitKeep || eth.isBitget) return 'Bitget Wallet';
  if (eth.isPhantom) return 'Phantom';
  if (eth.isRabby) return 'Rabby';
  if (eth.isSafePal) return 'SafePal';

  return 'Wallet';
};

export default function MultiWalletConnect({ onWalletLogin }) {
  const { open } = useWeb3Modal();
  const { address: modalAddress, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [detectedWallet, setDetectedWallet] = useState(null);
  const [hasInjectedWallet, setHasInjectedWallet] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isInWalletBrowser, setIsInWalletBrowser] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [debugInfo, setDebugInfo] = useState('');

  // Handle Web3Modal connection
  useEffect(() => {
    if (isConnected && modalAddress && walletProvider) {
      handleModalLogin(modalAddress, walletProvider);
    }
  }, [isConnected, modalAddress, walletProvider]);

  const handleModalLogin = async (address, provider) => {
    if (connecting) return;
    setConnecting(true);
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      const timestamp = Date.now();
      const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;

      const signature = await signer.signMessage(message);

      const response = await fetch(`${API_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Auth failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onWalletLogin) onWalletLogin(data);
    } catch (err) {
      console.error('Modal login error:', err);
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  // Check for wallet on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_URL.replace('/api', '')}/health`, { method: 'GET' });
        if (res.ok) setServerStatus('online');
        else setServerStatus('offline');
      } catch (e) {
        setServerStatus('offline');
        setDebugInfo(prev => prev + `\nServer check failed: ${e.message}`);
      }
    };
    checkServer();

    const checkWallet = () => {
      const mobile = isMobile();
      const walletBrowser = isWalletBrowser();
      const hasWallet = typeof window !== 'undefined' && (!!window.ethereum || !!window.trustwallet || !!window.phantom?.ethereum);

      setIsMobileDevice(mobile);
      setIsInWalletBrowser(walletBrowser);
      setHasInjectedWallet(hasWallet);

      if (hasWallet) {
        setDetectedWallet(detectWalletType());
      }

      const info = `Mobile: ${mobile}, WalletBrowser: ${walletBrowser}, HasWallet: ${hasWallet}, UA: ${navigator.userAgent.slice(0, 50)}...`;
      setDebugInfo(prev => prev + `\n${info}`);
      console.log('Wallet check:', info);
    };

    // Initial check
    checkWallet();

    // Check again after delays (some wallets inject late, especially on mobile)
    const timer1 = setTimeout(checkWallet, 500);
    const timer2 = setTimeout(checkWallet, 1500);
    const timer3 = setTimeout(checkWallet, 3000);
    const timer4 = setTimeout(checkWallet, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Manual re-check
  const handleRefresh = () => {
    const hasWallet = typeof window !== 'undefined' && (!!window.ethereum || !!window.trustwallet || !!window.phantom?.ethereum);
    setHasInjectedWallet(hasWallet);
    if (hasWallet) {
      setDetectedWallet(detectWalletType());
    } else {
      setError('No wallet detected yet. If you are in a wallet browser, please wait a moment and try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Main wallet connection function
  const connectWallet = async (walletId) => {
    setConnecting(true);
    setError('');
    setSelectedWallet(walletId);

    try {
      // Get the provider - handle multiple providers which is common on mobile
      let provider = window.ethereum;

      // If multiple providers, try to find the one we want
      if (window.ethereum?.providers) {
        provider = window.ethereum.providers.find(p => p.isMetaMask) ||
          window.ethereum.providers.find(p => p.isTrust) ||
          window.ethereum.providers[0];
      } else if (window.trustwallet) {
        provider = window.trustwallet;
      } else if (window.phantom?.ethereum) {
        provider = window.phantom.ethereum;
      }

      // Wait a bit for mobile wallets to fully initialize
      if (isMobileDevice) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Check for ethereum provider
      if (!provider) {
        if (isMobileDevice) {
          throw new Error('No wallet provider found. Please open this page inside your wallet app\'s browser (MetaMask, Trust Wallet, etc).');
        }
        throw new Error('No wallet detected. Please install MetaMask or use a Web3 browser.');
      }

      console.log('Connecting wallet...', walletId, 'Mobile:', isMobileDevice);

      // Request accounts - this will prompt the wallet
      let accounts;
      try {
        // Some mobile wallets need this explicit enable call first
        if (provider.enable) {
          try {
            await provider.enable();
          } catch (e) {
            console.log('Enable call failed or not needed:', e);
          }
        }

        // Try eth_requestAccounts first
        try {
          accounts = await provider.request({
            method: 'eth_requestAccounts',
          });
        } catch (reqErr) {
          console.log('eth_requestAccounts failed, trying eth_accounts:', reqErr);
          accounts = await provider.request({
            method: 'eth_accounts',
          });
        }
      } catch (reqError) {
        console.error('Account request error:', reqError);
        if (reqError.code === 4001) {
          throw new Error('You rejected the connection request');
        }
        if (reqError.code === -32002) {
          throw new Error('Connection request already pending. Please check your wallet app.');
        }
        // For mobile, provide more helpful error
        if (isMobileDevice) {
          throw new Error('Could not connect to wallet. Please make sure you\'re using the wallet\'s built-in browser and have unlocked your wallet.');
        }
        throw reqError;
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet and try again.');
      }

      const address = accounts[0];
      console.log('Connected address:', address);

      // Create a message to sign
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;

      // Request signature using personal_sign
      let signature;
      try {
        // Convert message to hex for personal_sign - most reliable way
        const msgHex = '0x' + Array.from(new TextEncoder().encode(message))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        signature = await provider.request({
          method: 'personal_sign',
          params: [msgHex, address],
        });
      } catch (signError) {
        console.error('Signature error (hex):', signError);

        if (signError.code === 4001) {
          throw new Error('You rejected the signature request.');
        }

        // Fallback to raw message for some wallets
        try {
          signature = await provider.request({
            method: 'personal_sign',
            params: [message, address],
          });
        } catch (altError) {
          console.error('Alternative signature also failed:', altError);
          throw new Error('Failed to sign message. Please try again.');
        }
      }

      console.log('Signature obtained, sending to server...');

      // Send to backend
      const response = await fetch(`${API_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ address, message, signature }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Wallet authentication failed');
      }

      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onWalletLogin) {
        onWalletLogin(data);
      }

    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  // Deep links for mobile wallet apps
  const openInWalletApp = (wallet) => {
    const currentUrl = encodeURIComponent(window.location.href);

    if (wallet === 'metamask') {
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
    } else if (wallet === 'trust') {
      window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${currentUrl}`;
    } else if (wallet === 'coinbase') {
      window.location.href = `https://go.cb-w.com/dapp?cb_url=${currentUrl}`;
    } else if (wallet === 'okx') {
      window.location.href = `okx://wallet/dapp/details?dappUrl=${currentUrl}`;
    } else if (wallet === 'bitget') {
      window.location.href = `https://bkcode.vip?action=dapp&url=${currentUrl}`;
    }
  };

  const copyDebugInfo = () => {
    navigator.clipboard.writeText(debugInfo);
    alert('Debug info copied to clipboard. Please send this to support.');
  };

  return (
    <div className="space-y-4">
      {/* Server Status Indicator */}
      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-gray-500">
        <button onClick={copyDebugInfo} className="hover:text-white transition">
          [Copy Debug Info]
        </button>
        <div className="flex items-center gap-2">
          <span>Server:</span>
          <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' :
              serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
            }`}></div>
          <span className={serverStatus === 'online' ? 'text-green-500/70' : ''}>
            {serverStatus}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Detected Wallet - Primary Option */}
      {hasInjectedWallet ? (
        <button
          onClick={() => connectWallet('injected')}
          disabled={connecting}
          className={`w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl hover:opacity-90 transition disabled:opacity-50 ${connecting ? 'cursor-wait' : ''
            }`}
        >
          <img src={walletIcons.browser} alt="Wallet" className="w-6 h-6" />
          <span className="font-semibold">
            {connecting ? 'Connecting...' : `Connect with ${detectedWallet || 'Wallet'}`}
          </span>
          {connecting && (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => open()}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-3 p-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            <img src={walletIcons.walletconnect} alt="WalletConnect" className="w-6 h-6" />
            <span className="font-semibold">WalletConnect (QR Code)</span>
          </button>

          {isMobileDevice && (
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Check for Wallet
            </button>
          )}
        </div>
      )}

      {/* Mobile - No Wallet Detected - Show Deep Links */}
      {!hasInjectedWallet && isMobileDevice && (
        <div className="space-y-3">
          <div className="text-center text-sm text-gray-400 mb-3">
            Open in your wallet app:
          </div>

          <button
            onClick={() => openInWalletApp('metamask')}
            className="w-full flex items-center justify-center gap-3 p-4 bg-orange-500/20 border border-orange-500/30 rounded-xl hover:bg-orange-500/30 transition"
          >
            <img src={walletIcons.metamask} alt="MetaMask" className="w-6 h-6" />
            <span className="font-semibold">Open in MetaMask</span>
          </button>

          <button
            onClick={() => openInWalletApp('trust')}
            className="w-full flex items-center justify-center gap-3 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition"
          >
            <img src={walletIcons.trust} alt="Trust Wallet" className="w-6 h-6" />
            <span className="font-semibold">Open in Trust Wallet</span>
          </button>

          <button
            onClick={() => openInWalletApp('okx')}
            className="w-full flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
          >
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[10px] font-bold">OKX</div>
            <span className="font-semibold">Open in OKX Wallet</span>
          </button>

          <button
            onClick={() => openInWalletApp('bitget')}
            className="w-full flex items-center justify-center gap-3 p-4 bg-blue-400/20 border border-blue-400/30 rounded-xl hover:bg-blue-400/30 transition"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">BG</div>
            <span className="font-semibold">Open in Bitget Wallet</span>
          </button>

          <button
            onClick={() => openInWalletApp('coinbase')}
            className="w-full flex items-center justify-center gap-3 p-4 bg-blue-600/20 border border-blue-600/30 rounded-xl hover:bg-blue-600/30 transition"
          >
            <img src={walletIcons.coinbase} alt="Coinbase" className="w-6 h-6" />
            <span className="font-semibold">Open in Coinbase Wallet</span>
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            These links will open the page in your wallet's browser
          </p>
        </div>
      )}

      {/* Desktop - No Wallet Detected */}
      {!hasInjectedWallet && !isMobileDevice && (
        <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="text-4xl mb-3">🦊</div>
          <h3 className="font-semibold text-white mb-2">No Wallet Detected</h3>
          <p className="text-gray-400 text-sm mb-4">
            To connect with a wallet, please install MetaMask or use a Web3-enabled browser.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium text-sm transition"
            >
              Install MetaMask
            </a>
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-gray-400 text-center">
        {hasInjectedWallet
          ? 'Click connect and sign the message in your wallet to login'
          : isMobileDevice
            ? 'Tap a button above to open this page in your wallet app'
            : 'Supports MetaMask, Trust Wallet, Coinbase Wallet, and all Web3 browsers'}
      </p>
    </div>
  );
}
