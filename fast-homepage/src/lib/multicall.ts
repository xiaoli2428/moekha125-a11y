import { utils } from 'ethers';
import { provider } from './provider';

/**
 * Multicall3 contract address (deployed on all major chains at same address)
 */
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

const multicallAbi = [
    'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) public returns (tuple(bool success, bytes returnData)[] returnData)'
];

const multicallInterface = new utils.Interface(multicallAbi);

export interface Call {
    target: string;
    callData: string;
    allowFailure?: boolean;
}

export interface MulticallResult {
    success: boolean;
    returnData: string;
}

/**
 * Execute multiple contract calls in a single RPC request
 * Dramatically reduces load time by batching calls
 */
export async function multicall(calls: Call[]): Promise<MulticallResult[]> {
    if (!calls || calls.length === 0) {
        return [];
    }

    const formattedCalls = calls.map((call) => ({
        target: call.target,
        allowFailure: call.allowFailure ?? true,
        callData: call.callData
    }));

    try {
        const result = await provider.call({
            to: MULTICALL3_ADDRESS,
            data: multicallInterface.encodeFunctionData('aggregate3', [formattedCalls])
        });

        const decoded = multicallInterface.decodeFunctionResult('aggregate3', result);
        return decoded[0] as MulticallResult[];
    } catch (error) {
        console.error('Multicall failed:', error);
        throw error;
    }
}
