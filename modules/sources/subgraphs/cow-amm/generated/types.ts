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

export type AddRemove = {
    __typename?: 'AddRemove';
    amounts: Array<Scalars['BigDecimal']>;
    blockNumber: Scalars['BigInt'];
    blockTimestamp: Scalars['BigInt'];
    id: Scalars['Bytes'];
    logIndex: Scalars['BigInt'];
    pool: Pool;
    sender: Scalars['Bytes'];
    transactionHash: Scalars['Bytes'];
    type: InvestType;
    user: User;
};

export type AddRemove_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    amounts?: InputMaybe<Array<Scalars['BigDecimal']>>;
    amounts_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    amounts_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    amounts_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
    amounts_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    amounts_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    and?: InputMaybe<Array<InputMaybe<AddRemove_Filter>>>;
    blockNumber?: InputMaybe<Scalars['BigInt']>;
    blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
    blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
    blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
    blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
    blockNumber_not?: InputMaybe<Scalars['BigInt']>;
    blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockTimestamp?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
    logIndex?: InputMaybe<Scalars['BigInt']>;
    logIndex_gt?: InputMaybe<Scalars['BigInt']>;
    logIndex_gte?: InputMaybe<Scalars['BigInt']>;
    logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
    logIndex_lt?: InputMaybe<Scalars['BigInt']>;
    logIndex_lte?: InputMaybe<Scalars['BigInt']>;
    logIndex_not?: InputMaybe<Scalars['BigInt']>;
    logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    or?: InputMaybe<Array<InputMaybe<AddRemove_Filter>>>;
    pool?: InputMaybe<Scalars['String']>;
    pool_?: InputMaybe<Pool_Filter>;
    pool_contains?: InputMaybe<Scalars['String']>;
    pool_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_ends_with?: InputMaybe<Scalars['String']>;
    pool_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_gt?: InputMaybe<Scalars['String']>;
    pool_gte?: InputMaybe<Scalars['String']>;
    pool_in?: InputMaybe<Array<Scalars['String']>>;
    pool_lt?: InputMaybe<Scalars['String']>;
    pool_lte?: InputMaybe<Scalars['String']>;
    pool_not?: InputMaybe<Scalars['String']>;
    pool_not_contains?: InputMaybe<Scalars['String']>;
    pool_not_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_not_ends_with?: InputMaybe<Scalars['String']>;
    pool_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_not_in?: InputMaybe<Array<Scalars['String']>>;
    pool_not_starts_with?: InputMaybe<Scalars['String']>;
    pool_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    pool_starts_with?: InputMaybe<Scalars['String']>;
    pool_starts_with_nocase?: InputMaybe<Scalars['String']>;
    sender?: InputMaybe<Scalars['Bytes']>;
    sender_contains?: InputMaybe<Scalars['Bytes']>;
    sender_gt?: InputMaybe<Scalars['Bytes']>;
    sender_gte?: InputMaybe<Scalars['Bytes']>;
    sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
    sender_lt?: InputMaybe<Scalars['Bytes']>;
    sender_lte?: InputMaybe<Scalars['Bytes']>;
    sender_not?: InputMaybe<Scalars['Bytes']>;
    sender_not_contains?: InputMaybe<Scalars['Bytes']>;
    sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    transactionHash?: InputMaybe<Scalars['Bytes']>;
    transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
    transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
    transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
    transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
    transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
    transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    type?: InputMaybe<InvestType>;
    type_in?: InputMaybe<Array<InvestType>>;
    type_not?: InputMaybe<InvestType>;
    type_not_in?: InputMaybe<Array<InvestType>>;
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

export enum AddRemove_OrderBy {
    Amounts = 'amounts',
    BlockNumber = 'blockNumber',
    BlockTimestamp = 'blockTimestamp',
    Id = 'id',
    LogIndex = 'logIndex',
    Pool = 'pool',
    PoolAddress = 'pool__address',
    PoolBlockNumber = 'pool__blockNumber',
    PoolBlockTimestamp = 'pool__blockTimestamp',
    PoolHoldersCount = 'pool__holdersCount',
    PoolId = 'pool__id',
    PoolIsInitialized = 'pool__isInitialized',
    PoolName = 'pool__name',
    PoolSwapFee = 'pool__swapFee',
    PoolSwapsCount = 'pool__swapsCount',
    PoolSymbol = 'pool__symbol',
    PoolTotalShares = 'pool__totalShares',
    PoolTransactionHash = 'pool__transactionHash',
    Sender = 'sender',
    TransactionHash = 'transactionHash',
    Type = 'type',
    User = 'user',
    UserId = 'user__id',
}

export enum Aggregation_Interval {
    Day = 'day',
    Hour = 'hour',
}

export type BlockChangedFilter = {
    number_gte: Scalars['Int'];
};

export type Block_Height = {
    hash?: InputMaybe<Scalars['Bytes']>;
    number?: InputMaybe<Scalars['Int']>;
    number_gte?: InputMaybe<Scalars['Int']>;
};

export type Factory = {
    __typename?: 'Factory';
    id: Scalars['Bytes'];
    pools?: Maybe<Array<Pool>>;
};

export type FactoryPoolsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Pool_Filter>;
};

export type Factory_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<Factory_Filter>>>;
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
    or?: InputMaybe<Array<InputMaybe<Factory_Filter>>>;
    pools_?: InputMaybe<Pool_Filter>;
};

export enum Factory_OrderBy {
    Id = 'id',
    Pools = 'pools',
}

export enum InvestType {
    Add = 'Add',
    Remove = 'Remove',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export type Pool = {
    __typename?: 'Pool';
    address: Scalars['Bytes'];
    blockNumber: Scalars['BigInt'];
    blockTimestamp: Scalars['BigInt'];
    factory: Factory;
    holdersCount: Scalars['BigInt'];
    id: Scalars['Bytes'];
    isInitialized: Scalars['Boolean'];
    name: Scalars['String'];
    snapshots: Array<PoolSnapshot>;
    swapFee: Scalars['BigDecimal'];
    swaps: Array<Swap>;
    swapsCount: Scalars['BigInt'];
    symbol: Scalars['String'];
    tokens: Array<PoolToken>;
    totalShares: Scalars['BigDecimal'];
    transactionHash: Scalars['Bytes'];
    weights: Array<Scalars['BigDecimal']>;
};

export type PoolSnapshotsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<PoolSnapshot_Filter>;
};

export type PoolSwapsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Swap_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Swap_Filter>;
};

export type PoolTokensArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolToken_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<PoolToken_Filter>;
};

export type PoolShare = {
    __typename?: 'PoolShare';
    balance: Scalars['BigDecimal'];
    id: Scalars['Bytes'];
    pool: Pool;
    user: User;
};

export type PoolShare_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<PoolShare_Filter>>>;
    balance?: InputMaybe<Scalars['BigDecimal']>;
    balance_gt?: InputMaybe<Scalars['BigDecimal']>;
    balance_gte?: InputMaybe<Scalars['BigDecimal']>;
    balance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balance_lt?: InputMaybe<Scalars['BigDecimal']>;
    balance_lte?: InputMaybe<Scalars['BigDecimal']>;
    balance_not?: InputMaybe<Scalars['BigDecimal']>;
    balance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
    or?: InputMaybe<Array<InputMaybe<PoolShare_Filter>>>;
    pool?: InputMaybe<Scalars['String']>;
    pool_?: InputMaybe<Pool_Filter>;
    pool_contains?: InputMaybe<Scalars['String']>;
    pool_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_ends_with?: InputMaybe<Scalars['String']>;
    pool_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_gt?: InputMaybe<Scalars['String']>;
    pool_gte?: InputMaybe<Scalars['String']>;
    pool_in?: InputMaybe<Array<Scalars['String']>>;
    pool_lt?: InputMaybe<Scalars['String']>;
    pool_lte?: InputMaybe<Scalars['String']>;
    pool_not?: InputMaybe<Scalars['String']>;
    pool_not_contains?: InputMaybe<Scalars['String']>;
    pool_not_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_not_ends_with?: InputMaybe<Scalars['String']>;
    pool_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_not_in?: InputMaybe<Array<Scalars['String']>>;
    pool_not_starts_with?: InputMaybe<Scalars['String']>;
    pool_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    pool_starts_with?: InputMaybe<Scalars['String']>;
    pool_starts_with_nocase?: InputMaybe<Scalars['String']>;
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

