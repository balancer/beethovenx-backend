// yarn vitest balancer-sorV2.test.ts

import { sorService } from './sor.service';
import { sorV2Service } from './sorV2/sorPathService';
import { chainIdToChain } from '../network/chain-id-to-chain';
import { Chain } from '@prisma/client';
import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';

// modules/sor/sorV2/sorPathService.ts

// This test is used for testing the SOR v2 (or "new" SOR). 
// The goal of this test is to enter the SOR from as far out
// as possible, as not only the path building logic requires testing
// but also other key features, which cannot be tested fully
// if testing is done via `sorGetPathsWithPools`. The call chain
// is as follows:
// sorservice.ts(SorService).getSorSwapPaths
// (sorPathService.ts)SorV2Service.getSorSwapPaths
// (sorPathService.ts)SorV2Service.getSorSwapPaths
// (sorPathService.ts)SorV2Service.getSwapPathsFromSor
// index.ts()sorGetPathsWithPools

// tho run this tests properly the following requirements must be met:
// - db must be running with the pools you intend to have the tests running with
// - db must include pools that have a hook

describe('Sor testing', () => {
    let locallyAvailablePools;
    beforeAll(async () => {
        // returns all pools for v3 on sepolia
        locallyAvailablePools = await fetchPoolsFromGraphQL('SEPOLIA', 3);
    })
    test('it loads all pools (with and without hook)', async () => {
        const chain = Chain.SEPOLIA;
        // returns all pools for v3 on sepolia
        const eligiblePools = await sorV2Service.getBasePoolsFromDb(
            chain,
            3,
            true,
        );
        // the considerPoolsWithHooks flag is set to true, so the pools returned should be the same
        expect(eligiblePools.length).toBeGreaterThan(0);
        expect(locallyAvailablePools.length).toEqual(eligiblePools.length);
    });
    test('it discards pools with hooks', async () => {
        const poolsWithHooks = locallyAvailablePools.filter((pool: any) => pool.hook !== null).length;

        const chain = Chain.SEPOLIA;
        // returns all pools for v3 on sepolia
        const eligiblePools = await sorV2Service.getBasePoolsFromDb(
            chain,
            3,
            false,
        );

        // the considerPoolsWithHooks flag is set to false, so the pools returned must not contain any hooks
        expect(eligiblePools.length).toBeGreaterThan(0);
        expect(eligiblePools.every((pool) => !pool.hook)).toBe(true);
        expect(eligiblePools.length).toBe(locallyAvailablePools.length - poolsWithHooks);
    })

    // requires local endpoint running
    async function fetchPoolsFromGraphQL(chain: string, protocolVersion: number): Promise<any> {
        const query = `
        {
            poolGetPools(where: {
                chainIn: SEPOLIA
                    protocolVersionIn:3}) {
                id
                hook {
                    address
                }
            }
        }
        `;
    
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });
    
        if (!response.ok) {
            throw new Error(`GraphQL query failed: ${response.statusText}`);
        }
    
        const result = await response.json();
        return result.data.poolGetPools;
    }
})