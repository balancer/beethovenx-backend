import {
    BalancerPoolFragment,
    OrderDirection,
    Pool_OrderBy,
} from '../../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import { prisma } from '../../../prisma/prisma-client';
import _ from 'lodash';
import { nestedPoolWithSingleLayerNesting } from '../../../prisma/prisma-types';
import { UserService } from '../../user/user.service';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { networkContext } from '../../network/network-context.service';
import { subgraphToPrismaCreate, subgraphToPrismaUpdate } from '../subgraph-mapper';
import { CowAmmController } from '../../controllers';

export class PoolCreatorService {
    constructor(private readonly userService: UserService) {}

    private get balancerSubgraphService() {
        return networkContext.services.balancerSubgraphService;
    }

    private get chain() {
        return networkContext.chain;
    }

    public async syncAllPoolsFromSubgraph(blockNumber: number): Promise<string[]> {
        const existingPools = await prisma.prismaPool.findMany({ where: { chain: this.chain } });
        const subgraphPools = await this.balancerSubgraphService
            .getAllPools({}, false)
            .then((pools) => _.orderBy(pools, ['createTime'], 'asc'));

        // any pool can be nested
        const allNestedTypePools = [
            ...existingPools.map((pool) => ({ id: pool.id, address: pool.address })),
            ...subgraphPools.map((pool) => ({ id: pool.id, address: pool.address })),
        ];

        const poolIds: string[] = [];

        let counter = 1;
        for (const subgraphPool of subgraphPools) {
            console.log(`Syncing pool ${counter} of ${subgraphPools.length}`);
            console.log(`Pool ID: ${subgraphPool.id}`);
            counter = counter + 1;
            const existsInDb = !!existingPools.find((pool) => pool.id === subgraphPool.id);

            if (!existsInDb) {
                await this.createPoolRecord(subgraphPool, blockNumber, allNestedTypePools);

                poolIds.push(subgraphPool.id);
            } else {
                await this.updatePoolRecord(subgraphPool, blockNumber, allNestedTypePools);
            }
        }

        if (poolIds.length > 0) {
            // Attach CowAMM syncing
            console.log('initBalancesForPools: syncing CowAMM balances...');
            await CowAmmController().syncBalances(this.chain);
            console.log('initBalancesForPools: finished syncing CowAMM balances');
        }

        return poolIds;
    }

    public async reloadAllTokenNestedPoolIds(): Promise<void> {
        let operations: any[] = [];
        const pools = await prisma.prismaPool.findMany({
            ...nestedPoolWithSingleLayerNesting,
            where: { chain: this.chain },
        });

        //clear any existing
        await prisma.prismaPoolExpandedTokens.updateMany({
            where: { chain: this.chain },
            data: { nestedPoolId: null },
        });

        for (const pool of pools) {
            const nestedTokens = _.flattenDeep(
                pool.tokens
                    .filter((token) => token.address !== pool.address)
                    .map((token) => [
                        ...(token.nestedPool?.tokens || []).map((nestedToken) => ({
                            ...nestedToken,
                            nestedPoolId: token.nestedPool?.id,
                        })),
                    ]),
            );

            operations = [
                ...operations,
                ...nestedTokens.map((token) =>
                    prisma.prismaPoolExpandedTokens.update({
                        where: {
                            tokenAddress_poolId_chain: {
                                tokenAddress: token.address,
                                poolId: pool.id,
                                chain: this.chain,
                            },
                        },
                        data: { nestedPoolId: token.nestedPoolId },
                    }),
                ),
            ];
        }

        await prismaBulkExecuteOperations(operations);
    }

    private async createPoolRecord(
        pool: BalancerPoolFragment,
        blockNumber: number,
        nestedPools: { id: string; address: string }[],
    ) {
        const poolTokens = pool.tokens || [];

        await prisma.prismaToken.createMany({
            skipDuplicates: true,
            data: [
                ...poolTokens.map((token) => ({
                    address: token.address,
                    symbol: token.symbol,
                    name: token.name,
                    decimals: token.decimals,
                    chain: this.chain,
                })),
                {
                    address: pool.address,
                    symbol: pool.symbol || '',
                    name: pool.name || '',
                    decimals: 18,
                    chain: this.chain,
                },
            ],
        });

        const prismaPoolRecordWithAssociations = subgraphToPrismaCreate(pool, this.chain, blockNumber, nestedPools);

        await prisma.prismaPool.create(prismaPoolRecordWithAssociations);

        await prisma.prismaPoolTokenDynamicData.createMany({
            data: poolTokens.map((token) => ({
                id: token.id,
                chain: this.chain,
                poolTokenId: token.id,
                blockNumber,
                priceRate: token.priceRate || '1.0',
                weight: token.weight,
                balance: token.balance,
                balanceUSD: 0,
            })),
        });

        await this.createAllTokensRelationshipForPool(pool.id);
        await this.userService.initWalletBalancesForPool(pool.id);
    }

    private async updatePoolRecord(
        pool: BalancerPoolFragment,
        blockNumber: number,
        nestedPools: { id: string; address: string }[] = [],
    ) {
        const prismaPoolRecordWithAssociations = subgraphToPrismaUpdate(pool, this.chain, blockNumber, nestedPools);
        const { tokens, ...poolWithoutTokens } = prismaPoolRecordWithAssociations;

        // Make sure all tokens are there, for managed pools tokenlist can change
        // Sometimes the token is not in the DB, so we need to create it
        await prisma.prismaToken.createMany({
            skipDuplicates: true,
            data: [
                ...pool.tokens!.map((token) => ({
                    address: token.address,
                    symbol: token.symbol,
                    name: token.name,
                    decimals: token.decimals,
                    chain: this.chain,
                })),
                {
                    address: pool.address,
                    symbol: pool.symbol || '',
                    name: pool.name || '',
                    decimals: 18,
                    chain: this.chain,
                },
            ],
        });

        for (const token of tokens.update) {
            await prisma.prismaPoolToken.upsert({
                where: token.where,
                create: {
                    ...token.data,
                    poolId: pool.id,
                    chain: this.chain,
                },
                update: {
                    ...token.data,
                },
            });
        }

        await prisma.prismaPoolTokenDynamicData.createMany({
            skipDuplicates: true,
            data: pool.tokens!.map((token) => ({
                id: token.id,
                chain: this.chain,
                poolTokenId: token.id,
                blockNumber,
                priceRate: token.priceRate || '1.0',
                weight: token.weight,
                balance: token.balance,
                balanceUSD: 0,
            })),
        });

        await prisma.prismaPool.update({
            data: poolWithoutTokens,
            where: {
                id_chain: {
                    id: pool.id,
                    chain: this.chain,
                },
            },
        });

        await this.createAllTokensRelationshipForPool(pool.id);
    }

    public async createAllTokensRelationshipForPool(poolId: string): Promise<void> {
        const pool = await prisma.prismaPool.findUnique({
            ...nestedPoolWithSingleLayerNesting,
            where: { id_chain: { id: poolId, chain: this.chain } },
        });

        if (!pool) {
            return;
        }

        const allTokens = _.flattenDeep(
            pool.tokens.map((token) => [
                token,
                ...(token.nestedPool?.tokens || []).map((nestedToken) => ({
                    ...nestedToken,
                    nestedPoolId: token.nestedPool?.id || null,
                })),
            ]),
        );

        await prisma.prismaPoolExpandedTokens.createMany({
            skipDuplicates: true,
            data: allTokens.map((token) => ({
                poolId,
                chain: this.chain,
                tokenAddress: token.address,
                nestedPoolId: token.nestedPoolId || null,
            })),
        });
    }
}
