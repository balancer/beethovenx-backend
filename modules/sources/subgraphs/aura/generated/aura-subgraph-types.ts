import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
    Address: any;
    BigNumber: any;
    DateTime: any;
    JSON: any;
};

export type AprGroupHistoricSchema = {
    __typename?: 'APRGroupHistoricSchema';
    breakdown: Scalars['JSON'];
    timestamp: Scalars['Int'];
    total: Scalars['Float'];
};

export type AprGroupSchema = {
    __typename?: 'APRGroupSchema';
    breakdown: Array<AprSchema>;
    id: Scalars['ID'];
    projectedBreakdown?: Maybe<Array<AprSchema>>;
    projectedTotal?: Maybe<Scalars['Float']>;
    stakingToken: TokenSchema;
    total: Scalars['Float'];
    totalHistoric: Array<AprGroupHistoricSchema>;
};

export type AprGroupSchemaTotalHistoricArgs = {
    range: DateRangeIntervalInput;
};

export type AprSchema = {
    __typename?: 'APRSchema';
    id: Scalars['ID'];
    /** Yield on underlying tokens (e.g. stETH) */
    isBalancerYield?: Maybe<Scalars['Boolean']>;
    /** Extra rewards on Aura */
    isExtraAuraRewards?: Maybe<Scalars['Boolean']>;
    /** Extra claimable rewards forwarded from Balancer */
    isExtraBalancerRewards?: Maybe<Scalars['Boolean']>;
    name: Scalars['String'];
    token?: Maybe<TokenSchema>;
    value: Scalars['Float'];
};

export type AccountRewardSchema = {
    __typename?: 'AccountRewardSchema';
    earned: Scalars['BigNumber'];
    earnedUSD: Scalars['Float'];
    reward: RewardSchema;
};

export type AccountSchema = {
    __typename?: 'AccountSchema';
    id: Scalars['String'];
    lockerAccount?: Maybe<LockerAccountSchema>;
    meditators: Array<Scalars['Int']>;
    poolAccounts: Array<PoolAccountSchema>;
    vaultAccount?: Maybe<VaultAccountSchema>;
};

export type AuraAccountEdge = {
    __typename?: 'AuraAccountEdge';
    node: AccountSchema;
};

export type AuraAccounts = {
    __typename?: 'AuraAccounts';
    edges: Array<AuraAccountEdge>;
};

export type BalancerPoolSchema = {
    __typename?: 'BalancerPoolSchema';
    balancerTokenIds: Array<Scalars['Address']>;
    data: Scalars['JSON'];
    factory?: Maybe<Scalars['Address']>;
    poolAPRs: Scalars['JSON'];
    totalLiquidity: Scalars['JSON'];
};

/** Block */
export type BlockSchema = {
    __typename?: 'BlockSchema';
    chainId: Scalars['Int'];
    number: Scalars['Int'];
    timestamp: Scalars['Int'];
};

export type DateRangeIntervalInput = {
    end: Scalars['Int'];
    frequency: Scalars['Int'];
    start: Scalars['Int'];
};

export type ExtraRewardSchema = {
    __typename?: 'ExtraRewardSchema';
    amount: Scalars['BigNumber'];
    funded: Array<FundedSchema>;
    id: Scalars['ID'];
    queued: Array<QueuedSchema>;
    token: TokenSchema;
};

export type FundedSchema = {
    __typename?: 'FundedSchema';
    amount: Scalars['BigNumber'];
    epoch: Scalars['BigNumber'];
    id: Scalars['ID'];
};

export type LockerAccountLockSchema = {
    __typename?: 'LockerAccountLockSchema';
    amount: Scalars['BigNumber'];
    id: Scalars['ID'];
    relockTime: Scalars['DateTime'];
    unlockTime: Scalars['DateTime'];
};

export type LockerAccountSchema = {
    __typename?: 'LockerAccountSchema';
    balance: Scalars['BigNumber'];
    balanceLocked: Scalars['BigNumber'];
    balanceNextUnlockIndex: Scalars['BigNumber'];
    currentVotingPower: Scalars['BigNumber'];
    delegate?: Maybe<Scalars['Address']>;
    id: Scalars['Address'];
    locked: Scalars['BigNumber'];
    locks: Array<LockerAccountLockSchema>;
    nextVotingPower: Scalars['BigNumber'];
    rewards: Array<AccountRewardSchema>;
    total: Scalars['BigNumber'];
    unlockable: Scalars['BigNumber'];
};

export type LockerSchema = {
    __typename?: 'LockerSchema';
    account?: Maybe<LockerAccountSchema>;
    address: Scalars['Address'];
    aprs: AprGroupSchema;
    chainId: Scalars['Int'];
    epoch: Scalars['Int'];
    id: Scalars['ID'];
    lockedSupply: Scalars['BigNumber'];
    rewards: Array<RewardSchema>;
    totalLocked: Scalars['BigNumber'];
};

export type LockerSchemaAccountArgs = {
    id: Scalars['String'];
};

