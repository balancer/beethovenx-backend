import { syncRateProviderReviews } from '../actions/content/sync-rate-providers';
import { syncTags } from '../actions/content/sync-tags';

export function ContentController(tracer?: any) {
    // Setup tracing
    // ...
    return {
        async syncRateProviderReviews() {
            return await syncRateProviderReviews();
        },
        async syncCategories() {
            await syncTags();
            return 'OK';
        },
    };
}
