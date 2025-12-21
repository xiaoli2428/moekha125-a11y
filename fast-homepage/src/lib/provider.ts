import { StaticJsonRpcProvider } from '@ethersproject/providers';

/**
 * Optimized RPC provider with batching enabled
 * Batches multiple calls into single request for faster loading
 */
export const provider = new StaticJsonRpcProvider(
    import.meta.env.VITE_RPC_PRIMARY || 'https://cloudflare-eth.com',
    {
        chainId: 1,
        name: 'ethereum',
        batchMaxSize: 100,
        batchStallTime: 10
    }
);

// Polygon provider
export const polygonProvider = new StaticJsonRpcProvider(
    import.meta.env.VITE_RPC_POLYGON || 'https://polygon-rpc.com',
    {
        chainId: 137,
        name: 'polygon',
        batchMaxSize: 100,
        batchStallTime: 10
    }
);

// Get provider by chain ID
export function getProviderByChain(chainId: number) {
    switch (chainId) {
        case 1:
            return provider;
        case 137:
            return polygonProvider;
        default:
            return provider;
    }
}
