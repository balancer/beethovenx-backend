import config from '../../config';
import { prisma } from '../../prisma/prisma-client';
import { poolService } from '../pool/pool.service';
import { getVaultClient } from '../sources/contracts';
import { getV3JoinedSubgraphClient } from '../sources/subgraphs';
import { getViemClient } from '../sources/viem-client';
import { CowAmmController } from './cow-amm-controller';
import { PoolController } from './pool-controller';
import { upsertPools as upsertPoolsV3 } from '../actions/pool/v3/upsert-pools';
import { syncPools as syncPoolsV3 } from '../actions/pool/v3/sync-pools';
import exp from 'constants';

describe('pool controller debugging', () => {
    it('delete reload v3 pools', async () => {
        await prisma.prismaPool.deleteMany({
            where: {
                protocolVersion: 3,
            },
        });

        let pools = await poolService.getGqlPools({ where: { chainIn: ['SEPOLIA'], protocolVersionIn: [3] } });

        expect(pools.length).toBe(0);

        await PoolController().reloadPoolsV3('SEPOLIA');

        pools = await poolService.getGqlPools({ where: { chainIn: ['SEPOLIA'], protocolVersionIn: [3] } });

        expect(pools.length).toBeGreaterThan(0);
    }, 5000000);

    it('sync pools', async () => {
        await CowAmmController().syncPools('MAINNET');
        // await PoolController().syncChangedPoolsV2('MAINNET');
        await PoolController().syncChangedPoolsV3('SEPOLIA');
    }, 5000000);

    it('update surplus apr', async () => {
        await CowAmmController().addPools('MAINNET');
        // await CowAmmController().addPools('MAINNET');
        await CowAmmController().syncSwaps('MAINNET');
        // await CowAmmController().syncSwaps('MAINNET');
        await CowAmmController().syncJoinExits('MAINNET');
        await CowAmmController().updateVolumeAndFees('MAINNET');
        await CowAmmController().updateSurplusAprs();
    }, 5000000);

    it('cow snapshots', async () => {
        await CowAmmController().addPools('MAINNET');
        // await CowAmmController().addPools('MAINNET');
        await CowAmmController().syncSwaps('MAINNET');
        // await CowAmmController().syncSwaps('MAINNET');
        await CowAmmController().syncJoinExits('MAINNET');
        await CowAmmController().updateVolumeAndFees('MAINNET');
        await CowAmmController().syncSnapshots('MAINNET');
        await CowAmmController().updateSurplusAprs();
    }, 5000000);

    it('reload pools', async () => {
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.syncChangedPools();
        // await PoolController().reloadPoolsV3('SEPOLIA');
        const chain = 'SEPOLIA';
        const {
            subgraphs: { balancerV3, balancerPoolsV3 },
            balancer: {
                v3: { vaultAddress },
            },
        } = config[chain];

        // Guard against unconfigured chains
        if (!balancerV3 || !balancerPoolsV3 || !vaultAddress) {
            throw new Error(`Chain not configured: ${chain}`);
        }

        const client = getV3JoinedSubgraphClient(balancerV3, balancerPoolsV3);
        const allPools = (await client.getAllInitializedPools()).filter(
            (pool) => pool.id.toLowerCase() === '0x3ddd1e7adc6a3c1a6cbcf2dc74c6f71b9b347713',
        );

        const viemClient = getViemClient(chain);
        const vaultClient = getVaultClient(viemClient, vaultAddress);
        const latestBlock = await viemClient.getBlockNumber();

        const pools = await upsertPoolsV3(allPools, vaultClient, chain, latestBlock);
        await syncPoolsV3(pools, viemClient, vaultAddress, chain, latestBlock);

        // await upsertLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.POOLS_V3, latestBlock);
    }, 5000000);

    it('erc4626 data', async () => {
        const boostedPool = await poolService.getGqlPool('0x6dbdd7a36d900083a5b86a55583d90021e9f33e8', 'SEPOLIA');

        expect(boostedPool).toBeDefined();
        for (const token of boostedPool.poolTokens) {
            expect(token.isErc4626).toBe(true);
        }
    }, 5000000);
});
