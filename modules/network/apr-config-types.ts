export interface YbAprConfig {
    aave?: AaveAprConfig;
    bloom?: BloomAprConfig;
    beefy?: BeefyAprConfig;
    sftmx?: SftmxAprConfig;
    euler?: EulerAprConfig;
    gearbox?: GearBoxAprConfig;
    idle?: IdleAprConfig;
    maker?: MakerAprConfig;
    ovix?: OvixAprConfig;
    reaper?: ReaperAprConfig;
    tetu?: TetuAprConfig;
    tranchess?: TranchessAprConfig;
    yearn?: YearnAprConfig;
    stakewise?: {
        url: string;
        token: string;
    };
    maple?: {
        url: string;
        token: string;
    };
    yieldnest?: {
        url: string;
        token: string;
    };
    dforce?: {
        token: string;
    };
    etherfi?: string;
    sveth?: boolean;
    defillama?: {
        defillamaPoolId: string;
        tokenAddress: string;
    }[];
    defaultHandlers?: DefaultHandlerAprConfig;
    fixedAprHandler?: FixedAprConfig;
}

export interface AaveAprConfig {
    [version: string]: {
        subgraphUrl: string;
        tokens: {
            [underlyingAssetName: string]: {
                underlyingAssetAddress: string;
                aTokenAddress: string;
                wrappedTokens: {
                    [wrappedTokenName: string]: string;
                };
                isIbYield?: boolean;
            };
        };
    };
}

export interface BeefyAprConfig {
    sourceUrl: string;
    tokens: {
        [tokenName: string]: {
            address: string;
            // To get the vaultId, get the vault address from the token contract(token.vault()),
            // and search for the vault address in the link: https://api.beefy.finance/vaults
            vaultId: string;
            isIbYield?: boolean;
        };
    };
}

export interface BloomAprConfig {
    tokens: {
        [tokenName: string]: {
            address: string;
            feedAddress: string;
            isIbYield?: boolean;
        };
    };
}

export interface SftmxAprConfig {
    tokens: {
        [underlyingAssetName: string]: {
            address: string;
            ftmStakingAddress: string;
        };
    };
}

export interface EulerAprConfig {
    subgraphUrl: string;
    tokens: {
        [tokenName: string]: {
            address: string;
            isIbYield?: boolean;
        };
    };
}

export interface GearBoxAprConfig {
    sourceUrl: string;
    tokens: {
        [tokenName: string]: {
            address: string;
            isIbYield?: boolean;
        };
    };
}

export interface IdleAprConfig {
    sourceUrl: string;
    authorizationHeader: string;
    tokens: {
        [tokenName: string]: {
            address: string;
            wrapped4626Address: string;
            isIbYield?: boolean;
        };
    };
}

export interface MakerAprConfig {
    sdai: string;
}

export interface OvixAprConfig {
    tokens: {
        [tokenName: string]: {
            yieldAddress: string;
            wrappedAddress: string;
            isIbYield?: boolean;
        };
    };
}

export interface ReaperAprConfig {
    subgraphSource?: {
        subgraphUrl: string;
        tokens: {
            [tokenName: string]: {
                address: string;
                isSftmX?: boolean;
                isWstETH?: boolean;
                isIbYield?: boolean;
            };
        };
    };
    onchainSource?: {
        averageAPRAcrossLastNHarvests: number;
        tokens: {
            [tokenName: string]: {
                address: string;
                isSftmX?: boolean;
                isWstETH?: boolean;
                isIbYield?: boolean;
            };
        };
    };
}

export interface TetuAprConfig {
    sourceUrl: string;
    tokens: {
        [tokenName: string]: {
            address: string;
            isIbYield?: boolean;
        };
    };
}

export interface TranchessAprConfig {
    sourceUrl: string;
    tokens: {
        [tokenName: string]: {
            address: string;
            underlyingAssetName: string;
            isIbYield?: boolean;
        };
    };
}

export interface YearnAprConfig {
    sourceUrl: string;
    isIbYield?: boolean;
}

export interface DefaultHandlerAprConfig {
    [tokenName: string]: {
        sourceUrl: string;
        tokenAddress: string;
        path?: string;
        scale?: number;
        group?: string;
        isIbYield?: boolean;
    };
}

export interface FixedAprConfig {
    [tokenName: string]: {
        address: string;
        apr: number;
        group?: string;
        isIbYield?: boolean;
    };
}
