import { syncPools } from './sync-pools';
import { prisma } from '../../../../prisma/prisma-client';
import type { VaultClient } from '../../../sources/contracts';

jest.mock('../../../prisma/prisma-client', () => ({
    prisma: {
        prismaPoolDynamicData: {
            update: jest.fn(),
        },
        prismaToken: {
            findMany: jest.fn().mockResolvedValue([]),
        },
        prismaTokenCurrentPrice: {
            findMany: jest.fn().mockResolvedValue([]),
        },
    },
}));

// TODO: re-implement after the DB is refactored, so there is less logic to mock
describe('syncPools', () => {
    const ids = ['1', '2'];
    const vaultClient: VaultClient = {
        fetchPoolData: jest.fn().mockResolvedValue({ '1': { tokens: [] }, '2': { tokens: [] } }),
        fetchProtocolFees: jest.fn().mockResolvedValue({}),
    };

    // beforeEach(() => {
    //     jest.clearAllMocks();
    //     return syncPools(ids, vaultClient, 'SEPOLIA', BigInt(1));
    // });

    it('should fetch data from the vault contract', async () => {
        expect(vaultClient.fetchPoolData).toHaveBeenCalled();
    });

    it('should store missing pools in the database', async () => {
        expect(prisma.prismaPoolDynamicData.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ poolId: '1' }) }),
        );
    });
});