export enum PoolShare_OrderBy {
    Balance = 'balance',
    Id = 'id',
    Pool = 'pool',
    PoolAddress = 'pool__address',
    PoolBlockNumber = 'pool__blockNumber',
    PoolBlockTimestamp = 'pool__blockTimestamp',
    PoolHoldersCount = 'pool__holdersCount',
    PoolId = 'pool__id',
    PoolIsInitialized = 'pool__isInitialized',
    PoolName = 'pool__name',
    PoolSwapFee = 'pool__swapFee',
    PoolSwapsCount = 'pool__swapsCount',
    PoolSymbol = 'pool__symbol',
    PoolTotalShares = 'pool__totalShares',
    PoolTransactionHash = 'pool__transactionHash',
    User = 'user',
    UserId = 'user__id',
}

export type PoolSnapshot = {
    __typename?: 'PoolSnapshot';
    balances: Array<Scalars['BigDecimal']>;
    holdersCount: Scalars['BigInt'];
    id: Scalars['Bytes'];
    pool: Pool;
    swapsCount: Scalars['BigInt'];
    timestamp: Scalars['Int'];
    totalShares: Scalars['BigDecimal'];
    totalSurpluses: Array<Scalars['BigDecimal']>;
    totalSwapFees: Array<Scalars['BigDecimal']>;
    totalSwapVolumes: Array<Scalars['BigDecimal']>;
};

export type PoolSnapshot_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<PoolSnapshot_Filter>>>;
    balances?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balances_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balances_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balances_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balances_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balances_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    holdersCount?: InputMaybe<Scalars['BigInt']>;
    holdersCount_gt?: InputMaybe<Scalars['BigInt']>;
    holdersCount_gte?: InputMaybe<Scalars['BigInt']>;
    holdersCount_in?: InputMaybe<Array<Scalars['BigInt']>>;
    holdersCount_lt?: InputMaybe<Scalars['BigInt']>;
    holdersCount_lte?: InputMaybe<Scalars['BigInt']>;
    holdersCount_not?: InputMaybe<Scalars['BigInt']>;
    holdersCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
    or?: InputMaybe<Array<InputMaybe<PoolSnapshot_Filter>>>;
    pool?: InputMaybe<Scalars['String']>;
    pool_?: InputMaybe<Pool_Filter>;
    pool_contains?: InputMaybe<Scalars['String']>;
    pool_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_ends_with?: InputMaybe<Scalars['String']>;
    pool_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_gt?: InputMaybe<Scalars['String']>;
    pool_gte?: InputMaybe<Scalars['String']>;
    pool_in?: InputMaybe<Array<Scalars['String']>>;
    pool_lt?: InputMaybe<Scalars['String']>;
    pool_lte?: InputMaybe<Scalars['String']>;
    pool_not?: InputMaybe<Scalars['String']>;
    pool_not_contains?: InputMaybe<Scalars['String']>;
    pool_not_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_not_ends_with?: InputMaybe<Scalars['String']>;
    pool_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_not_in?: InputMaybe<Array<Scalars['String']>>;
    pool_not_starts_with?: InputMaybe<Scalars['String']>;
    pool_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    pool_starts_with?: InputMaybe<Scalars['String']>;
    pool_starts_with_nocase?: InputMaybe<Scalars['String']>;
    swapsCount?: InputMaybe<Scalars['BigInt']>;
    swapsCount_gt?: InputMaybe<Scalars['BigInt']>;
    swapsCount_gte?: InputMaybe<Scalars['BigInt']>;
    swapsCount_in?: InputMaybe<Array<Scalars['BigInt']>>;
    swapsCount_lt?: InputMaybe<Scalars['BigInt']>;
    swapsCount_lte?: InputMaybe<Scalars['BigInt']>;
    swapsCount_not?: InputMaybe<Scalars['BigInt']>;
    swapsCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    timestamp?: InputMaybe<Scalars['Int']>;
    timestamp_gt?: InputMaybe<Scalars['Int']>;
    timestamp_gte?: InputMaybe<Scalars['Int']>;
    timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    timestamp_lt?: InputMaybe<Scalars['Int']>;
    timestamp_lte?: InputMaybe<Scalars['Int']>;
    timestamp_not?: InputMaybe<Scalars['Int']>;
    timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
    totalShares?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalShares_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_not?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSurpluses?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSurpluses_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSurpluses_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSurpluses_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSurpluses_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSurpluses_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapFees?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapFees_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapFees_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapFees_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapFees_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapFees_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapVolumes?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapVolumes_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapVolumes_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapVolumes_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapVolumes_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSwapVolumes_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum PoolSnapshot_OrderBy {
    Balances = 'balances',
    HoldersCount = 'holdersCount',
    Id = 'id',
    Pool = 'pool',
    PoolAddress = 'pool__address',
    PoolBlockNumber = 'pool__blockNumber',
    PoolBlockTimestamp = 'pool__blockTimestamp',
    PoolHoldersCount = 'pool__holdersCount',
    PoolId = 'pool__id',
    PoolIsInitialized = 'pool__isInitialized',
    PoolName = 'pool__name',
    PoolSwapFee = 'pool__swapFee',
    PoolSwapsCount = 'pool__swapsCount',
    PoolSymbol = 'pool__symbol',
    PoolTotalShares = 'pool__totalShares',
    PoolTransactionHash = 'pool__transactionHash',
    SwapsCount = 'swapsCount',
    Timestamp = 'timestamp',
    TotalShares = 'totalShares',
    TotalSurpluses = 'totalSurpluses',
    TotalSwapFees = 'totalSwapFees',
    TotalSwapVolumes = 'totalSwapVolumes',
}

export type PoolToken = {
    __typename?: 'PoolToken';
    address: Scalars['Bytes'];
    balance: Scalars['BigDecimal'];
    decimals: Scalars['Int'];
    id: Scalars['Bytes'];
    index: Scalars['Int'];
    name: Scalars['String'];
    pool: Pool;
    surplus: Scalars['BigDecimal'];
    swapFee: Scalars['BigDecimal'];
    symbol: Scalars['String'];
    token: Token;
    volume: Scalars['BigDecimal'];
    weight: Scalars['BigDecimal'];
};

