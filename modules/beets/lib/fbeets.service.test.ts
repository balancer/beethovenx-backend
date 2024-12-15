import { prisma } from '../../../prisma/prisma-client';
import { FbeetsService } from './fbeets.service';
import { vi } from 'vitest';

// Mock the Prisma module
vi.mock('../../../prisma/prisma-client', () => {
    const mockPrisma = {
        prismaFbeets: {
            findFirst: vi.fn(() => {}), // Default implementation
            upsert: vi.fn(() => {}),
        },
    };
    return { prisma: mockPrisma }; // Return the mocked Prisma client
});

vi.mock('../../sources/viem-client', () => ({
    getViemClient: vi.fn(() => ({
        multicall: vi.fn(() => {
            return Promise.resolve([4, 2]); // totalSupply and bptBalance
        }),
    })),
}));

describe('fbeets service', () => {
    // Import `prisma` directly from the mock after `vi.mock` is defined
    const service = new FbeetsService();

    beforeEach(() => {
        // Reset mocks and set up sequential mock behavior
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('throws when no ratio in DB', async () => {
        vi.mocked(prisma.prismaFbeets.findFirst)
            .mockReset()
            .mockImplementationOnce(() => Promise.resolve(null) as any); // First call returns null

        try {
            await service.getRatio();
        } catch (e: any) {
            expect(e.message).toBe('Fbeets data has not yet been synced');
        }

        expect.assertions(1);
    });

    test('returns value from the DB', async () => {
        vi.mocked(prisma.prismaFbeets.findFirst)
            .mockReset()
            .mockImplementationOnce(() => Promise.resolve({ ratio: '0.1' }) as any); // First call returns null

        const ratio = await service.getRatio();
        expect(ratio).toEqual('0.1');
    });

    test('sync fBeets ratio', async () => {
        vi.mocked(prisma.prismaFbeets.upsert)
            .mockReset()
            .mockImplementation(() => Promise.resolve({ ratio: '0.1' }) as any); // First call returns null

        await service.syncRatio();

        // Expect the upsert to be called
        expect(vi.mocked(prisma.prismaFbeets.upsert)).toHaveBeenCalledWith({
            where: { id: 'fbeets' },
            create: { id: 'fbeets', ratio: '0.5' },
            update: { ratio: '0.5' },
        });
    });
});
