import { Chain, PrismaLastBlockSyncedCategory } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { PoolOnChainDataService } from '../../../pool/lib/pool-on-chain-data.service';
import { getChangedPoolsV2 } from '../../../sources/logs';
import { getViemClient } from '../../../sources/viem-client';
import { getLastSyncedBlock, upsertLastSyncedBlock } from '../last-synced-block';
import config from '../../../../config';

export const syncChangedPools = async (
    chain: Chain,
    vaultAddress: string,
    balancerQueriesAddress: string,
    yieldProtocolFeePercentage: string,
    swapProtocolFeePercentage: string,
    gyroConfig?: string,
): Promise<string[]> => {
    const viemClient = getViemClient(chain);
    const latestBlock = await viemClient.getBlockNumber();

    const lastSyncBlock = await getLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.POOLS);

    const startBlock = lastSyncBlock + 1;
    const endBlock = latestBlock;

    // no new blocks have been minted, needed for slow networks
    if (startBlock > endBlock) {
        return [];
    }

    const poolOnChainDataService = new PoolOnChainDataService(() => ({
        vaultAddress,
        balancerQueriesAddress,
        yieldProtocolFeePercentage,
        swapProtocolFeePercentage,
        gyroConfig,
    }));

    // Update status for all the pools
    await prisma.prismaPool
        .findMany({
            where: { chain },
            select: { id: true },
        })
        .then((pools) => pools.map((pool) => pool.id))
        .then((poolIds) => poolOnChainDataService.updateOnChainStatus(poolIds, chain));

    // Update other data only for the pools that have changed
    const tokenPrices = await prisma.prismaTokenCurrentPrice.findMany({
        where: {
            chain,
        },
    });

    // Use getEvents for that - and refactor it to use viemClient
    const rpcMaxBlockRange = config[chain].rpcMaxBlockRange;
    const range = Number(endBlock) - startBlock;
    const numBatches = Math.ceil(range / rpcMaxBlockRange);

    const allChangedPools = new Set<string>();

    for (let i = 0; i < numBatches; i++) {
        const from = startBlock + (i > 0 ? 1 : 0) + i * rpcMaxBlockRange;
        const to = Math.min(startBlock + (i + 1) * rpcMaxBlockRange, Number(endBlock));

        const changedPools = await getChangedPoolsV2(vaultAddress, viemClient, BigInt(from), BigInt(to));
        changedPools.forEach((pool) => allChangedPools.add(pool));
    }

    // always sync LBP pools
    const lbps = await prisma.prismaPool.findMany({
        where: {
            chain,
            type: 'LIQUIDITY_BOOTSTRAPPING',
        },
        select: { id: true },
    });
    lbps.forEach((pool) => allChangedPools.add(pool.id));

    await poolOnChainDataService.updateOnChainData(Array.from(allChangedPools), chain, Number(endBlock), tokenPrices);

    await upsertLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.POOLS, Number(endBlock));

    return Array.from(allChangedPools);
};