export type PoolToken_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    address?: InputMaybe<Scalars['Bytes']>;
    address_contains?: InputMaybe<Scalars['Bytes']>;
    address_gt?: InputMaybe<Scalars['Bytes']>;
    address_gte?: InputMaybe<Scalars['Bytes']>;
    address_in?: InputMaybe<Array<Scalars['Bytes']>>;
    address_lt?: InputMaybe<Scalars['Bytes']>;
    address_lte?: InputMaybe<Scalars['Bytes']>;
    address_not?: InputMaybe<Scalars['Bytes']>;
    address_not_contains?: InputMaybe<Scalars['Bytes']>;
    address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    and?: InputMaybe<Array<InputMaybe<PoolToken_Filter>>>;
    balance?: InputMaybe<Scalars['BigDecimal']>;
    balance_gt?: InputMaybe<Scalars['BigDecimal']>;
    balance_gte?: InputMaybe<Scalars['BigDecimal']>;
    balance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balance_lt?: InputMaybe<Scalars['BigDecimal']>;
    balance_lte?: InputMaybe<Scalars['BigDecimal']>;
    balance_not?: InputMaybe<Scalars['BigDecimal']>;
    balance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    decimals?: InputMaybe<Scalars['Int']>;
    decimals_gt?: InputMaybe<Scalars['Int']>;
    decimals_gte?: InputMaybe<Scalars['Int']>;
    decimals_in?: InputMaybe<Array<Scalars['Int']>>;
    decimals_lt?: InputMaybe<Scalars['Int']>;
    decimals_lte?: InputMaybe<Scalars['Int']>;
    decimals_not?: InputMaybe<Scalars['Int']>;
    decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
    index?: InputMaybe<Scalars['Int']>;
    index_gt?: InputMaybe<Scalars['Int']>;
    index_gte?: InputMaybe<Scalars['Int']>;
    index_in?: InputMaybe<Array<Scalars['Int']>>;
    index_lt?: InputMaybe<Scalars['Int']>;
    index_lte?: InputMaybe<Scalars['Int']>;
    index_not?: InputMaybe<Scalars['Int']>;
    index_not_in?: InputMaybe<Array<Scalars['Int']>>;
    name?: InputMaybe<Scalars['String']>;
    name_contains?: InputMaybe<Scalars['String']>;
    name_contains_nocase?: InputMaybe<Scalars['String']>;
    name_ends_with?: InputMaybe<Scalars['String']>;
    name_ends_with_nocase?: InputMaybe<Scalars['String']>;
    name_gt?: InputMaybe<Scalars['String']>;
    name_gte?: InputMaybe<Scalars['String']>;
    name_in?: InputMaybe<Array<Scalars['String']>>;
    name_lt?: InputMaybe<Scalars['String']>;
    name_lte?: InputMaybe<Scalars['String']>;
    name_not?: InputMaybe<Scalars['String']>;
    name_not_contains?: InputMaybe<Scalars['String']>;
    name_not_contains_nocase?: InputMaybe<Scalars['String']>;
    name_not_ends_with?: InputMaybe<Scalars['String']>;
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    name_not_in?: InputMaybe<Array<Scalars['String']>>;
    name_not_starts_with?: InputMaybe<Scalars['String']>;
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    name_starts_with?: InputMaybe<Scalars['String']>;
    name_starts_with_nocase?: InputMaybe<Scalars['String']>;
    or?: InputMaybe<Array<InputMaybe<PoolToken_Filter>>>;
    pool?: InputMaybe<Scalars['String']>;
    pool_?: InputMaybe<Pool_Filter>;
    pool_contains?: InputMaybe<Scalars['String']>;
    pool_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_ends_with?: InputMaybe<Scalars['String']>;
    pool_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_gt?: InputMaybe<Scalars['String']>;
    pool_gte?: InputMaybe<Scalars['String']>;
    pool_in?: InputMaybe<Array<Scalars['String']>>;
    pool_lt?: InputMaybe<Scalars['String']>;
    pool_lte?: InputMaybe<Scalars['String']>;
    pool_not?: InputMaybe<Scalars['String']>;
    pool_not_contains?: InputMaybe<Scalars['String']>;
    pool_not_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_not_ends_with?: InputMaybe<Scalars['String']>;
    pool_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_not_in?: InputMaybe<Array<Scalars['String']>>;
    pool_not_starts_with?: InputMaybe<Scalars['String']>;
    pool_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    pool_starts_with?: InputMaybe<Scalars['String']>;
    pool_starts_with_nocase?: InputMaybe<Scalars['String']>;
    surplus?: InputMaybe<Scalars['BigDecimal']>;
    surplus_gt?: InputMaybe<Scalars['BigDecimal']>;
    surplus_gte?: InputMaybe<Scalars['BigDecimal']>;
    surplus_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    surplus_lt?: InputMaybe<Scalars['BigDecimal']>;
    surplus_lte?: InputMaybe<Scalars['BigDecimal']>;
    surplus_not?: InputMaybe<Scalars['BigDecimal']>;
    surplus_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    swapFee?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_gt?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_gte?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    swapFee_lt?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_lte?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_not?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    symbol?: InputMaybe<Scalars['String']>;
    symbol_contains?: InputMaybe<Scalars['String']>;
    symbol_contains_nocase?: InputMaybe<Scalars['String']>;
    symbol_ends_with?: InputMaybe<Scalars['String']>;
    symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_gt?: InputMaybe<Scalars['String']>;
    symbol_gte?: InputMaybe<Scalars['String']>;
    symbol_in?: InputMaybe<Array<Scalars['String']>>;
    symbol_lt?: InputMaybe<Scalars['String']>;
    symbol_lte?: InputMaybe<Scalars['String']>;
    symbol_not?: InputMaybe<Scalars['String']>;
    symbol_not_contains?: InputMaybe<Scalars['String']>;
    symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
    symbol_not_ends_with?: InputMaybe<Scalars['String']>;
    symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
    symbol_not_starts_with?: InputMaybe<Scalars['String']>;
    symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_starts_with?: InputMaybe<Scalars['String']>;
    symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
    token?: InputMaybe<Scalars['String']>;
    token_?: InputMaybe<Token_Filter>;
    token_contains?: InputMaybe<Scalars['String']>;
    token_contains_nocase?: InputMaybe<Scalars['String']>;
    token_ends_with?: InputMaybe<Scalars['String']>;
    token_ends_with_nocase?: InputMaybe<Scalars['String']>;
    token_gt?: InputMaybe<Scalars['String']>;
    token_gte?: InputMaybe<Scalars['String']>;
    token_in?: InputMaybe<Array<Scalars['String']>>;
    token_lt?: InputMaybe<Scalars['String']>;
    token_lte?: InputMaybe<Scalars['String']>;
    token_not?: InputMaybe<Scalars['String']>;
    token_not_contains?: InputMaybe<Scalars['String']>;
    token_not_contains_nocase?: InputMaybe<Scalars['String']>;
    token_not_ends_with?: InputMaybe<Scalars['String']>;
    token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    token_not_in?: InputMaybe<Array<Scalars['String']>>;
    token_not_starts_with?: InputMaybe<Scalars['String']>;
    token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    token_starts_with?: InputMaybe<Scalars['String']>;
    token_starts_with_nocase?: InputMaybe<Scalars['String']>;
    volume?: InputMaybe<Scalars['BigDecimal']>;
    volume_gt?: InputMaybe<Scalars['BigDecimal']>;
    volume_gte?: InputMaybe<Scalars['BigDecimal']>;
    volume_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    volume_lt?: InputMaybe<Scalars['BigDecimal']>;
    volume_lte?: InputMaybe<Scalars['BigDecimal']>;
    volume_not?: InputMaybe<Scalars['BigDecimal']>;
    volume_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weight?: InputMaybe<Scalars['BigDecimal']>;
    weight_gt?: InputMaybe<Scalars['BigDecimal']>;
    weight_gte?: InputMaybe<Scalars['BigDecimal']>;
    weight_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weight_lt?: InputMaybe<Scalars['BigDecimal']>;
    weight_lte?: InputMaybe<Scalars['BigDecimal']>;
    weight_not?: InputMaybe<Scalars['BigDecimal']>;
    weight_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum PoolToken_OrderBy {
    Address = 'address',
    Balance = 'balance',
    Decimals = 'decimals',
    Id = 'id',
    Index = 'index',
    Name = 'name',
    Pool = 'pool',
    PoolAddress = 'pool__address',
    PoolBlockNumber = 'pool__blockNumber',
    PoolBlockTimestamp = 'pool__blockTimestamp',
    PoolHoldersCount = 'pool__holdersCount',
    PoolId = 'pool__id',
    PoolIsInitialized = 'pool__isInitialized',
    PoolName = 'pool__name',
    PoolSwapFee = 'pool__swapFee',
    PoolSwapsCount = 'pool__swapsCount',
    PoolSymbol = 'pool__symbol',
    PoolTotalShares = 'pool__totalShares',
    PoolTransactionHash = 'pool__transactionHash',
    Surplus = 'surplus',
    SwapFee = 'swapFee',
    Symbol = 'symbol',
    Token = 'token',
    TokenAddress = 'token__address',
    TokenDecimals = 'token__decimals',
    TokenId = 'token__id',
    TokenName = 'token__name',
    TokenSymbol = 'token__symbol',
    Volume = 'volume',
    Weight = 'weight',
}

