import { Chain } from '@prisma/client';
import config from '../../../config';

const ERC4626_REVIEW_URL =
    'https://raw.githubusercontent.com/balancer/code-review/refs/heads/main/erc4626/registry.json';

interface Erc4626Review {
    [chain: string]: {
        [erc4626Address: string]: {
            name: string;
            asset: string;
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

export const getErc4626Reviews = async () => {
    const response = await fetch(ERC4626_REVIEW_URL);
    const list = (await response.json()) as Erc4626Review;

    // Flatten the list by adding the chain and erc4626 address to the object
    const erc4626Tokens = Object.keys(list).flatMap((chain) =>
        Object.keys(list[chain]).map((erc4626Address) => ({
            ...list[chain][erc4626Address],
            chain: githubChainToChain[chain],
            erc4626Address,
        })),
    );

    return erc4626Tokens;
};
