import { Chain, PrismaLastBlockSyncedCategory } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { PoolOnChainDataService } from '../../../pool/lib/pool-on-chain-data.service';
import { getChangedPoolsV2 } from '../../../sources/logs';
import { getViemClient } from '../../../sources/viem-client';
import { getLastSyncedBlock, upsertLastSyncedBlock } from '../last-synced-block';

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
    const changedPools = await getChangedPoolsV2(vaultAddress, viemClient, BigInt(startBlock), endBlock);

    // always sync LBP pools
    const lbps = await prisma.prismaPool.findMany({
        where: {
            chain,
            type: 'LIQUIDITY_BOOTSTRAPPING',
        },
        select: { id: true },
    });
    changedPools.push(...lbps.map((lbp) => lbp.id));

    await poolOnChainDataService.updateOnChainData(changedPools, chain, Number(endBlock), tokenPrices);

    await upsertLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.POOLS, endBlock);

    return changedPools;
};
