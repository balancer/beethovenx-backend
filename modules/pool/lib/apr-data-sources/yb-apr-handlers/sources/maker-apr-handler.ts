import { AprHandler } from '../types';
import { MakerAprConfig } from '../../../../../network/apr-config-types';
import { abi as makerPotAbi } from './abis/maker-pot';
import config from '../../../../../../config';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
    chain: mainnet,
    transport: http(config.MAINNET.rpcUrl),
});

const potAddress = '0x197e90f9fad81970ba7976f33cbd77088e5d7cf7';

export class MakerAprHandler implements AprHandler {
    group = 'MAKER';
    private sdai: string;

    constructor({ sdai }: MakerAprConfig) {
        this.sdai = sdai;
    }

    async getAprs() {
        const aprs: { [p: string]: { apr: number; isIbYield: boolean; group: string } } = {};
        try {
            const dsr = await client.readContract({
                abi: makerPotAbi,
                address: potAddress,
                functionName: 'dsr',
            });

            const tokenApr = (Number(dsr) * 10 ** -27 - 1) * 365 * 24 * 60 * 60;

            aprs[this.sdai] = {
                apr: tokenApr,
                isIbYield: false,
                group: this.group,
            };
        } catch (error) {
            console.error(`Maker APR Failed for token ${this.sdai}: `, error);
        }
        return aprs;
    }
}
