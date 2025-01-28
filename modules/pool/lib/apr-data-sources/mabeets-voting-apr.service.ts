import { PoolAprService } from '../../pool-types';
import { PrismaPoolWithTokens } from '../../../../prisma/prisma-types';
import { Chain } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';

const HIDDEN_HAND_API_URL = 'https://api.hiddenhand.finance/proposal/beets';
const FRESH_BEETS = '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8';

const freshBeetsPool = '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8000200000000000000000005';
const id = `${freshBeetsPool}-voting-apr`;
const chain = 'SONIC';

type HiddenHandResponse = {
    error: boolean;
    data: {
        poolId: string;
        proposal: string;
        proposalHash: string;
        title: string;
        proposalDeadline: number;
        totalValue: number;
        maxTotalValue: number;
        voteCount: number;
        valuePerVote: number;
        maxValuePerVote: number;
        bribes: {
            token: string;
            symbol: string;
            decimals: number;
            value: number;
            maxValue: number;
            amount: number;
            maxTokensPerVote: number;
            briber: string;
            periodIndex: number;
            chainId: number;
        }[];
    }[];
};

const fetchHiddenHandRound = async (timestamp?: number) => {
    const response = await fetch(`${HIDDEN_HAND_API_URL}/${timestamp || ''}`);
    const data = (await response.json()) as HiddenHandResponse;
    if (data.error) {
        throw new Error('Failed to fetch voting APR');
    }

    // Get sum of all incentivized votes and total value
    const total = data.data.reduce((acc, proposal) => acc + proposal.totalValue, 0);
    const votes = data.data
        .filter((proposal) => proposal.totalValue > 0)
        .reduce((acc, proposal) => acc + proposal.voteCount, 0);

    return { total, votes, timestamp: data.data[0].proposalDeadline };
};

export const getHiddenHandAPR = async (timestamp: number) => {
    const round = await fetchHiddenHandRound(timestamp);

    // Debugging purposes
    console.log('Hiddenhand round', timestamp, round.timestamp, round.total, round.votes);

    timestamp = round.timestamp;

    const avgValuePerVote = round.total / round.votes;

    let freshBeetsPrice;
    // When the timestamp is older than 24 hours, we can fetch the historical price
    if (timestamp < Math.ceil(+Date.now() / 1000) - 86400) {
        freshBeetsPrice = await prisma.prismaTokenPrice.findFirst({
            where: {
                tokenAddress: FRESH_BEETS,
                chain: Chain.SONIC,
                timestamp,
            },
        });
    }
    // Otherwise we fetch the current price
    else {
        freshBeetsPrice = await prisma.prismaTokenCurrentPrice.findFirst({
            where: {
                tokenAddress: FRESH_BEETS,
                chain: Chain.SONIC,
            },
        });
    }

    if (!freshBeetsPrice) {
        throw new Error('Failed to fetch fresh beets price');
    }

    const apr = (avgValuePerVote * 52) / freshBeetsPrice.price;

    return apr;
};

export class MaBeetsVotingAprService implements PoolAprService {
    constructor() {}

    public getAprServiceName(): string {
        return 'MaBeetsVotingAprService';
    }

    async getApr(): Promise<number> {
        // Get APRs for last 6 weeks, if available
        const timestamp = (await fetchHiddenHandRound()).timestamp;

        const aprs = await Promise.allSettled([
            getHiddenHandAPR(timestamp - 1 * 604800 * 2),
            getHiddenHandAPR(timestamp - 2 * 604800 * 2),
            getHiddenHandAPR(timestamp - 3 * 604800 * 2),
        ]);

        // Average successfully fetched APRs
        const avg = aprs
            .filter((apr): apr is PromiseFulfilledResult<number> => apr.status === 'fulfilled')
            .map((apr) => apr.value);

        if (avg.length === 0) {
            throw new Error('Failed to fetch APRs');
        }

        return avg.reduce((acc, val) => acc + val, 0) / avg.length;
    }

    async updateAprForPools(pools: PrismaPoolWithTokens[]): Promise<void> {
        const apr = await this.getApr();

        await prisma.prismaPoolAprItem.upsert({
            where: { id_chain: { id, chain } },
            create: {
                id,
                chain,
                poolId: freshBeetsPool,
                apr,
                title: 'Voting APR',
                type: 'VOTING',
            },
            update: { apr },
        });
    }
}
