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
    BigDecimal: string;
    BigInt: string;
    Bytes: string;
    Int8: any;
    Timestamp: any;
};

export enum Aggregation_Interval {
    day = 'day',
    hour = 'hour',
}

export type BlockChangedFilter = {
    number_gte: Scalars['Int'];
};

export type Block_Height = {
    hash?: InputMaybe<Scalars['Bytes']>;
    number?: InputMaybe<Scalars['Int']>;
    number_gte?: InputMaybe<Scalars['Int']>;
};

export type Deposit = {
    __typename?: 'Deposit';
    ftmAmount: Scalars['BigDecimal'];
    id: Scalars['Bytes'];
    sftmxAmount: Scalars['BigDecimal'];
    timestamp: Scalars['Int'];
    user: User;
};

export type Deposit_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>;
    ftmAmount?: InputMaybe<Scalars['BigDecimal']>;
    ftmAmount_gt?: InputMaybe<Scalars['BigDecimal']>;
    ftmAmount_gte?: InputMaybe<Scalars['BigDecimal']>;
    ftmAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    ftmAmount_lt?: InputMaybe<Scalars['BigDecimal']>;
    ftmAmount_lte?: InputMaybe<Scalars['BigDecimal']>;
    ftmAmount_not?: InputMaybe<Scalars['BigDecimal']>;
    ftmAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    id?: InputMaybe<Scalars['Bytes']>;
    id_contains?: InputMaybe<Scalars['Bytes']>;
    id_gt?: InputMaybe<Scalars['Bytes']>;
    id_gte?: InputMaybe<Scalars['Bytes']>;
    id_in?: InputMaybe<Array<Scalars['Bytes']>>;
    id_lt?: InputMaybe<Scalars['Bytes']>;
    id_lte?: InputMaybe<Scalars['Bytes']>;
    id_not?: InputMaybe<Scalars['Bytes']>;
    id_not_contains?: InputMaybe<Scalars['Bytes']>;
    id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    or?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>;
    sftmxAmount?: InputMaybe<Scalars['BigDecimal']>;
    sftmxAmount_gt?: InputMaybe<Scalars['BigDecimal']>;
    sftmxAmount_gte?: InputMaybe<Scalars['BigDecimal']>;
    sftmxAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    sftmxAmount_lt?: InputMaybe<Scalars['BigDecimal']>;
    sftmxAmount_lte?: InputMaybe<Scalars['BigDecimal']>;
    sftmxAmount_not?: InputMaybe<Scalars['BigDecimal']>;
    sftmxAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    timestamp?: InputMaybe<Scalars['Int']>;
    timestamp_gt?: InputMaybe<Scalars['Int']>;
    timestamp_gte?: InputMaybe<Scalars['Int']>;
    timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    timestamp_lt?: InputMaybe<Scalars['Int']>;
    timestamp_lte?: InputMaybe<Scalars['Int']>;
    timestamp_not?: InputMaybe<Scalars['Int']>;
    timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
    user?: InputMaybe<Scalars['String']>;
    user_?: InputMaybe<User_Filter>;
    user_contains?: InputMaybe<Scalars['String']>;
    user_contains_nocase?: InputMaybe<Scalars['String']>;
    user_ends_with?: InputMaybe<Scalars['String']>;
    user_ends_with_nocase?: InputMaybe<Scalars['String']>;
    user_gt?: InputMaybe<Scalars['String']>;
    user_gte?: InputMaybe<Scalars['String']>;
    user_in?: InputMaybe<Array<Scalars['String']>>;
    user_lt?: InputMaybe<Scalars['String']>;
    user_lte?: InputMaybe<Scalars['String']>;
    user_not?: InputMaybe<Scalars['String']>;
    user_not_contains?: InputMaybe<Scalars['String']>;
    user_not_contains_nocase?: InputMaybe<Scalars['String']>;
    user_not_ends_with?: InputMaybe<Scalars['String']>;
    user_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    user_not_in?: InputMaybe<Array<Scalars['String']>>;
    user_not_starts_with?: InputMaybe<Scalars['String']>;
    user_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    user_starts_with?: InputMaybe<Scalars['String']>;
    user_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Deposit_OrderBy {
    ftmAmount = 'ftmAmount',
    id = 'id',
    sftmxAmount = 'sftmxAmount',
    timestamp = 'timestamp',
    user = 'user',
    user__id = 'user__id',
    user__sftmxBalance = 'user__sftmxBalance',
}