export type Mutation = {
    __typename?: 'Mutation';
    createHistoricVaultAPRs: Scalars['Boolean'];
    generateAdminToken: Scalars['String'];
    removeHistoricVaultAPRs: Scalars['Boolean'];
    syncAllMeditators: Scalars['Boolean'];
    updatePrices: Scalars['Boolean'];
    updateVaultDepositTransactions: Scalars['Boolean'];
};

export type MutationCreateHistoricVaultApRsArgs = {
    chainId?: Scalars['Int'];
    range: DateRangeIntervalInput;
};

export type MutationGenerateAdminTokenArgs = {
    password: Scalars['String'];
};

export type MutationRemoveHistoricVaultApRsArgs = {
    chainId?: Scalars['Int'];
    range: DateRangeIntervalInput;
};

export type PagingInput = {
    first: Scalars['Int'];
};

export type PoolAccountSchema = {
    __typename?: 'PoolAccountSchema';
    id: Scalars['ID'];
    pool: PoolSchema;
    rewards: Array<AccountRewardSchema>;
    staked: Scalars['BigNumber'];
};

export type PoolSchema = {
    __typename?: 'PoolSchema';
    account?: Maybe<PoolAccountSchema>;
    addedAt?: Maybe<Scalars['DateTime']>;
    address: Scalars['Address'];
    aprs: AprGroupSchema;
    balancerPool?: Maybe<BalancerPoolSchema>;
    balancerPoolId?: Maybe<Scalars['String']>;
    boost?: Maybe<Scalars['Float']>;
    chainId: Scalars['Int'];
    depositToken: TokenSchema;
    extraRewards: Array<ExtraRewardSchema>;
    gauge?: Maybe<Scalars['String']>;
    id: Scalars['ID'];
    isPhantomPool: Scalars['Boolean'];
    isShutdown: Scalars['Boolean'];
    lpToken: TokenSchema;
    name: Scalars['String'];
    poolId: Scalars['ID'];
    prevPoolIds: Array<Scalars['ID']>;
    price?: Maybe<Scalars['Float']>;
    rewardPool: Scalars['Address'];
    rewards: Array<RewardSchema>;
    stash?: Maybe<Scalars['String']>;
    token: TokenSchema;
    /** Underlying token weights */
    tokenWeights: Array<Scalars['Float']>;
    /** Underlying tokens */
    tokens: Array<TokenSchema>;
    totalStaked: Scalars['BigNumber'];
    totalSupply: Scalars['BigNumber'];
    tvl?: Maybe<Scalars['Float']>;
    version: Scalars['Int'];
};

export type PoolSchemaAccountArgs = {
    id: Scalars['String'];
};

export type Query = {
    __typename?: 'Query';
    account?: Maybe<AccountSchema>;
    accounts: Array<AccountSchema>;
    allBlocks?: Maybe<Array<BlockSchema>>;
    allPools: Array<PoolSchema>;
    allSystem?: Maybe<Array<SystemSchema>>;
    allTokens: Array<TokenSchema>;
    allVaults?: Maybe<Array<VaultSchema>>;
    /** @deprecated Deprecated in favour of `accounts` query */
    auraAccounts: AuraAccounts;
    block: BlockSchema;
    locker?: Maybe<LockerSchema>;
    lockers: Array<LockerSchema>;
    pool?: Maybe<PoolSchema>;
    pools: Array<PoolSchema>;
    system?: Maybe<SystemSchema>;
    token?: Maybe<TokenSchema>;
    tokens: Array<TokenSchema>;
    vault?: Maybe<VaultSchema>;
};

export type QueryAccountArgs = {
    chainId?: Scalars['Int'];
    id: Scalars['String'];
};

export type QueryAccountsArgs = {
    ids?: InputMaybe<Array<Scalars['String']>>;
};

