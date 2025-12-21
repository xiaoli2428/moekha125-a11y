import { memo } from 'react';

interface Pool {
    address: string;
    token0: string;
    token1: string;
    liquidity: string;
    tick: number;
}

/**
 * Memoized pool row component
 * Prevents unnecessary re-renders for smooth 60fps scrolling
 */
export const PoolRow = memo(({ pool }: { pool: Pool }) => {
    // Shorten addresses for display
    const shortAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex-1">
                <div className="font-semibold text-white">
                    {shortAddress(pool.token0)} / {shortAddress(pool.token1)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                    Pool: {shortAddress(pool.address)}
                </div>
            </div>
            <div className="text-right">
                <div className="text-white font-mono">
                    {(BigInt(pool.liquidity) / BigInt(1e18)).toString()} L
                </div>
                <div className="text-sm text-gray-400 mt-1">
                    Tick: {pool.tick}
                </div>
            </div>
        </div>
    );
});

PoolRow.displayName = 'PoolRow';