export type FtmStaking = {
    __typename?: 'FtmStaking';
    id: Scalars['Bytes'];
    maintenancePaused: Scalars['Boolean'];
    maxDepositLimit: Scalars['BigInt'];
    minDepositLimit: Scalars['BigInt'];
    undelegatePaused: Scalars['Boolean'];
    users?: Maybe<Array<User>>;
    vaults?: Maybe<Array<Vault>>;
    withdrawPaused: Scalars['Boolean'];
};

export type FtmStakingUsersArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<User_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<User_Filter>;
};

export type FtmStakingVaultsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Vault_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Vault_Filter>;
};

export type FtmStakingSnapshot = {
    __typename?: 'FtmStakingSnapshot';
    exchangeRate: Scalars['BigDecimal'];
    freePoolFtmAmount: Scalars['BigDecimal'];
    id: Scalars['Bytes'];
    lockedFtmAmount: Scalars['BigDecimal'];
    snapshotTimestamp: Scalars['Int'];
    totalFtmAmount: Scalars['BigDecimal'];
};

export type FtmStakingSnapshot_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<FtmStakingSnapshot_Filter>>>;
    exchangeRate?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_gt?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_gte?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    exchangeRate_lt?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_lte?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_not?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    freePoolFtmAmount?: InputMaybe<Scalars['BigDecimal']>;
    freePoolFtmAmount_gt?: InputMaybe<Scalars['BigDecimal']>;
    freePoolFtmAmount_gte?: InputMaybe<Scalars['BigDecimal']>;
    freePoolFtmAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    freePoolFtmAmount_lt?: InputMaybe<Scalars['BigDecimal']>;
    freePoolFtmAmount_lte?: InputMaybe<Scalars['BigDecimal']>;
    freePoolFtmAmount_not?: InputMaybe<Scalars['BigDecimal']>;
    freePoolFtmAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    id?: InputMaybe<Scalars['Bytes']>;
    id_contains?: InputMaybe<Scalars['Bytes']>;
    id_gt?: InputMaybe<Scalars['Bytes']>;
    id_gte?: InputMaybe<Scalars['Bytes']>;
    id_in?: InputMaybe<Array<Scalars['Bytes']>>;
    id_lt?: InputMaybe<Scalars['Bytes']>;
    id_lte?: InputMaybe<Scalars['Bytes']>;
    id_not?: InputMaybe<Scalars['Bytes']>;
    id_not_contains?: InputMaybe<Scalars['Bytes']>;
    id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    lockedFtmAmount?: InputMaybe<Scalars['BigDecimal']>;
    lockedFtmAmount_gt?: InputMaybe<Scalars['BigDecimal']>;
    lockedFtmAmount_gte?: InputMaybe<Scalars['BigDecimal']>;
    lockedFtmAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    lockedFtmAmount_lt?: InputMaybe<Scalars['BigDecimal']>;
    lockedFtmAmount_lte?: InputMaybe<Scalars['BigDecimal']>;
    lockedFtmAmount_not?: InputMaybe<Scalars['BigDecimal']>;
    lockedFtmAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    or?: InputMaybe<Array<InputMaybe<FtmStakingSnapshot_Filter>>>;
    snapshotTimestamp?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_gt?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_gte?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    snapshotTimestamp_lt?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_lte?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_not?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
    totalFtmAmount?: InputMaybe<Scalars['BigDecimal']>;
    totalFtmAmount_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalFtmAmount_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalFtmAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalFtmAmount_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalFtmAmount_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalFtmAmount_not?: InputMaybe<Scalars['BigDecimal']>;
    totalFtmAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum FtmStakingSnapshot_OrderBy {
    exchangeRate = 'exchangeRate',
    freePoolFtmAmount = 'freePoolFtmAmount',
    id = 'id',
    lockedFtmAmount = 'lockedFtmAmount',
    snapshotTimestamp = 'snapshotTimestamp',
    totalFtmAmount = 'totalFtmAmount',
}

