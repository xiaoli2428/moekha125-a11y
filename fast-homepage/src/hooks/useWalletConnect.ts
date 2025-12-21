import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'wallet_session';
const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface WalletSession {
    address: string;
    chainId: number;
    timestamp: number;
}

// Inline wallet session helpers (self-contained)
function getWalletSession(): { address: string; chainId: number } | null {
    try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (!stored) return null;

        const session: WalletSession = JSON.parse(stored);
        const now = Date.now();

        if (now - session.timestamp > TTL_MS) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }

        return { address: session.address, chainId: session.chainId };
    } catch {
        return null;
    }
}

function setWalletSession({ address, chainId }: { address: string; chainId: number }): void {
    const session: WalletSession = {
        address,
        chainId,
        timestamp: Date.now()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearWalletSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
}

declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, handler: (...args: unknown[]) => void) => void;
            removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
        };
    }
}

/**
 * Optimized wallet connection hook
 * Caches wallet state in sessionStorage to avoid repeated RPC calls
 */
export const useWalletConnect = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load cached session on mount
    useEffect(() => {
        const session = getWalletSession();
        if (session) {
            setAddress(session.address);
            setChainId(session.chainId);
        }
    }, []);

    // Connect wallet
    const connect = useCallback(async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            setError('No wallet detected');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' }) as string;

            const walletAddress = accounts[0];
            const walletChainId = parseInt(chainIdHex, 16);

            setAddress(walletAddress);
            setChainId(walletChainId);

            // Cache for 5 minutes
            setWalletSession({ address: walletAddress, chainId: walletChainId });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to connect wallet';
            setError(message);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // Disconnect wallet
    const disconnect = useCallback(() => {
        setAddress(null);
        setChainId(null);
        clearWalletSession();
    }, []);

    // Listen for account/chain changes
    useEffect(() => {
        if (typeof window === 'undefined' || !window.ethereum) return;

        const handleAccountsChanged = (accounts: unknown) => {
            const accts = accounts as string[];
            if (accts.length === 0) {
                disconnect();
            } else {
                const newAddress = accts[0];
                setAddress(newAddress);
                if (chainId) {
                    setWalletSession({ address: newAddress, chainId });
                }
            }
        };

        const handleChainChanged = (chainIdHex: unknown) => {
            const newChainId = parseInt(chainIdHex as string, 16);
            setChainId(newChainId);
            if (address) {
                setWalletSession({ address, chainId: newChainId });
            }
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
        };
    }, [address, chainId, disconnect]);

    return {
        address,
        chainId,
        isConnecting,
        error,
        connect,
        disconnect,
        isConnected: !!address
    };
};
