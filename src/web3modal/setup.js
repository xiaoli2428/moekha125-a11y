/**
 * Web3Modal + ethers5 setup module
 * This file is ONLY imported when user clicks "Connect Wallet"
 * NOT loaded at startup - keeps login page fast
 */

let web3ModalInstance = null;

/**
 * Initialize Web3Modal (called lazily on first connect attempt)
 */
async function getWeb3Modal() {
  if (web3ModalInstance) {
    return web3ModalInstance;
  }

  // Only import these heavy dependencies when actually needed
  const { createWeb3Modal, defaultConfig } = await import('@web3modal/ethers5/react');
  const { ethers } = await import('ethers');

  // Web3Modal Project ID - get yours from: https://cloud.walletconnect.com
  // This is the official Onchainweb project ID for production
  // To use your own, sign up at WalletConnect Cloud and replace this value
  const projectId = '8e351899f7e19103239159c134bd210b';

  const chains = [
    {
      chainId: 1,
      name: 'Ethereum',
      currency: 'ETH',
      explorerUrl: 'https://etherscan.io',
      rpcUrl: 'https://cloudflare-eth.com'
    },
    {
      chainId: 137,
      name: 'Polygon',
      currency: 'MATIC',
      explorerUrl: 'https://polygonscan.com',
      rpcUrl: 'https://polygon-rpc.com'
    }
  ];

  const metadata = {
    name: 'OnchainWeb',
    description: 'OnchainWeb DeFi Platform',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://onchainweb.app',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  };

  web3ModalInstance = createWeb3Modal({
    ethersConfig: defaultConfig({
      metadata,
      infuraId: undefined,
      alchemyId: undefined
    }),
    chains,
    projectId,
    enableAnalytics: false,
    enableOnramp: false,
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '971e689d0a5be527bac3b88bf325c41f6f552e852e2dd96147586620f185365a', // Coinbase
      'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d', // Crypto.com DeFi Wallet
      '4622a2b2d6af1c9844944291e5e8d3930b7b4b3a5f1f3f8c5e2d9a6b3c0f5e2', // Trust Wallet
      'ecc4036f814562b41a5268adc86270fea1e1dfb2b6e3355ead3aacd1cedffb2f'  // Phantom
    ],
    includeWalletIds: undefined,
    excludeWalletIds: []
  });

  return web3ModalInstance;
}

/**
 * Perform wallet login with signature verification
 * Called when user clicks "Connect Wallet" on LoginPage
 */
export async function walletLogin() {
  // Use same API URL as api.js - respects VITE_API_URL environment variable
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  try {
    // Check for ethereum provider (native or injected)
    if (!window.ethereum) {
      throw new Error('No wallet detected. Please open this page in your wallet app browser.');
    }

    // Request accounts from wallet
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    const address = accounts[0];

    // Create message to sign
    const timestamp = Date.now();
    const message = `Sign this message to authenticate with OnchainWeb.\n\nWallet: ${address}\nTimestamp: ${timestamp}`;

    // Request signature from wallet
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    });

    // Send signature to backend for verification
    const response = await fetch(`${API_URL}/auth/wallet-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, message, signature })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Wallet login failed');
    }

    return {
      token: data.token,
      user: data.user,
      address
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get Web3Modal instance (for connecting via modal UI)
 * Currently not used in LoginPage, but available for future use
 */
export async function openWeb3Modal() {
  const modal = await getWeb3Modal();
  // Note: openWeb3Modal would need to be called differently with hooks
  // This is a simplified placeholder
  return modal;
}
