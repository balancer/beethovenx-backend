import { ViemClient } from '../../types';
import { stableContractCalls, parseStableContractCalls, PoolTypeData } from '../pool-type-dynamic-data';
import { multicallViem, ViemMulticallCall } from '../../../web3/multicaller-viem';
import { PrismaPoolType } from '@prisma/client';

export const fetchPoolTypeData = async (
    client: ViemClient,
    pools: {
        id: string;
        type: PrismaPoolType;
    }[],
    blockNumber?: bigint,
): Promise<PoolTypeData[]> => {
    const calls = pools
        .flatMap((pool) => {
            switch (pool.type) {
                case PrismaPoolType.STABLE:
                    return stableContractCalls([pool.id]);
            }
        })
        .filter((x): x is ViemMulticallCall => !!x);

    const results = await multicallViem(client, calls, blockNumber);

    const params = pools
        .map(({ id, type }) => {
            const result = results[id];

            if (result === undefined) {
                return undefined;
            }

            switch (type) {
                case PrismaPoolType.STABLE:
                    return {
                        id,
                        typeData: parseStableContractCalls(result),
                    };
            }
        })
        .filter((x): x is PoolTypeData => x !== undefined);

    return params;
};
