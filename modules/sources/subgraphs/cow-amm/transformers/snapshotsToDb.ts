import { Chain, Prisma } from '@prisma/client';
import { CowAmmSnapshotFragment } from '../generated/types';

export const snapshotToDb = (
    chain: Chain,
    protocolVersion: number,
    snapshot: CowAmmSnapshotFragment,
): Prisma.PrismaPoolSnapshotUncheckedCreateInput => {
    const defaultZeros = Array.from({ length: snapshot.pool.tokens.length }, () => '0');

    const defaults = {
        id: `${snapshot.pool.id}-${snapshot.timestamp}`,
        timestamp: snapshot.timestamp,
        poolId: snapshot.pool.id,
        chain,
        protocolVersion,
        // Defaults
        totalShares: snapshot?.totalShares || '0',
        totalSharesNum: parseFloat(snapshot?.totalShares || '0'),
        swapsCount: Number(snapshot?.swapsCount) || 0,
        holdersCount: Number(snapshot?.holdersCount) || 0,
        totalVolumes: snapshot?.totalSwapVolumes || defaultZeros,
        totalSwapFees: snapshot?.totalSwapFees || defaultZeros,
        totalProtocolSwapFees: defaultZeros,
        totalProtocolYieldFees: defaultZeros,
        amounts: snapshot?.balances || defaultZeros,
        totalSurpluses: snapshot?.totalSurpluses || defaultZeros,
        // USD values
        totalLiquidity: 0,
        sharePrice: 0,
        totalSwapVolume: 0,
        totalSwapFee: 0,
        // USD based on a previous snapshot
        volume24h: 0,
        fees24h: 0,
    };

    return defaults;
};