export type Pool_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    address?: InputMaybe<Scalars['Bytes']>;
    address_contains?: InputMaybe<Scalars['Bytes']>;
    address_gt?: InputMaybe<Scalars['Bytes']>;
    address_gte?: InputMaybe<Scalars['Bytes']>;
    address_in?: InputMaybe<Array<Scalars['Bytes']>>;
    address_lt?: InputMaybe<Scalars['Bytes']>;
    address_lte?: InputMaybe<Scalars['Bytes']>;
    address_not?: InputMaybe<Scalars['Bytes']>;
    address_not_contains?: InputMaybe<Scalars['Bytes']>;
    address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    and?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
    blockNumber?: InputMaybe<Scalars['BigInt']>;
    blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
    blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
    blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
    blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
    blockNumber_not?: InputMaybe<Scalars['BigInt']>;
    blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockTimestamp?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    factory?: InputMaybe<Scalars['String']>;
    factory_?: InputMaybe<Factory_Filter>;
    factory_contains?: InputMaybe<Scalars['String']>;
    factory_contains_nocase?: InputMaybe<Scalars['String']>;
    factory_ends_with?: InputMaybe<Scalars['String']>;
    factory_ends_with_nocase?: InputMaybe<Scalars['String']>;
    factory_gt?: InputMaybe<Scalars['String']>;
    factory_gte?: InputMaybe<Scalars['String']>;
    factory_in?: InputMaybe<Array<Scalars['String']>>;
    factory_lt?: InputMaybe<Scalars['String']>;
    factory_lte?: InputMaybe<Scalars['String']>;
    factory_not?: InputMaybe<Scalars['String']>;
    factory_not_contains?: InputMaybe<Scalars['String']>;
    factory_not_contains_nocase?: InputMaybe<Scalars['String']>;
    factory_not_ends_with?: InputMaybe<Scalars['String']>;
    factory_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    factory_not_in?: InputMaybe<Array<Scalars['String']>>;
    factory_not_starts_with?: InputMaybe<Scalars['String']>;
    factory_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    factory_starts_with?: InputMaybe<Scalars['String']>;
    factory_starts_with_nocase?: InputMaybe<Scalars['String']>;
    holdersCount?: InputMaybe<Scalars['BigInt']>;
    holdersCount_gt?: InputMaybe<Scalars['BigInt']>;
    holdersCount_gte?: InputMaybe<Scalars['BigInt']>;
    holdersCount_in?: InputMaybe<Array<Scalars['BigInt']>>;
    holdersCount_lt?: InputMaybe<Scalars['BigInt']>;
    holdersCount_lte?: InputMaybe<Scalars['BigInt']>;
    holdersCount_not?: InputMaybe<Scalars['BigInt']>;
    holdersCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
    isInitialized?: InputMaybe<Scalars['Boolean']>;
    isInitialized_in?: InputMaybe<Array<Scalars['Boolean']>>;
    isInitialized_not?: InputMaybe<Scalars['Boolean']>;
    isInitialized_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
    name?: InputMaybe<Scalars['String']>;
    name_contains?: InputMaybe<Scalars['String']>;
    name_contains_nocase?: InputMaybe<Scalars['String']>;
    name_ends_with?: InputMaybe<Scalars['String']>;
    name_ends_with_nocase?: InputMaybe<Scalars['String']>;
    name_gt?: InputMaybe<Scalars['String']>;
    name_gte?: InputMaybe<Scalars['String']>;
    name_in?: InputMaybe<Array<Scalars['String']>>;
    name_lt?: InputMaybe<Scalars['String']>;
    name_lte?: InputMaybe<Scalars['String']>;
    name_not?: InputMaybe<Scalars['String']>;
    name_not_contains?: InputMaybe<Scalars['String']>;
    name_not_contains_nocase?: InputMaybe<Scalars['String']>;
    name_not_ends_with?: InputMaybe<Scalars['String']>;
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    name_not_in?: InputMaybe<Array<Scalars['String']>>;
    name_not_starts_with?: InputMaybe<Scalars['String']>;
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    name_starts_with?: InputMaybe<Scalars['String']>;
    name_starts_with_nocase?: InputMaybe<Scalars['String']>;
    or?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
    snapshots_?: InputMaybe<PoolSnapshot_Filter>;
    swapFee?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_gt?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_gte?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    swapFee_lt?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_lte?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_not?: InputMaybe<Scalars['BigDecimal']>;
    swapFee_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    swapsCount?: InputMaybe<Scalars['BigInt']>;
    swapsCount_gt?: InputMaybe<Scalars['BigInt']>;
    swapsCount_gte?: InputMaybe<Scalars['BigInt']>;
    swapsCount_in?: InputMaybe<Array<Scalars['BigInt']>>;
    swapsCount_lt?: InputMaybe<Scalars['BigInt']>;
    swapsCount_lte?: InputMaybe<Scalars['BigInt']>;
    swapsCount_not?: InputMaybe<Scalars['BigInt']>;
    swapsCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    swaps_?: InputMaybe<Swap_Filter>;
    symbol?: InputMaybe<Scalars['String']>;
    symbol_contains?: InputMaybe<Scalars['String']>;
    symbol_contains_nocase?: InputMaybe<Scalars['String']>;
    symbol_ends_with?: InputMaybe<Scalars['String']>;
    symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_gt?: InputMaybe<Scalars['String']>;
    symbol_gte?: InputMaybe<Scalars['String']>;
    symbol_in?: InputMaybe<Array<Scalars['String']>>;
    symbol_lt?: InputMaybe<Scalars['String']>;
    symbol_lte?: InputMaybe<Scalars['String']>;
    symbol_not?: InputMaybe<Scalars['String']>;
    symbol_not_contains?: InputMaybe<Scalars['String']>;
    symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
    symbol_not_ends_with?: InputMaybe<Scalars['String']>;
    symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
    symbol_not_starts_with?: InputMaybe<Scalars['String']>;
    symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_starts_with?: InputMaybe<Scalars['String']>;
    symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
    tokens_?: InputMaybe<PoolToken_Filter>;
    totalShares?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalShares_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_not?: InputMaybe<Scalars['BigDecimal']>;
    totalShares_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    transactionHash?: InputMaybe<Scalars['Bytes']>;
    transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
    transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
    transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
    transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
    transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
    transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    weights?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum Pool_OrderBy {
    Address = 'address',
    BlockNumber = 'blockNumber',
    BlockTimestamp = 'blockTimestamp',
    Factory = 'factory',
    FactoryId = 'factory__id',
    HoldersCount = 'holdersCount',
    Id = 'id',
    IsInitialized = 'isInitialized',
    Name = 'name',
    Snapshots = 'snapshots',
    SwapFee = 'swapFee',
    Swaps = 'swaps',
    SwapsCount = 'swapsCount',
    Symbol = 'symbol',
    Tokens = 'tokens',
    TotalShares = 'totalShares',
    TransactionHash = 'transactionHash',
    Weights = 'weights',
}

