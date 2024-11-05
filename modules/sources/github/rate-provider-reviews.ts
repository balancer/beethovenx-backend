import { Chain } from '@prisma/client';
import config from '../../../config';

const RATEPROVIDER_REVIEW_URL =
    'https://raw.githubusercontent.com/balancer/code-review/main/rate-providers/registry.json';

interface RateProviderReview {
    [chain: string]: {
        [rateproviderAddress: string]: {
            name: string;
            asset: string;
            summary: string;
            review: string;
            warnings: string[];
            factory: string;
            upgradeableComponents: {
                entrypoint: string;
                implementationReviewed: string;
            }[];
        };
    };
}

const githubChainToChain: { [chain: string]: Chain } = {
    ethereum: Chain.MAINNET,
    ...Object.fromEntries(Object.keys(config).map((chain) => [chain.toLowerCase(), chain])),
};

export const getRateProviderReviews = async () => {
    const response = await fetch(RATEPROVIDER_REVIEW_URL);
    const list = (await response.json()) as RateProviderReview;

    // Flatten the list by adding the chain and rate provider address to the object
    const rateProviders = Object.keys(list).flatMap((chain) =>
        Object.keys(list[chain]).map((rateProviderAddress) => ({
            ...list[chain][rateProviderAddress],
            chain: githubChainToChain[chain],
            rateProviderAddress,
        })),
    );

    return rateProviders;
};
