import { syncBlockedBuffers } from '../actions/content/sync-erc4626-blocked-buffers';
import { syncErc4626Reviews } from '../actions/content/sync-erc4626-reviews';
import { syncHookReviews } from '../actions/content/sync-hook-reviews';
import { syncRateProviderReviews } from '../actions/content/sync-rate-provider-reviews';
import { syncTags } from '../actions/content/sync-tags';

export function ContentController(tracer?: any) {
    // Setup tracing
    // ...
    return {
        async syncRateProviderReviews() {
            return await syncRateProviderReviews();
        },
        async syncHookReviews() {
            return await syncHookReviews();
        },
        async syncErc4626Data() {
            await syncBlockedBuffers();
            return await syncErc4626Reviews();
        },
        async syncCategories() {
            await syncTags();
            return 'OK';
        },
    };
}
