import { AprHandler } from '..';
import { abi as SiloLensAbi } from './abis/silo-lens';
import { SiloAprConfig } from '../../../../../network/apr-config-types';
import { createPublicClient, formatEther, http, parseEther } from 'viem';
import { sonic } from 'viem/chains';
import config from '../../../../../../config';

// Initialize the client for Arbitrum network
const client = createPublicClient({
    chain: sonic,
    transport: http(config.SONIC.rpcUrl),
});

const SILO_LENS_ADDR = '0xb6adbb29f2d8ae731c7c72036a7fd5a7e970b198';

export class SiloAprHandler implements AprHandler {
    markets: string[];

    constructor(aprConfig: SiloAprConfig) {
        this.markets = aprConfig.markets;
    }

    async getAprs() {
        const aprs: { [tokenAddress: string]: { apr: number; isIbYield: boolean } } = {};
        for (const marketAddress of this.markets) {
            try {
                const result = await client.readContract({
                    address: SILO_LENS_ADDR as `0x${string}`,
                    abi: SiloLensAbi,
                    functionName: 'getDepositAPR',
                    args: [marketAddress as `0x${string}`],
                });

                aprs[marketAddress] = { apr: parseFloat(formatEther(result)), isIbYield: true };
            } catch (error) {
                console.error(`Silo APR handler failed: `, error);
                return {};
            }
        }

        return aprs;
    }
}