export type Query = {
    __typename?: 'Query';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    addRemove?: Maybe<AddRemove>;
    addRemoves: Array<AddRemove>;
    factories: Array<Factory>;
    factory?: Maybe<Factory>;
    pool?: Maybe<Pool>;
    poolShare?: Maybe<PoolShare>;
    poolShares: Array<PoolShare>;
    poolSnapshot?: Maybe<PoolSnapshot>;
    poolSnapshots: Array<PoolSnapshot>;
    poolToken?: Maybe<PoolToken>;
    poolTokens: Array<PoolToken>;
    pools: Array<Pool>;
    swap?: Maybe<Swap>;
    swaps: Array<Swap>;
    token?: Maybe<Token>;
    tokens: Array<Token>;
    user?: Maybe<User>;
    users: Array<User>;
};

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type QueryAddRemoveArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAddRemovesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<AddRemove_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<AddRemove_Filter>;
};

export type QueryFactoriesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Factory_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Factory_Filter>;
};

export type QueryFactoryArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolShareArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolSharesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolShare_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<PoolShare_Filter>;
};

export type QueryPoolSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<PoolSnapshot_Filter>;
};

export type QueryPoolTokenArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolTokensArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolToken_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<PoolToken_Filter>;
};

export type QueryPoolsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Pool_Filter>;
};

export type QuerySwapArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerySwapsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Swap_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Swap_Filter>;
};

export type QueryTokenArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTokensArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Token_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Token_Filter>;
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

export type Subscription = {
    __typename?: 'Subscription';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    addRemove?: Maybe<AddRemove>;
    addRemoves: Array<AddRemove>;
    factories: Array<Factory>;
    factory?: Maybe<Factory>;
    pool?: Maybe<Pool>;
    poolShare?: Maybe<PoolShare>;
    poolShares: Array<PoolShare>;
    poolSnapshot?: Maybe<PoolSnapshot>;
    poolSnapshots: Array<PoolSnapshot>;
    poolToken?: Maybe<PoolToken>;
    poolTokens: Array<PoolToken>;
    pools: Array<Pool>;
    swap?: Maybe<Swap>;
    swaps: Array<Swap>;
    token?: Maybe<Token>;
    tokens: Array<Token>;
    user?: Maybe<User>;
    users: Array<User>;
};

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type SubscriptionAddRemoveArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionAddRemovesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<AddRemove_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<AddRemove_Filter>;
};

export type SubscriptionFactoriesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Factory_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Factory_Filter>;
};

export type SubscriptionFactoryArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolShareArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolSharesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolShare_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<PoolShare_Filter>;
};

export type SubscriptionPoolSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<PoolSnapshot_Filter>;
};

export type SubscriptionPoolTokenArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolTokensArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolToken_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<PoolToken_Filter>;
};

export type SubscriptionPoolsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Pool_Filter>;
};

export type SubscriptionSwapArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionSwapsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Swap_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Swap_Filter>;
};

export type SubscriptionTokenArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTokensArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Token_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Token_Filter>;
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

export type Swap = {
    __typename?: 'Swap';
    blockNumber: Scalars['BigInt'];
    blockTimestamp: Scalars['BigInt'];
    expectedAmountOut?: Maybe<Scalars['BigDecimal']>;
    id: Scalars['Bytes'];
    logIndex: Scalars['BigInt'];
    pool: Pool;
    surplusAmount?: Maybe<Scalars['BigDecimal']>;
    surplusToken?: Maybe<Scalars['Bytes']>;
    swapFeeAmount?: Maybe<Scalars['BigDecimal']>;
    swapFeeToken?: Maybe<Scalars['Bytes']>;
    tokenAmountIn: Scalars['BigDecimal'];
    tokenAmountOut: Scalars['BigDecimal'];
    tokenIn: Scalars['Bytes'];
    tokenInSymbol: Scalars['String'];
    tokenOut: Scalars['Bytes'];
    tokenOutSymbol: Scalars['String'];
    transactionHash: Scalars['Bytes'];
    user: User;
};