export type FtmStaking_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<FtmStaking_Filter>>>;
    id?: InputMaybe<Scalars['Bytes']>;
    id_contains?: InputMaybe<Scalars['Bytes']>;
    id_gt?: InputMaybe<Scalars['Bytes']>;
    id_gte?: InputMaybe<Scalars['Bytes']>;
    id_in?: InputMaybe<Array<Scalars['Bytes']>>;
    id_lt?: InputMaybe<Scalars['Bytes']>;
    id_lte?: InputMaybe<Scalars['Bytes']>;
    id_not?: InputMaybe<Scalars['Bytes']>;
    id_not_contains?: InputMaybe<Scalars['Bytes']>;
    id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    maintenancePaused?: InputMaybe<Scalars['Boolean']>;
    maintenancePaused_in?: InputMaybe<Array<Scalars['Boolean']>>;
    maintenancePaused_not?: InputMaybe<Scalars['Boolean']>;
    maintenancePaused_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
    maxDepositLimit?: InputMaybe<Scalars['BigInt']>;
    maxDepositLimit_gt?: InputMaybe<Scalars['BigInt']>;
    maxDepositLimit_gte?: InputMaybe<Scalars['BigInt']>;
    maxDepositLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
    maxDepositLimit_lt?: InputMaybe<Scalars['BigInt']>;
    maxDepositLimit_lte?: InputMaybe<Scalars['BigInt']>;
    maxDepositLimit_not?: InputMaybe<Scalars['BigInt']>;
    maxDepositLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    minDepositLimit?: InputMaybe<Scalars['BigInt']>;
    minDepositLimit_gt?: InputMaybe<Scalars['BigInt']>;
    minDepositLimit_gte?: InputMaybe<Scalars['BigInt']>;
    minDepositLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
    minDepositLimit_lt?: InputMaybe<Scalars['BigInt']>;
    minDepositLimit_lte?: InputMaybe<Scalars['BigInt']>;
    minDepositLimit_not?: InputMaybe<Scalars['BigInt']>;
    minDepositLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    or?: InputMaybe<Array<InputMaybe<FtmStaking_Filter>>>;
    undelegatePaused?: InputMaybe<Scalars['Boolean']>;
    undelegatePaused_in?: InputMaybe<Array<Scalars['Boolean']>>;
    undelegatePaused_not?: InputMaybe<Scalars['Boolean']>;
    undelegatePaused_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
    users_?: InputMaybe<User_Filter>;
    vaults_?: InputMaybe<Vault_Filter>;
    withdrawPaused?: InputMaybe<Scalars['Boolean']>;
    withdrawPaused_in?: InputMaybe<Array<Scalars['Boolean']>>;
    withdrawPaused_not?: InputMaybe<Scalars['Boolean']>;
    withdrawPaused_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
};

export enum FtmStaking_OrderBy {
    id = 'id',
    maintenancePaused = 'maintenancePaused',
    maxDepositLimit = 'maxDepositLimit',
    minDepositLimit = 'minDepositLimit',
    undelegatePaused = 'undelegatePaused',
    users = 'users',
    vaults = 'vaults',
    withdrawPaused = 'withdrawPaused',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    asc = 'asc',
    desc = 'desc',
}

export type Query = {
    __typename?: 'Query';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    deposit?: Maybe<Deposit>;
    deposits: Array<Deposit>;
    ftmStaking?: Maybe<FtmStaking>;
    ftmStakingSnapshot?: Maybe<FtmStakingSnapshot>;
    ftmStakingSnapshots: Array<FtmStakingSnapshot>;
    ftmStakings: Array<FtmStaking>;
    user?: Maybe<User>;
    users: Array<User>;
    vault?: Maybe<Vault>;
    vaults: Array<Vault>;
    withdrawalRequest?: Maybe<WithdrawalRequest>;
    withdrawalRequests: Array<WithdrawalRequest>;
};

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type QueryDepositArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDepositsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Deposit_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Deposit_Filter>;
};

export type QueryFtmStakingArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryFtmStakingSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryFtmStakingSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<FtmStakingSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<FtmStakingSnapshot_Filter>;
};

export type QueryFtmStakingsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<FtmStaking_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<FtmStaking_Filter>;
};

export type QueryUserArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryUsersArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<User_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<User_Filter>;
};

export type QueryVaultArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryVaultsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Vault_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Vault_Filter>;
};

export type QueryWithdrawalRequestArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryWithdrawalRequestsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<WithdrawalRequest_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<WithdrawalRequest_Filter>;
};

export type Subscription = {
    __typename?: 'Subscription';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    deposit?: Maybe<Deposit>;
    deposits: Array<Deposit>;
    ftmStaking?: Maybe<FtmStaking>;
    ftmStakingSnapshot?: Maybe<FtmStakingSnapshot>;
    ftmStakingSnapshots: Array<FtmStakingSnapshot>;
    ftmStakings: Array<FtmStaking>;
    user?: Maybe<User>;
    users: Array<User>;
    vault?: Maybe<Vault>;
    vaults: Array<Vault>;
    withdrawalRequest?: Maybe<WithdrawalRequest>;
    withdrawalRequests: Array<WithdrawalRequest>;
};

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type SubscriptionDepositArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDepositsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Deposit_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Deposit_Filter>;
};

export type SubscriptionFtmStakingArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionFtmStakingSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionFtmStakingSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<FtmStakingSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<FtmStakingSnapshot_Filter>;
};

export type SubscriptionFtmStakingsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<FtmStaking_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<FtmStaking_Filter>;
};

export type SubscriptionUserArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionUsersArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<User_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<User_Filter>;
};

export type SubscriptionVaultArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionVaultsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Vault_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Vault_Filter>;
};

export type SubscriptionWithdrawalRequestArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionWithdrawalRequestsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<WithdrawalRequest_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<WithdrawalRequest_Filter>;
};

export type User = {
    __typename?: 'User';
    deposits?: Maybe<Array<Deposit>>;
    ftmStaking: FtmStaking;
    id: Scalars['Bytes'];
    sftmxBalance: Scalars['BigDecimal'];
    withdrawalRequests?: Maybe<Array<WithdrawalRequest>>;
};

export type UserDepositsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Deposit_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Deposit_Filter>;
};

export type UserWithdrawalRequestsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<WithdrawalRequest_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<WithdrawalRequest_Filter>;
};

export type User_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
    deposits_?: InputMaybe<Deposit_Filter>;
    ftmStaking?: InputMaybe<Scalars['String']>;
    ftmStaking_?: InputMaybe<FtmStaking_Filter>;
    ftmStaking_contains?: InputMaybe<Scalars['String']>;
    ftmStaking_contains_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_ends_with?: InputMaybe<Scalars['String']>;
    ftmStaking_ends_with_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_gt?: InputMaybe<Scalars['String']>;
    ftmStaking_gte?: InputMaybe<Scalars['String']>;
    ftmStaking_in?: InputMaybe<Array<Scalars['String']>>;
    ftmStaking_lt?: InputMaybe<Scalars['String']>;
    ftmStaking_lte?: InputMaybe<Scalars['String']>;
    ftmStaking_not?: InputMaybe<Scalars['String']>;
    ftmStaking_not_contains?: InputMaybe<Scalars['String']>;
    ftmStaking_not_contains_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_not_ends_with?: InputMaybe<Scalars['String']>;
    ftmStaking_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_not_in?: InputMaybe<Array<Scalars['String']>>;
    ftmStaking_not_starts_with?: InputMaybe<Scalars['String']>;
    ftmStaking_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_starts_with?: InputMaybe<Scalars['String']>;
    ftmStaking_starts_with_nocase?: InputMaybe<Scalars['String']>;
    id?: InputMaybe<Scalars['Bytes']>;
    id_contains?: InputMaybe<Scalars['Bytes']>;
    id_gt?: InputMaybe<Scalars['Bytes']>;
    id_gte?: InputMaybe<Scalars['Bytes']>;
    id_in?: InputMaybe<Array<Scalars['Bytes']>>;
    id_lt?: InputMaybe<Scalars['Bytes']>;
    id_lte?: InputMaybe<Scalars['Bytes']>;
    id_not?: InputMaybe<Scalars['Bytes']>;
    id_not_contains?: InputMaybe<Scalars['Bytes']>;
    id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
    sftmxBalance?: InputMaybe<Scalars['BigDecimal']>;
    sftmxBalance_gt?: InputMaybe<Scalars['BigDecimal']>;
    sftmxBalance_gte?: InputMaybe<Scalars['BigDecimal']>;
    sftmxBalance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    sftmxBalance_lt?: InputMaybe<Scalars['BigDecimal']>;
    sftmxBalance_lte?: InputMaybe<Scalars['BigDecimal']>;
    sftmxBalance_not?: InputMaybe<Scalars['BigDecimal']>;
    sftmxBalance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    withdrawalRequests_?: InputMaybe<WithdrawalRequest_Filter>;
};

