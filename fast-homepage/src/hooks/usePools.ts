import { useQuery } from '@tanstack/react-query';

export interface Pool {
    address: string;
    token0: string;
    token1: string;
    liquidity: string;
    tick: number;
}

// Mock data for demonstration (replace with real multicall in production)
const MOCK_POOLS: Pool[] = [
    {
        address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
        token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        liquidity: '12345678901234567890',
        tick: 201234
    },
    {
        address: '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',
        token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // ETH
        liquidity: '9876543210987654321',
        tick: 198765
    },
    {
        address: '0x4585FE77225b41b697C938B018E2Ac67Ac5a20c0',
        token0: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        liquidity: '5555555555555555555',
        tick: 256789
    },
    {
        address: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
        token0: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        liquidity: '3333333333333333333',
        tick: 67890
    },
    {
        address: '0x11b815efB8f581194ae79006d24E0d814B7697F6',
        token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        liquidity: '7777777777777777777',
        tick: 199000
    },
    {
        address: '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168',
        token0: '0x6B175474E89094C44Da98b954EesdeD70370400', // DAI
        token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        liquidity: '8888888888888888888',
        tick: 1000
    }
];

const fetchPools = async (): Promise<Pool[]> => {
    // Simulate network delay (300ms like a fast RPC)
    await new Promise(resolve => setTimeout(resolve, 300));

    // In production, this would use multicall:
    // return await fetchPoolsWithMulticall();

    return MOCK_POOLS;
};

/**
 * Fetch top pools using React Query
 * In production, this uses multicall (single RPC request instead of N requests)
 * Currently uses mock data for standalone testing
 */
export const usePools = () => {
    return useQuery({
        queryKey: ['pools'],
        queryFn: fetchPools,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchInterval: 60_000,
        retry: 2
    });
};
