import { retryOnFailureWithRotation } from './retry-on-failure';
import { vi } from 'vitest';

describe('retryOnFailureWithRotation', () => {
    it('should retry with the next SDK client when the first one fails', async () => {
        // Mock SDK clients
        const sdkClient1 = {
            fetchData: vi.fn().mockRejectedValueOnce(new Error('First client error')),
        };
        const sdkClient2 = {
            fetchData: vi.fn().mockResolvedValueOnce('Second client success'),
        };

        const sdkClients = [sdkClient1, sdkClient2];

        // Function to be retried
        const fn = (sdk: any) => sdk.fetchData();

        // Call the function
        const result = await retryOnFailureWithRotation(sdkClients, fn, 2);

        // Verify the result
        expect(result).toBe('Second client success');

        // Verify the calls
        expect(sdkClient1.fetchData).toHaveBeenCalledTimes(1);
        expect(sdkClient2.fetchData).toHaveBeenCalledTimes(1);
    });

    it('should throw an error after exhausting retries', async () => {
        // Mock SDK clients
        const sdkClient1 = {
            fetchData: vi.fn().mockRejectedValue(new Error('First client error')),
        };
        const sdkClient2 = {
            fetchData: vi.fn().mockRejectedValue(new Error('Second client error')),
        };

        const sdkClients = [sdkClient1, sdkClient2];

        // Function to be retried
        const fn = (sdk: any) => sdk.fetchData();

        // Call the function and expect an error
        await expect(retryOnFailureWithRotation(sdkClients, fn, 2)).rejects.toThrow(
            'All SDK clients failed after retries.',
        );

        // Verify the calls
        expect(sdkClient1.fetchData).toHaveBeenCalledTimes(1);
        expect(sdkClient2.fetchData).toHaveBeenCalledTimes(1);
    });
});