export enum User_OrderBy {
    deposits = 'deposits',
    ftmStaking = 'ftmStaking',
    ftmStaking__id = 'ftmStaking__id',
    ftmStaking__maintenancePaused = 'ftmStaking__maintenancePaused',
    ftmStaking__maxDepositLimit = 'ftmStaking__maxDepositLimit',
    ftmStaking__minDepositLimit = 'ftmStaking__minDepositLimit',
    ftmStaking__undelegatePaused = 'ftmStaking__undelegatePaused',
    ftmStaking__withdrawPaused = 'ftmStaking__withdrawPaused',
    id = 'id',
    sftmxBalance = 'sftmxBalance',
    withdrawalRequests = 'withdrawalRequests',
}

export type Vault = {
    __typename?: 'Vault';
    amountLocked: Scalars['BigDecimal'];
    ftmStaking: FtmStaking;
    id: Scalars['Bytes'];
    isHarvested: Scalars['Boolean'];
    isWithdrawn: Scalars['Boolean'];
    lockExpireTimestamp: Scalars['BigInt'];
    lockupDuration: Scalars['BigInt'];
    lockupTimestamp: Scalars['BigInt'];
    toValidatorAddress: Scalars['Bytes'];
    toValidatorId: Scalars['BigInt'];
};

export type Vault_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    amountLocked?: InputMaybe<Scalars['BigDecimal']>;
    amountLocked_gt?: InputMaybe<Scalars['BigDecimal']>;
    amountLocked_gte?: InputMaybe<Scalars['BigDecimal']>;
    amountLocked_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    amountLocked_lt?: InputMaybe<Scalars['BigDecimal']>;
    amountLocked_lte?: InputMaybe<Scalars['BigDecimal']>;
    amountLocked_not?: InputMaybe<Scalars['BigDecimal']>;
    amountLocked_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    and?: InputMaybe<Array<InputMaybe<Vault_Filter>>>;
    ftmStaking?: InputMaybe<Scalars['String']>;
    ftmStaking_?: InputMaybe<FtmStaking_Filter>;
    ftmStaking_contains?: InputMaybe<Scalars['String']>;
    ftmStaking_contains_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_ends_with?: InputMaybe<Scalars['String']>;
    ftmStaking_ends_with_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_gt?: InputMaybe<Scalars['String']>;
    ftmStaking_gte?: InputMaybe<Scalars['String']>;
    ftmStaking_in?: InputMaybe<Array<Scalars['String']>>;
    ftmStaking_lt?: InputMaybe<Scalars['String']>;
    ftmStaking_lte?: InputMaybe<Scalars['String']>;
    ftmStaking_not?: InputMaybe<Scalars['String']>;
    ftmStaking_not_contains?: InputMaybe<Scalars['String']>;
    ftmStaking_not_contains_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_not_ends_with?: InputMaybe<Scalars['String']>;
    ftmStaking_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_not_in?: InputMaybe<Array<Scalars['String']>>;
    ftmStaking_not_starts_with?: InputMaybe<Scalars['String']>;
    ftmStaking_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    ftmStaking_starts_with?: InputMaybe<Scalars['String']>;
    ftmStaking_starts_with_nocase?: InputMaybe<Scalars['String']>;
    id?: InputMaybe<Scalars['Bytes']>;
    id_contains?: InputMaybe<Scalars['Bytes']>;
    id_gt?: InputMaybe<Scalars['Bytes']>;
    id_gte?: InputMaybe<Scalars['Bytes']>;
    id_in?: InputMaybe<Array<Scalars['Bytes']>>;
    id_lt?: InputMaybe<Scalars['Bytes']>;
    id_lte?: InputMaybe<Scalars['Bytes']>;
    id_not?: InputMaybe<Scalars['Bytes']>;
    id_not_contains?: InputMaybe<Scalars['Bytes']>;
    id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    isHarvested?: InputMaybe<Scalars['Boolean']>;
    isHarvested_in?: InputMaybe<Array<Scalars['Boolean']>>;
    isHarvested_not?: InputMaybe<Scalars['Boolean']>;
    isHarvested_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
    isWithdrawn?: InputMaybe<Scalars['Boolean']>;
    isWithdrawn_in?: InputMaybe<Array<Scalars['Boolean']>>;
    isWithdrawn_not?: InputMaybe<Scalars['Boolean']>;
    isWithdrawn_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
    lockExpireTimestamp?: InputMaybe<Scalars['BigInt']>;
    lockExpireTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
    lockExpireTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
    lockExpireTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    lockExpireTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
    lockExpireTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
    lockExpireTimestamp_not?: InputMaybe<Scalars['BigInt']>;
    lockExpireTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    lockupDuration?: InputMaybe<Scalars['BigInt']>;
    lockupDuration_gt?: InputMaybe<Scalars['BigInt']>;
    lockupDuration_gte?: InputMaybe<Scalars['BigInt']>;
    lockupDuration_in?: InputMaybe<Array<Scalars['BigInt']>>;
    lockupDuration_lt?: InputMaybe<Scalars['BigInt']>;
    lockupDuration_lte?: InputMaybe<Scalars['BigInt']>;
    lockupDuration_not?: InputMaybe<Scalars['BigInt']>;
    lockupDuration_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    lockupTimestamp?: InputMaybe<Scalars['BigInt']>;
    lockupTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
    lockupTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
    lockupTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    lockupTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
    lockupTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
    lockupTimestamp_not?: InputMaybe<Scalars['BigInt']>;
    lockupTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    or?: InputMaybe<Array<InputMaybe<Vault_Filter>>>;
    toValidatorAddress?: InputMaybe<Scalars['Bytes']>;
    toValidatorAddress_contains?: InputMaybe<Scalars['Bytes']>;
    toValidatorAddress_gt?: InputMaybe<Scalars['Bytes']>;
    toValidatorAddress_gte?: InputMaybe<Scalars['Bytes']>;
    toValidatorAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
    toValidatorAddress_lt?: InputMaybe<Scalars['Bytes']>;
    toValidatorAddress_lte?: InputMaybe<Scalars['Bytes']>;
    toValidatorAddress_not?: InputMaybe<Scalars['Bytes']>;
    toValidatorAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
    toValidatorAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    toValidatorId?: InputMaybe<Scalars['BigInt']>;
    toValidatorId_gt?: InputMaybe<Scalars['BigInt']>;
    toValidatorId_gte?: InputMaybe<Scalars['BigInt']>;
    toValidatorId_in?: InputMaybe<Array<Scalars['BigInt']>>;
    toValidatorId_lt?: InputMaybe<Scalars['BigInt']>;
    toValidatorId_lte?: InputMaybe<Scalars['BigInt']>;
    toValidatorId_not?: InputMaybe<Scalars['BigInt']>;
    toValidatorId_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Vault_OrderBy {
    amountLocked = 'amountLocked',
    ftmStaking = 'ftmStaking',
    ftmStaking__id = 'ftmStaking__id',
    ftmStaking__maintenancePaused = 'ftmStaking__maintenancePaused',
    ftmStaking__maxDepositLimit = 'ftmStaking__maxDepositLimit',
    ftmStaking__minDepositLimit = 'ftmStaking__minDepositLimit',
    ftmStaking__undelegatePaused = 'ftmStaking__undelegatePaused',
    ftmStaking__withdrawPaused = 'ftmStaking__withdrawPaused',
    id = 'id',
    isHarvested = 'isHarvested',
    isWithdrawn = 'isWithdrawn',
    lockExpireTimestamp = 'lockExpireTimestamp',
    lockupDuration = 'lockupDuration',
    lockupTimestamp = 'lockupTimestamp',
    toValidatorAddress = 'toValidatorAddress',
    toValidatorId = 'toValidatorId',
}