export type Swap_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<Swap_Filter>>>;
    blockNumber?: InputMaybe<Scalars['BigInt']>;
    blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
    blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
    blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
    blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
    blockNumber_not?: InputMaybe<Scalars['BigInt']>;
    blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockTimestamp?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    blockTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_not?: InputMaybe<Scalars['BigInt']>;
    blockTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    expectedAmountOut?: InputMaybe<Scalars['BigDecimal']>;
    expectedAmountOut_gt?: InputMaybe<Scalars['BigDecimal']>;
    expectedAmountOut_gte?: InputMaybe<Scalars['BigDecimal']>;
    expectedAmountOut_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    expectedAmountOut_lt?: InputMaybe<Scalars['BigDecimal']>;
    expectedAmountOut_lte?: InputMaybe<Scalars['BigDecimal']>;
    expectedAmountOut_not?: InputMaybe<Scalars['BigDecimal']>;
    expectedAmountOut_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
    logIndex?: InputMaybe<Scalars['BigInt']>;
    logIndex_gt?: InputMaybe<Scalars['BigInt']>;
    logIndex_gte?: InputMaybe<Scalars['BigInt']>;
    logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
    logIndex_lt?: InputMaybe<Scalars['BigInt']>;
    logIndex_lte?: InputMaybe<Scalars['BigInt']>;
    logIndex_not?: InputMaybe<Scalars['BigInt']>;
    logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    or?: InputMaybe<Array<InputMaybe<Swap_Filter>>>;
    pool?: InputMaybe<Scalars['String']>;
    pool_?: InputMaybe<Pool_Filter>;
    pool_contains?: InputMaybe<Scalars['String']>;
    pool_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_ends_with?: InputMaybe<Scalars['String']>;
    pool_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_gt?: InputMaybe<Scalars['String']>;
    pool_gte?: InputMaybe<Scalars['String']>;
    pool_in?: InputMaybe<Array<Scalars['String']>>;
    pool_lt?: InputMaybe<Scalars['String']>;
    pool_lte?: InputMaybe<Scalars['String']>;
    pool_not?: InputMaybe<Scalars['String']>;
    pool_not_contains?: InputMaybe<Scalars['String']>;
    pool_not_contains_nocase?: InputMaybe<Scalars['String']>;
    pool_not_ends_with?: InputMaybe<Scalars['String']>;
    pool_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    pool_not_in?: InputMaybe<Array<Scalars['String']>>;
    pool_not_starts_with?: InputMaybe<Scalars['String']>;
    pool_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    pool_starts_with?: InputMaybe<Scalars['String']>;
    pool_starts_with_nocase?: InputMaybe<Scalars['String']>;
    surplusAmount?: InputMaybe<Scalars['BigDecimal']>;
    surplusAmount_gt?: InputMaybe<Scalars['BigDecimal']>;
    surplusAmount_gte?: InputMaybe<Scalars['BigDecimal']>;
    surplusAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    surplusAmount_lt?: InputMaybe<Scalars['BigDecimal']>;
    surplusAmount_lte?: InputMaybe<Scalars['BigDecimal']>;
    surplusAmount_not?: InputMaybe<Scalars['BigDecimal']>;
    surplusAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    surplusToken?: InputMaybe<Scalars['Bytes']>;
    surplusToken_contains?: InputMaybe<Scalars['Bytes']>;
    surplusToken_gt?: InputMaybe<Scalars['Bytes']>;
    surplusToken_gte?: InputMaybe<Scalars['Bytes']>;
    surplusToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
    surplusToken_lt?: InputMaybe<Scalars['Bytes']>;
    surplusToken_lte?: InputMaybe<Scalars['Bytes']>;
    surplusToken_not?: InputMaybe<Scalars['Bytes']>;
    surplusToken_not_contains?: InputMaybe<Scalars['Bytes']>;
    surplusToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    swapFeeAmount?: InputMaybe<Scalars['BigDecimal']>;
    swapFeeAmount_gt?: InputMaybe<Scalars['BigDecimal']>;
    swapFeeAmount_gte?: InputMaybe<Scalars['BigDecimal']>;
    swapFeeAmount_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    swapFeeAmount_lt?: InputMaybe<Scalars['BigDecimal']>;
    swapFeeAmount_lte?: InputMaybe<Scalars['BigDecimal']>;
    swapFeeAmount_not?: InputMaybe<Scalars['BigDecimal']>;
    swapFeeAmount_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    swapFeeToken?: InputMaybe<Scalars['Bytes']>;
    swapFeeToken_contains?: InputMaybe<Scalars['Bytes']>;
    swapFeeToken_gt?: InputMaybe<Scalars['Bytes']>;
    swapFeeToken_gte?: InputMaybe<Scalars['Bytes']>;
    swapFeeToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
    swapFeeToken_lt?: InputMaybe<Scalars['Bytes']>;
    swapFeeToken_lte?: InputMaybe<Scalars['Bytes']>;
    swapFeeToken_not?: InputMaybe<Scalars['Bytes']>;
    swapFeeToken_not_contains?: InputMaybe<Scalars['Bytes']>;
    swapFeeToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    tokenAmountIn?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountIn_gt?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountIn_gte?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountIn_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    tokenAmountIn_lt?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountIn_lte?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountIn_not?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountIn_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    tokenAmountOut?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountOut_gt?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountOut_gte?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountOut_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    tokenAmountOut_lt?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountOut_lte?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountOut_not?: InputMaybe<Scalars['BigDecimal']>;
    tokenAmountOut_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    tokenIn?: InputMaybe<Scalars['Bytes']>;
    tokenInSymbol?: InputMaybe<Scalars['String']>;
    tokenInSymbol_contains?: InputMaybe<Scalars['String']>;
    tokenInSymbol_contains_nocase?: InputMaybe<Scalars['String']>;
    tokenInSymbol_ends_with?: InputMaybe<Scalars['String']>;
    tokenInSymbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
    tokenInSymbol_gt?: InputMaybe<Scalars['String']>;
    tokenInSymbol_gte?: InputMaybe<Scalars['String']>;
    tokenInSymbol_in?: InputMaybe<Array<Scalars['String']>>;
    tokenInSymbol_lt?: InputMaybe<Scalars['String']>;
    tokenInSymbol_lte?: InputMaybe<Scalars['String']>;
    tokenInSymbol_not?: InputMaybe<Scalars['String']>;
    tokenInSymbol_not_contains?: InputMaybe<Scalars['String']>;
    tokenInSymbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
    tokenInSymbol_not_ends_with?: InputMaybe<Scalars['String']>;
    tokenInSymbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    tokenInSymbol_not_in?: InputMaybe<Array<Scalars['String']>>;
    tokenInSymbol_not_starts_with?: InputMaybe<Scalars['String']>;
    tokenInSymbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    tokenInSymbol_starts_with?: InputMaybe<Scalars['String']>;
    tokenInSymbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
    tokenIn_contains?: InputMaybe<Scalars['Bytes']>;
    tokenIn_gt?: InputMaybe<Scalars['Bytes']>;
    tokenIn_gte?: InputMaybe<Scalars['Bytes']>;
    tokenIn_in?: InputMaybe<Array<Scalars['Bytes']>>;
    tokenIn_lt?: InputMaybe<Scalars['Bytes']>;
    tokenIn_lte?: InputMaybe<Scalars['Bytes']>;
    tokenIn_not?: InputMaybe<Scalars['Bytes']>;
    tokenIn_not_contains?: InputMaybe<Scalars['Bytes']>;
    tokenIn_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    tokenOut?: InputMaybe<Scalars['Bytes']>;
    tokenOutSymbol?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_contains?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_contains_nocase?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_ends_with?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_gt?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_gte?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_in?: InputMaybe<Array<Scalars['String']>>;
    tokenOutSymbol_lt?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_lte?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_not?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_not_contains?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_not_ends_with?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_not_in?: InputMaybe<Array<Scalars['String']>>;
    tokenOutSymbol_not_starts_with?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_starts_with?: InputMaybe<Scalars['String']>;
    tokenOutSymbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
    tokenOut_contains?: InputMaybe<Scalars['Bytes']>;
    tokenOut_gt?: InputMaybe<Scalars['Bytes']>;
    tokenOut_gte?: InputMaybe<Scalars['Bytes']>;
    tokenOut_in?: InputMaybe<Array<Scalars['Bytes']>>;
    tokenOut_lt?: InputMaybe<Scalars['Bytes']>;
    tokenOut_lte?: InputMaybe<Scalars['Bytes']>;
    tokenOut_not?: InputMaybe<Scalars['Bytes']>;
    tokenOut_not_contains?: InputMaybe<Scalars['Bytes']>;
    tokenOut_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    transactionHash?: InputMaybe<Scalars['Bytes']>;
    transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
    transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
    transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
    transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
    transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
    transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
    transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
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

export enum Swap_OrderBy {
    BlockNumber = 'blockNumber',
    BlockTimestamp = 'blockTimestamp',
    ExpectedAmountOut = 'expectedAmountOut',
    Id = 'id',
    LogIndex = 'logIndex',
    Pool = 'pool',
    PoolAddress = 'pool__address',
    PoolBlockNumber = 'pool__blockNumber',
    PoolBlockTimestamp = 'pool__blockTimestamp',
    PoolHoldersCount = 'pool__holdersCount',
    PoolId = 'pool__id',
    PoolIsInitialized = 'pool__isInitialized',
    PoolName = 'pool__name',
    PoolSwapFee = 'pool__swapFee',
    PoolSwapsCount = 'pool__swapsCount',
    PoolSymbol = 'pool__symbol',
    PoolTotalShares = 'pool__totalShares',
    PoolTransactionHash = 'pool__transactionHash',
    SurplusAmount = 'surplusAmount',
    SurplusToken = 'surplusToken',
    SwapFeeAmount = 'swapFeeAmount',
    SwapFeeToken = 'swapFeeToken',
    TokenAmountIn = 'tokenAmountIn',
    TokenAmountOut = 'tokenAmountOut',
    TokenIn = 'tokenIn',
    TokenInSymbol = 'tokenInSymbol',
    TokenOut = 'tokenOut',
    TokenOutSymbol = 'tokenOutSymbol',
    TransactionHash = 'transactionHash',
    User = 'user',
    UserId = 'user__id',
}

export type Token = {
    __typename?: 'Token';
    address: Scalars['Bytes'];
    decimals: Scalars['Int'];
    id: Scalars['Bytes'];
    name: Scalars['String'];
    symbol: Scalars['String'];
};

