/**
 * Wallet session utilities for mock wallet connection
 * This is a placeholder for future web3 integration
 */

// Mock wallet session state
let isConnected = false;
let walletAddress = null;

/**
 * Connect to a mock wallet
 * @returns {Promise<{address: string}>}
 */
export async function connectWallet() {
  // Simulate connection delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  isConnected = true;
  walletAddress = '0x' + '1234567890abcdef'.repeat(2).slice(0, 40);
  
  return { address: walletAddress };
}

/**
 * Disconnect the wallet
 */
export function disconnectWallet() {
  isConnected = false;
  walletAddress = null;
}

/**
 * Get current wallet connection status
 * @returns {{isConnected: boolean, address: string|null}}
 */
export function getWalletStatus() {
  return {
	isConnected,
	address: walletAddress,
  };
}

/**
 * Format wallet address for display
 * @param {string} address - Full wallet address
 * @returns {string} Truncated address (e.g., 0x1234...abcd)
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