export type QueryAllBlocksArgs = {
    chainIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type QueryAllPoolsArgs = {
    chainIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type QueryAllSystemArgs = {
    chainIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type QueryAllVaultsArgs = {
    chainIds?: Array<Scalars['Int']>;
};

export type QueryAuraAccountsArgs = {
    paging: PagingInput;
};

export type QueryBlockArgs = {
    chainId?: Scalars['Int'];
};

export type QueryLockerArgs = {
    chainId?: InputMaybe<Scalars['Int']>;
};

export type QueryLockersArgs = {
    chainIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type QueryPoolArgs = {
    chainId?: InputMaybe<Scalars['Int']>;
    id: Scalars['String'];
};

export type QueryPoolsArgs = {
    chainId?: InputMaybe<Scalars['Int']>;
};

export type QuerySystemArgs = {
    chainId?: InputMaybe<Scalars['Int']>;
};

export type QueryTokenArgs = {
    address: Scalars['String'];
    chainId?: InputMaybe<Scalars['Int']>;
};

export type QueryTokensArgs = {
    chainId?: InputMaybe<Scalars['Int']>;
};

export type QueryVaultArgs = {
    chainId?: Scalars['Int'];
};

export type QueuedSchema = {
    __typename?: 'QueuedSchema';
    amount: Scalars['BigNumber'];
    epoch: Scalars['BigNumber'];
    id: Scalars['ID'];
};

export type RewardSchema = {
    __typename?: 'RewardSchema';
    address?: Maybe<Scalars['Address']>;
    expired: Scalars['Boolean'];
    id: Scalars['ID'];
    isMintedAura?: Maybe<Scalars['Boolean']>;
    lastUpdateTime: Scalars['Int'];
    periodFinish: Scalars['Int'];
    queuedRewards: Scalars['BigNumber'];
    rewardPerTokenStored: Scalars['BigNumber'];
    rewardPerYear: Scalars['BigNumber'];
    rewardRate: Scalars['BigNumber'];
    token: TokenSchema;
};

export type SystemSchema = {
    __typename?: 'SystemSchema';
    auraBalTotalSupply: Scalars['BigNumber'];
    chainId: Scalars['Int'];
    isShutdown: Scalars['Boolean'];
};

/** ERC20 Token */
export type TokenSchema = {
    __typename?: 'TokenSchema';
    address: Scalars['Address'];
    chainId: Scalars['Int'];
    decimals: Scalars['Int'];
    l1Token?: Maybe<TokenSchema>;
    name: Scalars['String'];
    price?: Maybe<Scalars['Float']>;
    symbol: Scalars['String'];
};

export type VaultAccountSchema = {
    __typename?: 'VaultAccountSchema';
    id: Scalars['Address'];
    rewards: Array<AccountRewardSchema>;
    shares: Scalars['BigNumber'];
    staked: Scalars['BigNumber'];
};

export type VaultSchema = {
    __typename?: 'VaultSchema';
    account?: Maybe<VaultAccountSchema>;
    address: Scalars['Address'];
    aprs: AprGroupSchema;
    asset: TokenSchema;
    chainId: Scalars['Int'];
    historicAPRs: Array<AprGroupHistoricSchema>;
    id: Scalars['ID'];
    price?: Maybe<Scalars['Float']>;
    rewards: Array<RewardSchema>;
    token: TokenSchema;
    totalSupply: Scalars['BigNumber'];
    totalUnderlying: Scalars['BigNumber'];
    tvl?: Maybe<Scalars['Float']>;
};

export type VaultSchemaAccountArgs = {
    id: Scalars['String'];
};

export type VaultSchemaHistoricApRsArgs = {
    range: DateRangeIntervalInput;
};

export type AllPoolsQueryVariables = Exact<{
    chainIds?: Maybe<Array<Scalars['Int']> | Scalars['Int']>;
}>;

export type AllPoolsQuery = {
    __typename?: 'Query';
    allPools: Array<{
        __typename?: 'PoolSchema';
        id: string;
        chainId: number;
        address: any;
        isShutdown: boolean;
        aprs: { __typename?: 'APRGroupSchema'; total: number };
        lpToken: { __typename?: 'TokenSchema'; address: any };
    }>;
};

export type PoolSchemaFragment = {
    __typename?: 'PoolSchema';
    id: string;
    chainId: number;
    address: any;
    isShutdown: boolean;
    aprs: { __typename?: 'APRGroupSchema'; total: number };
    lpToken: { __typename?: 'TokenSchema'; address: any };
};

export type AccountsQueryVariables = Exact<{
    ids?: Maybe<Array<Scalars['String']> | Scalars['String']>;
}>;

export type AccountsQuery = {
    __typename?: 'Query';
    accounts: Array<{
        __typename?: 'AccountSchema';
        id: string;
        poolAccounts: Array<{
            __typename?: 'PoolAccountSchema';
            staked: any;
            pool: {
                __typename?: 'PoolSchema';
                id: string;
                address: any;
                chainId: number;
                lpToken: { __typename?: 'TokenSchema'; address: any };
            };
        }>;
    }>;
};

export type AccountSchemaFragment = {
    __typename?: 'AccountSchema';
    id: string;
    poolAccounts: Array<{
        __typename?: 'PoolAccountSchema';
        staked: any;
        pool: {
            __typename?: 'PoolSchema';
            id: string;
            address: any;
            chainId: number;
            lpToken: { __typename?: 'TokenSchema'; address: any };
        };
    }>;
};

export const PoolSchemaFragmentDoc = gql`
    fragment PoolSchema on PoolSchema {
        id
        chainId
        address
        isShutdown
        aprs {
            total
        }
        lpToken {
            address
        }
    }
`;
export const AccountSchemaFragmentDoc = gql`
    fragment AccountSchema on AccountSchema {
        id
        poolAccounts {
            staked
            pool {
                id
                address
                chainId
                lpToken {
                    address
                }
            }
        }
    }
`;
export const AllPoolsDocument = gql`
    query allPools($chainIds: [Int!]) {
        allPools(chainIds: $chainIds) {
            ...PoolSchema
        }
    }
    ${PoolSchemaFragmentDoc}
`;
export const AccountsDocument = gql`
    query accounts($ids: [String!]) {
        accounts(ids: $ids) {
            ...AccountSchema
        }
    }
    ${AccountSchemaFragmentDoc}
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        allPools(
            variables?: AllPoolsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<AllPoolsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<AllPoolsQuery>(AllPoolsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'allPools',
            );
        },
        accounts(
            variables?: AccountsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<AccountsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<AccountsQuery>(AccountsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'accounts',
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
