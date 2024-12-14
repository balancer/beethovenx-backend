import { getEvents } from './events';
import { vi, MockedFunction } from 'vitest';

// Mock `fetch` globally
global.fetch = vi.fn();

describe('getEvents', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods
        (global.fetch as MockedFunction<typeof fetch>).mockClear();
    });

    it('fetches successfully', async () => {
        (global.fetch as MockedFunction<typeof fetch>).mockImplementation(() =>
            Promise.resolve(new Response(JSON.stringify({ result: [] }))),
        );

        const result = await getEvents(0, 100, ['0x123'], ['0x456'], 'http://localhost', 50);
        expect(result).toEqual([]);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('handles fetch error', async () => {
        (global.fetch as MockedFunction<typeof fetch>).mockImplementationOnce(() => Promise.reject('Fetch error'));

        try {
            await getEvents(0, 100, ['0x123'], ['0x456'], 'http://localhost', 50);
        } catch (error) {
            expect(error).toEqual('Fetch error');
        }
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('fetches same blocks twice when addresses are more than 500', async () => {
        const addresses = new Array(501).fill('0x1');
        const errorMessage = 'block range is too wide';
        const log = { address: 'address' };

        (global.fetch as MockedFunction<typeof fetch>)
            .mockImplementationOnce(() =>
                Promise.resolve(new Response(JSON.stringify({ error: { message: errorMessage } }))),
            )
            // Return log for first block only
            .mockImplementation((url, options) => {
                const { body } = options || {};
                const payload = JSON.parse(body as string);
                const result: { address: string }[] = [];
                if (payload.params[0].fromBlock === '0x0') {
                    result.push(log);
                }
                return Promise.resolve(new Response(JSON.stringify({ result })));
            });

        const result = await getEvents(0, 4, addresses, ['topic'], 'http://localhost', 2);

        expect(result.length).toEqual(2);
        expect(global.fetch).toHaveBeenCalledTimes(6);
    });
});
