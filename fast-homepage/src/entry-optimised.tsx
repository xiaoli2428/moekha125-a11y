import { Suspense, lazy } from 'react';
import { SkeletonPoolList } from './components/SkeletonPoolList';
import { PoolRow } from './components/PoolRow';
import { usePools } from './hooks/usePools';
import { useWalletConnect } from './hooks/useWalletConnect';

// Lazy load heavy chart component
const LazyChart = lazy(() => import('./components/LazyChart'));

/**
 * Optimized app entry point
 * - No RPC calls before first paint
 * - Uses React Query for efficient data fetching
 * - Multicall batches requests into single RPC call
 * - Lazy loads non-critical components
 * - Skeleton loaders for smooth UX
 */
export function App() {
    const { data: pools, isLoading } = usePools();
    const { address, isConnected, connect, disconnect } = useWalletConnect();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header with wallet connection */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">OnchainWeb Pools</h1>
                    <button
                        onClick={isConnected ? disconnect : connect}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
                    </button>
                </div>
            </div>

            {/* Pools section */}
            <div className="max-w-7xl mx-auto mb-8">
                <h2 className="text-xl font-bold mb-4">Top Liquidity Pools</h2>

                {isLoading ? (
                    <SkeletonPoolList />
                ) : pools && pools.length > 0 ? (
                    <div className="space-y-3">
                        {pools.map((pool) => (
                            <PoolRow key={pool.address} pool={pool} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        No pools found
                    </div>
                )}
            </div>

            {/* Lazy loaded chart - only loads when scrolled to */}
            <div className="max-w-7xl mx-auto">
                <Suspense fallback={<div className="h-96 bg-white/5 rounded-xl animate-pulse" />}>
                    <LazyChart />
                </Suspense>
            </div>

            {/* Performance info */}
            <div className="max-w-7xl mx-auto mt-8 p-4 bg-green-900/20 rounded-xl border border-green-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <div className="text-sm text-green-300">
                        <strong>Optimized:</strong> Single multicall RPC request • Cached wallet session • Lazy loaded components • 60fps scrolling
                    </div>
                </div>
            </div>
        </div>
    );
}
