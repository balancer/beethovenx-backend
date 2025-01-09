import { PoolAprService } from '../../../pool-types';
import { PrismaPoolWithTokens } from '../../../../../prisma/prisma-types';
import axios from 'axios';
import { prisma } from '../../../../../prisma/prisma-client';
import { networkContext } from '../../../../network/network-context.service';
import { PrismaPoolAprType } from '@prisma/client';

export class BeetswarsGaugeVotingAprService implements PoolAprService {
    private readonly FRESH_BEETS_POOL_ID = '0x9e4341acef4147196e99d648c5e43b3fc9d026780002000000000000000005ec';

    public getAprServiceName(): string {
        return 'BeetswarsGaugeVotingAprService';
    }

    public async updateAprForPools(pools: PrismaPoolWithTokens[]): Promise<void> {
        for (const pool of pools) {
            if (pool.id !== this.FRESH_BEETS_POOL_ID) {
                continue;
            }

            const response = await axios.get('https://www.beetswars.live/api/trpc/chart.chartdata');

            const raw: number[] = response.data.result.data.json.chartdata.votingApr;

            // Filter out non-numbers and infinity values
            const votingAprs = raw.filter((apr) => apr && isFinite(apr));

            const minApr = 0;
            // const maxApr = votingAprs[votingAprs.length - 1] / 100;
            const maxApr = 0;

            const itemId = `${this.FRESH_BEETS_POOL_ID}-voting-apr`;

            await prisma.prismaPoolAprItem.upsert({
                where: { id_chain: { id: itemId, chain: networkContext.chain } },
                update: {
                    range: {
                        update: { min: minApr, max: maxApr },
                    },
                    title: 'Voting APR*',
                    apr: maxApr,
                    type: PrismaPoolAprType.VOTING,
                },
                create: {
                    id: itemId,
                    chain: networkContext.chain,
                    poolId: this.FRESH_BEETS_POOL_ID,
                    title: 'Voting APR*',
                    apr: maxApr,
                    range: {
                        create: {
                            id: `${itemId}-range`,
                            min: minApr,
                            max: maxApr,
                        },
                    },
                    type: PrismaPoolAprType.VOTING,
                    group: null,
                },
            });
        }
    }
}