export type Token_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    address?: InputMaybe<Scalars['Bytes']>;
    address_contains?: InputMaybe<Scalars['Bytes']>;
    address_gt?: InputMaybe<Scalars['Bytes']>;
    address_gte?: InputMaybe<Scalars['Bytes']>;
    address_in?: InputMaybe<Array<Scalars['Bytes']>>;
    address_lt?: InputMaybe<Scalars['Bytes']>;
    address_lte?: InputMaybe<Scalars['Bytes']>;
    address_not?: InputMaybe<Scalars['Bytes']>;
    address_not_contains?: InputMaybe<Scalars['Bytes']>;
    address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    and?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
    decimals?: InputMaybe<Scalars['Int']>;
    decimals_gt?: InputMaybe<Scalars['Int']>;
    decimals_gte?: InputMaybe<Scalars['Int']>;
    decimals_in?: InputMaybe<Array<Scalars['Int']>>;
    decimals_lt?: InputMaybe<Scalars['Int']>;
    decimals_lte?: InputMaybe<Scalars['Int']>;
    decimals_not?: InputMaybe<Scalars['Int']>;
    decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
    name?: InputMaybe<Scalars['String']>;
    name_contains?: InputMaybe<Scalars['String']>;
    name_contains_nocase?: InputMaybe<Scalars['String']>;
    name_ends_with?: InputMaybe<Scalars['String']>;
    name_ends_with_nocase?: InputMaybe<Scalars['String']>;
    name_gt?: InputMaybe<Scalars['String']>;
    name_gte?: InputMaybe<Scalars['String']>;
    name_in?: InputMaybe<Array<Scalars['String']>>;
    name_lt?: InputMaybe<Scalars['String']>;
    name_lte?: InputMaybe<Scalars['String']>;
    name_not?: InputMaybe<Scalars['String']>;
    name_not_contains?: InputMaybe<Scalars['String']>;
    name_not_contains_nocase?: InputMaybe<Scalars['String']>;
    name_not_ends_with?: InputMaybe<Scalars['String']>;
    name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    name_not_in?: InputMaybe<Array<Scalars['String']>>;
    name_not_starts_with?: InputMaybe<Scalars['String']>;
    name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    name_starts_with?: InputMaybe<Scalars['String']>;
    name_starts_with_nocase?: InputMaybe<Scalars['String']>;
    or?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
    symbol?: InputMaybe<Scalars['String']>;
    symbol_contains?: InputMaybe<Scalars['String']>;
    symbol_contains_nocase?: InputMaybe<Scalars['String']>;
    symbol_ends_with?: InputMaybe<Scalars['String']>;
    symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_gt?: InputMaybe<Scalars['String']>;
    symbol_gte?: InputMaybe<Scalars['String']>;
    symbol_in?: InputMaybe<Array<Scalars['String']>>;
    symbol_lt?: InputMaybe<Scalars['String']>;
    symbol_lte?: InputMaybe<Scalars['String']>;
    symbol_not?: InputMaybe<Scalars['String']>;
    symbol_not_contains?: InputMaybe<Scalars['String']>;
    symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
    symbol_not_ends_with?: InputMaybe<Scalars['String']>;
    symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
    symbol_not_starts_with?: InputMaybe<Scalars['String']>;
    symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    symbol_starts_with?: InputMaybe<Scalars['String']>;
    symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Token_OrderBy {
    Address = 'address',
    Decimals = 'decimals',
    Id = 'id',
    Name = 'name',
    Symbol = 'symbol',
}

export type User = {
    __typename?: 'User';
    addRemoves?: Maybe<Array<AddRemove>>;
    id: Scalars['Bytes'];
    shares?: Maybe<Array<PoolShare>>;
    swaps?: Maybe<Array<Swap>>;
};

export type UserAddRemovesArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<AddRemove_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<AddRemove_Filter>;
};

export type UserSharesArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolShare_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<PoolShare_Filter>;
};

export type UserSwapsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Swap_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Swap_Filter>;
};

export type User_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    addRemoves_?: InputMaybe<AddRemove_Filter>;
    and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
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
    shares_?: InputMaybe<PoolShare_Filter>;
    swaps_?: InputMaybe<Swap_Filter>;
};

export enum User_OrderBy {
    AddRemoves = 'addRemoves',
    Id = 'id',
    Shares = 'shares',
    Swaps = 'swaps',
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
    Allow = 'allow',
    /** If the subgraph has indexing errors, data will be omitted. The default. */
    Deny = 'deny',
}

export type CowAmmAddRemoveFragment = {
    __typename?: 'AddRemove';
    id: string;
    type: InvestType;
    sender: string;
    amounts: Array<string>;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
    logIndex: string;
    pool: {
        __typename?: 'Pool';
        id: string;
        tokens: Array<{ __typename?: 'PoolToken'; index: number; address: string; decimals: number }>;
    };
    user: { __typename?: 'User'; id: string };
};

