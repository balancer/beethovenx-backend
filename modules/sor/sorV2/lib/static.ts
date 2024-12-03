import { Router } from './router';
import { PrismaPoolAndHookWithDynamic } from '../../../../prisma/prisma-types';
import { checkInputs } from './utils/helpers';
import { ComposableStablePool, FxPool, Gyro2Pool, Gyro3Pool, GyroEPool, MetaStablePool, WeightedPool } from './poolsV2';
import { SwapKind, Token } from '@balancer/sdk';
import { BasePool } from './poolsV2/basePool';
import { SorSwapOptions } from './types';
import { PathWithAmount } from './path';
import { StablePool, WeightedPoolV3 } from './poolsV3';

export async function sorGetPathsWithPools(
    tokenIn: Token,
    tokenOut: Token,
    swapKind: SwapKind,
    swapAmountEvm: bigint,
    prismaPools: PrismaPoolAndHookWithDynamic[],
    protocolVersion: number,
    swapOptions?: Omit<SorSwapOptions, 'graphTraversalConfig.poolIdsToInclude'>,
): Promise<PathWithAmount[] | null> {
    const checkedSwapAmount = checkInputs(tokenIn, tokenOut, swapKind, swapAmountEvm);

    const basePools: BasePool[] = [];

    for (const prismaPool of prismaPools) {
        switch (prismaPool.type) {
            case 'WEIGHTED':
            /// LBPs can be handled like weighted pools
            case 'LIQUIDITY_BOOTSTRAPPING':
                {
                    if (prismaPool.protocolVersion === 2) {
                        basePools.push(WeightedPool.fromPrismaPool(prismaPool));
                    } else {
                        basePools.push(WeightedPoolV3.fromPrismaPool(prismaPool));
                    }
                }
                break;
            case 'COMPOSABLE_STABLE':
            case 'PHANTOM_STABLE':
                basePools.push(ComposableStablePool.fromPrismaPool(prismaPool));
                break;
            case 'STABLE':
                // Since we allowed all the pools, we started getting BAL#322 errors
                // Enabling pools one by one until we find the issue
                if (
                    [
                        '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249', // auraBal/8020
                        '0x2d011adf89f0576c9b722c28269fcb5d50c2d17900020000000000000000024d', // sdBal/8020
                        '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6000200000000000000000426', // dola/usdc
                    ].includes(prismaPool.id) ||
                    protocolVersion === 3
                ) {
                    basePools.push(StablePool.fromPrismaPool(prismaPool));
                }
                break;
            case 'META_STABLE':
                basePools.push(MetaStablePool.fromPrismaPool(prismaPool));
                break;
            case 'FX':
                basePools.push(FxPool.fromPrismaPool(prismaPool));
                break;
            case 'GYRO':
                basePools.push(Gyro2Pool.fromPrismaPool(prismaPool));
                break;
            case 'GYRO3':
                basePools.push(Gyro3Pool.fromPrismaPool(prismaPool));
                break;
            case 'GYROE':
                basePools.push(GyroEPool.fromPrismaPool(prismaPool));
                break;
            default:
                console.log('Unsupported pool type');
                break;
        }
    }

    const router = new Router();

    const candidatePaths = router.getCandidatePaths(
        tokenIn,
        tokenOut,
        basePools,
        protocolVersion === 3,
        swapOptions?.graphTraversalConfig,
    );

    if (candidatePaths.length === 0) return null;

    const bestPaths = router.getBestPaths(candidatePaths, swapKind, checkedSwapAmount);

    if (!bestPaths) return null;

    return bestPaths;
}
