import { Chain } from '@prisma/client';
import config from '../../../config';

const HOOK_REVIEW_URL = 'https://raw.githubusercontent.com/balancer/code-review/refs/heads/main/hooks/registry.json';

interface HookReview {
    [chain: string]: {
        [hookAddress: string]: {
            name: string;
            description: string;
            summary: string;
            review: string;
            warnings: string[];
        };
    };
}

const githubChainToChain: { [chain: string]: Chain } = {
    ethereum: Chain.MAINNET,
    ...Object.fromEntries(Object.keys(config).map((chain) => [chain.toLowerCase(), chain])),
};

export const getHookReviews = async () => {
    const response = await fetch(HOOK_REVIEW_URL);
    const list = (await response.json()) as HookReview;

    // Flatten the list by adding the chain and hook address to the object
    const hooks = Object.keys(list).flatMap((chain) =>
        Object.keys(list[chain]).map((hookAddress) => ({
            ...list[chain][hookAddress],
            chain: githubChainToChain[chain],
            hookAddress,
        })),
    );

    return hooks;
};