export type AddRemovesQueryVariables = Exact<{
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<AddRemove_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<AddRemove_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type AddRemovesQuery = {
    __typename?: 'Query';
    addRemoves: Array<{
        __typename?: 'AddRemove';
        id: string;
        type: InvestType;
        sender: string;
        amounts: Array<string>;
        blockNumber: string;
        blockTimestamp: string;
        transactionHash: string;
        logIndex: string;
        pool: {
            __typename?: 'Pool';
            id: string;
            tokens: Array<{ __typename?: 'PoolToken'; index: number; address: string; decimals: number }>;
        };
        user: { __typename?: 'User'; id: string };
    }>;
};

export type CowAmmSwapFragment = {
    __typename?: 'Swap';
    id: string;
    tokenInSymbol: string;
    tokenOutSymbol: string;
    tokenAmountIn: string;
    tokenAmountOut: string;
    tokenIn: string;
    tokenOut: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
    logIndex: string;
    surplusAmount?: string | null | undefined;
    surplusToken?: string | null | undefined;
    swapFeeAmount?: string | null | undefined;
    swapFeeToken?: string | null | undefined;
    pool: {
        __typename?: 'Pool';
        id: string;
        tokens: Array<{ __typename?: 'PoolToken'; index: number; address: string; decimals: number }>;
    };
    user: { __typename?: 'User'; id: string };
};

export type SwapsQueryVariables = Exact<{
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<Swap_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<Swap_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type SwapsQuery = {
    __typename?: 'Query';
    swaps: Array<{
        __typename?: 'Swap';
        id: string;
        tokenInSymbol: string;
        tokenOutSymbol: string;
        tokenAmountIn: string;
        tokenAmountOut: string;
        tokenIn: string;
        tokenOut: string;
        blockNumber: string;
        blockTimestamp: string;
        transactionHash: string;
        logIndex: string;
        surplusAmount?: string | null | undefined;
        surplusToken?: string | null | undefined;
        swapFeeAmount?: string | null | undefined;
        swapFeeToken?: string | null | undefined;
        pool: {
            __typename?: 'Pool';
            id: string;
            tokens: Array<{ __typename?: 'PoolToken'; index: number; address: string; decimals: number }>;
        };
        user: { __typename?: 'User'; id: string };
    }>;
};

export type MetadataQueryVariables = Exact<{ [key: string]: never }>;

export type MetadataQuery = {
    __typename?: 'Query';
    meta?:
        | {
              __typename?: '_Meta_';
              deployment: string;
              hasIndexingErrors: boolean;
              block: { __typename?: '_Block_'; number: number };
          }
        | null
        | undefined;
};

export type PoolShareFragment = { __typename?: 'PoolShare'; id: string; balance: string };

export type PoolSharesQueryVariables = Exact<{
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<PoolShare_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<PoolShare_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type PoolSharesQuery = {
    __typename?: 'Query';
    poolShares: Array<{ __typename?: 'PoolShare'; id: string; balance: string }>;
};

export type CowAmmPoolFragment = {
    __typename?: 'Pool';
    id: string;
    name: string;
    symbol: string;
    totalShares: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
    swapFee: string;
    swapsCount: string;
    holdersCount: string;
    weights: Array<string>;
    factory: { __typename?: 'Factory'; id: string };
    tokens: Array<{
        __typename?: 'PoolToken';
        id: string;
        index: number;
        name: string;
        symbol: string;
        address: string;
        decimals: number;
        balance: string;
        weight: string;
    }>;
};

export type PoolsQueryVariables = Exact<{
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<Pool_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<Pool_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type PoolsQuery = {
    __typename?: 'Query';
    pools: Array<{
        __typename?: 'Pool';
        id: string;
        name: string;
        symbol: string;
        totalShares: string;
        blockNumber: string;
        blockTimestamp: string;
        transactionHash: string;
        swapFee: string;
        swapsCount: string;
        holdersCount: string;
        weights: Array<string>;
        factory: { __typename?: 'Factory'; id: string };
        tokens: Array<{
            __typename?: 'PoolToken';
            id: string;
            index: number;
            name: string;
            symbol: string;
            address: string;
            decimals: number;
            balance: string;
            weight: string;
        }>;
    }>;
    _meta?: { __typename?: '_Meta_'; block: { __typename?: '_Block_'; number: number } } | null | undefined;
};

export type SnapshotsQueryVariables = Exact<{
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<PoolSnapshot_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<PoolSnapshot_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type SnapshotsQuery = {
    __typename?: 'Query';
    poolSnapshots: Array<{
        __typename?: 'PoolSnapshot';
        id: string;
        balances: Array<string>;
        totalSurpluses: Array<string>;
        totalSwapFees: Array<string>;
        totalSwapVolumes: Array<string>;
        totalShares: string;
        timestamp: number;
        swapsCount: string;
        holdersCount: string;
        pool: {
            __typename?: 'Pool';
            id: string;
            swapFee: string;
            tokens: Array<{ __typename?: 'PoolToken'; id: string; index: number; address: string; decimals: number }>;
        };
    }>;
};

export type CowAmmSnapshotFragment = {
    __typename?: 'PoolSnapshot';
    id: string;
    balances: Array<string>;
    totalSurpluses: Array<string>;
    totalSwapFees: Array<string>;
    totalSwapVolumes: Array<string>;
    totalShares: string;
    timestamp: number;
    swapsCount: string;
    holdersCount: string;
    pool: {
        __typename?: 'Pool';
        id: string;
        swapFee: string;
        tokens: Array<{ __typename?: 'PoolToken'; id: string; index: number; address: string; decimals: number }>;
    };
};

export const CowAmmAddRemoveFragmentDoc = gql`
    fragment CowAmmAddRemove on AddRemove {
        id
        pool {
            id
            tokens {
                index
                address
                decimals
            }
        }
        user {
            id
        }
        type
        sender
        amounts
        blockNumber
        blockTimestamp
        transactionHash
        logIndex
    }
`;
export const CowAmmSwapFragmentDoc = gql`
    fragment CowAmmSwap on Swap {
        id
        pool {
            id
            tokens {
                index
                address
                decimals
            }
        }
        tokenInSymbol
        tokenOutSymbol
        tokenAmountIn
        tokenAmountOut
        tokenIn
        tokenOut
        blockNumber
        blockTimestamp
        transactionHash
        logIndex
        surplusAmount
        surplusToken
        swapFeeAmount
        swapFeeToken
        user {
            id
        }
    }
`;
export const PoolShareFragmentDoc = gql`
    fragment PoolShare on PoolShare {
        id
        balance
    }
`;
export const CowAmmPoolFragmentDoc = gql`
    fragment CowAmmPool on Pool {
        id
        name
        symbol
        factory {
            id
        }
        totalShares
        blockNumber
        blockTimestamp
        transactionHash
        swapFee
        swapsCount
        holdersCount
        weights
        tokens {
            id
            index
            name
            symbol
            address
            decimals
            balance
            weight
        }
    }
`;
export const CowAmmSnapshotFragmentDoc = gql`
    fragment CowAmmSnapshot on PoolSnapshot {
        id
        pool {
            id
            swapFee
            tokens {
                id
                index
                address
                decimals
            }
        }
        balances
        totalSurpluses
        totalSwapFees
        totalSwapVolumes
        totalShares
        timestamp
        swapsCount
        holdersCount
    }
`;
export const AddRemovesDocument = gql`
    query AddRemoves(
        $skip: Int
        $first: Int
        $orderBy: AddRemove_orderBy
        $orderDirection: OrderDirection
        $where: AddRemove_filter
        $block: Block_height
    ) {
        addRemoves(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...CowAmmAddRemove
        }
    }
    ${CowAmmAddRemoveFragmentDoc}
`;
export const SwapsDocument = gql`
    query Swaps(
        $skip: Int
        $first: Int
        $orderBy: Swap_orderBy
        $orderDirection: OrderDirection
        $where: Swap_filter
        $block: Block_height
    ) {
        swaps(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...CowAmmSwap
        }
    }
    ${CowAmmSwapFragmentDoc}
`;
export const MetadataDocument = gql`
    query Metadata {
        meta: _meta {
            block {
                number
            }
            deployment
            hasIndexingErrors
        }
    }
`;
export const PoolSharesDocument = gql`
    query PoolShares(
        $skip: Int
        $first: Int
        $orderBy: PoolShare_orderBy
        $orderDirection: OrderDirection
        $where: PoolShare_filter
        $block: Block_height
    ) {
        poolShares(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...PoolShare
        }
    }
    ${PoolShareFragmentDoc}
`;
export const PoolsDocument = gql`
    query Pools(
        $skip: Int
        $first: Int
        $orderBy: Pool_orderBy
        $orderDirection: OrderDirection
        $where: Pool_filter
        $block: Block_height
    ) {
        pools(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...CowAmmPool
        }
        _meta {
            block {
                number
            }
        }
    }
    ${CowAmmPoolFragmentDoc}
`;
export const SnapshotsDocument = gql`
    query Snapshots(
        $skip: Int
        $first: Int
        $orderBy: PoolSnapshot_orderBy
        $orderDirection: OrderDirection
        $where: PoolSnapshot_filter
        $block: Block_height
    ) {
        poolSnapshots(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...CowAmmSnapshot
        }
    }
    ${CowAmmSnapshotFragmentDoc}
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        AddRemoves(
            variables?: AddRemovesQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<AddRemovesQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<AddRemovesQuery>(AddRemovesDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'AddRemoves',
            );
        },
        Swaps(variables?: SwapsQueryVariables, requestHeaders?: Dom.RequestInit['headers']): Promise<SwapsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<SwapsQuery>(SwapsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'Swaps',
            );
        },
        Metadata(
            variables?: MetadataQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<MetadataQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<MetadataQuery>(MetadataDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'Metadata',
            );
        },
        PoolShares(
            variables?: PoolSharesQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<PoolSharesQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<PoolSharesQuery>(PoolSharesDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'PoolShares',
            );
        },
        Pools(variables?: PoolsQueryVariables, requestHeaders?: Dom.RequestInit['headers']): Promise<PoolsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<PoolsQuery>(PoolsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'Pools',
            );
        },
        Snapshots(
            variables?: SnapshotsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<SnapshotsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<SnapshotsQuery>(SnapshotsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'Snapshots',
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
