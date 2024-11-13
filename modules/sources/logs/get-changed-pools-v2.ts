import { ViemClient } from '../types';
import VaultV2 from '../../pool/abi/Vault.json';

const events = VaultV2.filter(
    (i) => i.type === 'event' && ['PoolBalanceChanged', 'Swap', 'PoolBalanceManaged'].includes(i.name || ''),
);

/**
 * Extracts pool IDs from PoolBalanceChanged and Swap events changing the pool state
 *
 * @param vaultAddress - the address of the vault
 * @param client - the viem client to use
 * @param fromBlock - the block to start from
 * @param toBlock - the block to end at. When passing toBlock clients usually complain about too wide block range, without a limit it throws only when max logs are reached
 * @returns - the list of pool addresses that have changed
 */
export const getChangedPoolsV2 = async (
    vaultAddress: string,
    client: ViemClient,
    fromBlock: bigint,
    toBlock: bigint,
) => {
    // Get Transfer logs from the vault
    const logs = await client.getLogs({
        address: vaultAddress as `0x${string}`,
        events,
        fromBlock,
        toBlock,
    });

    // Get pools and make them unique
    const changedPools: string[] = logs
        .map((log) => (log as any).args.poolId)
        .filter((value, index, self) => self.indexOf(value) === index);

    return changedPools;
};