export type WithdrawalRequest = {
    __typename?: 'WithdrawalRequest';
    amount: Scalars['BigDecimal'];
    id: Scalars['String'];
    isWithdrawn: Scalars['Boolean'];
    requestTime: Scalars['Int'];
    user: User;
};

export type WithdrawalRequest_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    amount?: InputMaybe<Scalars['BigDecimal']>;
    amount_gt?: InputMaybe<Scalars['BigDecimal']>;
    amount_gte?: InputMaybe<Scalars['BigDecimal']>;
    amount_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    amount_lt?: InputMaybe<Scalars['BigDecimal']>;
    amount_lte?: InputMaybe<Scalars['BigDecimal']>;
    amount_not?: InputMaybe<Scalars['BigDecimal']>;
    amount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    and?: InputMaybe<Array<InputMaybe<WithdrawalRequest_Filter>>>;
    id?: InputMaybe<Scalars['String']>;
    id_contains?: InputMaybe<Scalars['String']>;
    id_contains_nocase?: InputMaybe<Scalars['String']>;
    id_ends_with?: InputMaybe<Scalars['String']>;
    id_ends_with_nocase?: InputMaybe<Scalars['String']>;
    id_gt?: InputMaybe<Scalars['String']>;
    id_gte?: InputMaybe<Scalars['String']>;
    id_in?: InputMaybe<Array<Scalars['String']>>;
    id_lt?: InputMaybe<Scalars['String']>;
    id_lte?: InputMaybe<Scalars['String']>;
    id_not?: InputMaybe<Scalars['String']>;
    id_not_contains?: InputMaybe<Scalars['String']>;
    id_not_contains_nocase?: InputMaybe<Scalars['String']>;
    id_not_ends_with?: InputMaybe<Scalars['String']>;
    id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    id_not_in?: InputMaybe<Array<Scalars['String']>>;
    id_not_starts_with?: InputMaybe<Scalars['String']>;
    id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    id_starts_with?: InputMaybe<Scalars['String']>;
    id_starts_with_nocase?: InputMaybe<Scalars['String']>;
    isWithdrawn?: InputMaybe<Scalars['Boolean']>;
    isWithdrawn_in?: InputMaybe<Array<Scalars['Boolean']>>;
    isWithdrawn_not?: InputMaybe<Scalars['Boolean']>;
    isWithdrawn_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
    or?: InputMaybe<Array<InputMaybe<WithdrawalRequest_Filter>>>;
    requestTime?: InputMaybe<Scalars['Int']>;
    requestTime_gt?: InputMaybe<Scalars['Int']>;
    requestTime_gte?: InputMaybe<Scalars['Int']>;
    requestTime_in?: InputMaybe<Array<Scalars['Int']>>;
    requestTime_lt?: InputMaybe<Scalars['Int']>;
    requestTime_lte?: InputMaybe<Scalars['Int']>;
    requestTime_not?: InputMaybe<Scalars['Int']>;
    requestTime_not_in?: InputMaybe<Array<Scalars['Int']>>;
    user?: InputMaybe<Scalars['String']>;
    user_?: InputMaybe<User_Filter>;
    user_contains?: InputMaybe<Scalars['String']>;
    user_contains_nocase?: InputMaybe<Scalars['String']>;
    user_ends_with?: InputMaybe<Scalars['String']>;
    user_ends_with_nocase?: InputMaybe<Scalars['String']>;
    user_gt?: InputMaybe<Scalars['String']>;
    user_gte?: InputMaybe<Scalars['String']>;
    user_in?: InputMaybe<Array<Scalars['String']>>;
    user_lt?: InputMaybe<Scalars['String']>;
    user_lte?: InputMaybe<Scalars['String']>;
    user_not?: InputMaybe<Scalars['String']>;
    user_not_contains?: InputMaybe<Scalars['String']>;
    user_not_contains_nocase?: InputMaybe<Scalars['String']>;
    user_not_ends_with?: InputMaybe<Scalars['String']>;
    user_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    user_not_in?: InputMaybe<Array<Scalars['String']>>;
    user_not_starts_with?: InputMaybe<Scalars['String']>;
    user_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    user_starts_with?: InputMaybe<Scalars['String']>;
    user_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum WithdrawalRequest_OrderBy {
    amount = 'amount',
    id = 'id',
    isWithdrawn = 'isWithdrawn',
    requestTime = 'requestTime',
    user = 'user',
    user__id = 'user__id',
    user__sftmxBalance = 'user__sftmxBalance',
}

