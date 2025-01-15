import { Chain } from '@prisma/client';
import { ViemClient } from '../../../../sources/types';
import { prisma } from '../../../../../prisma/prisma-client';
import config from '../../../../../config';
import { getEvents } from '../../../../web3/events';
import _ from 'lodash';
import ERC20Abi from '../../../../web3/abi/ERC20.json';
import { formatEther, parseAbi, zeroAddress } from 'viem';
import { multicallViem } from '../../../../web3/multicaller-viem';
import { balancesToDb } from './balances-to-db';
import { getLastSyncedBlock } from '../../../pool/last-synced-block';

const rpcMaxBlockRange = (chain: Chain) => config[chain].rpcMaxBlockRange;

export const syncBptBalancesFromRpc = async (
    poolIds: string[],
    client: ViemClient,
    chain: Chain,
    syncCategory: 'BPT_BALANCES_V2' | 'BPT_BALANCES_V3' | 'BPT_BALANCES_COW_AMM',
) => {
    // Must have poolIds to sync
    if (poolIds.length === 0) {
        console.log(`syncBptBalancesFromRpc ${syncCategory} on ${chain} no pools provided`);
        return 0;
    }

    const endBlock = await client.getBlockNumber().then(Number);

    // Get the balances synced block from the DB
    const startBlock = await getLastSyncedBlock(chain, syncCategory);

    // Don't use RPC when balances weren't synced at all
    if (startBlock === 0) {
        console.log(`syncBptBalancesFromRpc ${syncCategory} on ${chain} no start block provided`);
        return 0;
    }

    const fromBlock = startBlock - 5; // Using just 5 blocks here, because we rely on the subgraph 1st

    // no new blocks have been minted, needed for slow networks
    if (fromBlock > endBlock) {
        console.log(`syncBptBalancesFromRpc ${syncCategory} on ${chain} start block is greater than end block`);
        return 0;
    }

    // Map the poolIds to poolAddresses
    const poolsMap = Object.fromEntries(poolIds.map((id) => [id.slice(0, 42), id]));
    const poolAddresses = Object.keys(poolsMap);

    const range = rpcMaxBlockRange(chain);

    // Split the range into smaller chunks to avoid RPC limits, setting up to 5 times max block range
    const toBlock = Math.min(fromBlock + 5 * range, endBlock);
    console.log(`syncBptBalancesFromRpc ${syncCategory} on ${chain} syncing from ${fromBlock} to ${toBlock}`);
    console.log(`syncBptBalancesFromRpc ${syncCategory} on ${chain} getLogs for ${poolAddresses.length} pools`);

    const events = await getEvents(
        fromBlock,
        toBlock,
        poolAddresses,
        ['Transfer'],
        config[chain].rpcUrl,
        range,
        ERC20Abi,
    );

    console.log(`syncBptBalancesFromRpc ${syncCategory} on ${chain} getLogs for ${poolAddresses.length} pools done`);

    const balancesToFetch = _.uniqBy(
        events
            .filter((event) => poolAddresses.includes(event.address.toLowerCase()))
            .flatMap((event) => [
                { poolAddress: event.address, userAddress: event.args?.from as string },
                { poolAddress: event.address, userAddress: event.args?.to as string },
            ])
            .filter((entry) => entry.userAddress !== zeroAddress),
        (entry) => entry.poolAddress + entry.userAddress,
    );

    console.log(`syncBptBalancesFromRpc ${syncCategory} on ${chain} got ${balancesToFetch.length} balances to fetch.`);

    const balances = await multicallViem(
        client,
        balancesToFetch.map((entry) => ({
            path: entry.poolAddress + '-' + entry.userAddress,
            abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
            address: entry.poolAddress as `0x${string}`,
            functionName: 'balanceOf',
            args: [entry.userAddress as `0x${string}`],
        })),
    );

    const poolShares = Object.keys(balances).map((id) => {
        const [tokenAddress, userAddress] = id.toLowerCase().split('-');
        const poolId = poolsMap[tokenAddress];
        const balance = formatEther(balances[id]);

        return {
            id: id.toLowerCase(),
            poolId,
            chain,
            balance,
            balanceNum: parseFloat(balance),
            tokenAddress,
            userAddress,
        };
    });

    console.log(`syncBptBalancesFromRpc ${syncCategory} on ${chain} got ${poolShares.length} poolShares`);

    const operations = balancesToDb(poolShares, endBlock, syncCategory);
    try {
        await prisma.$transaction(operations);
    } catch (e: any) {
        console.error(`syncBptBalancesFromRpc ${syncCategory} on ${chain}`, e.message);
    }

    return endBlock - startBlock;
};