export type _Block_ = {
    __typename?: '_Block_';
    /** The hash of the block */
    hash?: Maybe<Scalars['Bytes']>;
    /** The block number */
    number: Scalars['Int'];
    /** The hash of the parent block */
    parentHash?: Maybe<Scalars['Bytes']>;
    /** Integer representation of the timestamp stored in blocks for the chain */
    timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
    __typename?: '_Meta_';
    /**
     * Information about a specific subgraph block. The hash of the block
     * will be null if the _meta field has a block constraint that asks for
     * a block number. It will be filled if the _meta field has no block constraint
     * and therefore asks for the latest  block
     *
     */
    block: _Block_;
    /** The deployment ID */
    deployment: Scalars['String'];
    /** If `true`, the subgraph encountered indexing errors at some past block */
    hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
    /** Data will be returned even if the subgraph has indexing errors */
    allow = 'allow',
    /** If the subgraph has indexing errors, data will be omitted. The default. */
    deny = 'deny',
}

export type WithdrawalRequestsQueryVariables = Exact<{
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<WithdrawalRequest_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<WithdrawalRequest_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type WithdrawalRequestsQuery = {
    __typename?: 'Query';
    withdrawalRequests: Array<{
        __typename?: 'WithdrawalRequest';
        id: string;
        amount: string;
        isWithdrawn: boolean;
        requestTime: number;
        user: { __typename?: 'User'; id: string };
    }>;
};

export type FtmStakingSnapshotsQueryVariables = Exact<{
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<FtmStakingSnapshot_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<FtmStakingSnapshot_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type FtmStakingSnapshotsQuery = {
    __typename?: 'Query';
    ftmStakingSnapshots: Array<{
        __typename?: 'FtmStakingSnapshot';
        id: string;
        snapshotTimestamp: number;
        freePoolFtmAmount: string;
        lockedFtmAmount: string;
        totalFtmAmount: string;
        exchangeRate: string;
    }>;
};

export type FtmStakingSnapshotFragment = {
    __typename?: 'FtmStakingSnapshot';
    id: string;
    snapshotTimestamp: number;
    freePoolFtmAmount: string;
    lockedFtmAmount: string;
    totalFtmAmount: string;
    exchangeRate: string;
};

export type WithdrawalRequestFragment = {
    __typename?: 'WithdrawalRequest';
    id: string;
    amount: string;
    isWithdrawn: boolean;
    requestTime: number;
    user: { __typename?: 'User'; id: string };
};

export const FtmStakingSnapshotFragmentDoc = gql`
    fragment FtmStakingSnapshot on FtmStakingSnapshot {
        id
        snapshotTimestamp
        freePoolFtmAmount
        lockedFtmAmount
        totalFtmAmount
        exchangeRate
    }
`;
export const WithdrawalRequestFragmentDoc = gql`
    fragment WithdrawalRequest on WithdrawalRequest {
        id
        amount
        isWithdrawn
        requestTime
        user {
            id
        }
    }
`;
export const WithdrawalRequestsDocument = gql`
    query WithdrawalRequests(
        $skip: Int
        $first: Int
        $orderBy: WithdrawalRequest_orderBy
        $orderDirection: OrderDirection
        $where: WithdrawalRequest_filter
        $block: Block_height
    ) {
        withdrawalRequests(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...WithdrawalRequest
        }
    }
    ${WithdrawalRequestFragmentDoc}
`;
export const FtmStakingSnapshotsDocument = gql`
    query ftmStakingSnapshots(
        $skip: Int
        $first: Int
        $orderBy: FtmStakingSnapshot_orderBy
        $orderDirection: OrderDirection
        $where: FtmStakingSnapshot_filter
        $block: Block_height
    ) {
        ftmStakingSnapshots(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...FtmStakingSnapshot
        }
    }
    ${FtmStakingSnapshotFragmentDoc}
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        WithdrawalRequests(
            variables?: WithdrawalRequestsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<WithdrawalRequestsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<WithdrawalRequestsQuery>(WithdrawalRequestsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'WithdrawalRequests',
            );
        },
        ftmStakingSnapshots(
            variables?: FtmStakingSnapshotsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<FtmStakingSnapshotsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<FtmStakingSnapshotsQuery>(FtmStakingSnapshotsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'ftmStakingSnapshots',
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
