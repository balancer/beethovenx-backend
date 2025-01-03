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

export type DailyPoolSnapshot = {
    __typename?: 'DailyPoolSnapshot';
    dailyDeposited: Scalars['BigDecimal'];
    dailyWithdrawn: Scalars['BigDecimal'];
    id: Scalars['Bytes'];
    pool: Pool;
    poolId: Scalars['Int'];
    relicCount: Scalars['Int'];
    snapshotTimestamp: Scalars['Int'];
    totalBalance: Scalars['BigDecimal'];
};

export type DailyPoolSnapshot_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<DailyPoolSnapshot_Filter>>>;
    dailyDeposited?: InputMaybe<Scalars['BigDecimal']>;
    dailyDeposited_gt?: InputMaybe<Scalars['BigDecimal']>;
    dailyDeposited_gte?: InputMaybe<Scalars['BigDecimal']>;
    dailyDeposited_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    dailyDeposited_lt?: InputMaybe<Scalars['BigDecimal']>;
    dailyDeposited_lte?: InputMaybe<Scalars['BigDecimal']>;
    dailyDeposited_not?: InputMaybe<Scalars['BigDecimal']>;
    dailyDeposited_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    dailyWithdrawn?: InputMaybe<Scalars['BigDecimal']>;
    dailyWithdrawn_gt?: InputMaybe<Scalars['BigDecimal']>;
    dailyWithdrawn_gte?: InputMaybe<Scalars['BigDecimal']>;
    dailyWithdrawn_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    dailyWithdrawn_lt?: InputMaybe<Scalars['BigDecimal']>;
    dailyWithdrawn_lte?: InputMaybe<Scalars['BigDecimal']>;
    dailyWithdrawn_not?: InputMaybe<Scalars['BigDecimal']>;
    dailyWithdrawn_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
    or?: InputMaybe<Array<InputMaybe<DailyPoolSnapshot_Filter>>>;
    pool?: InputMaybe<Scalars['String']>;
    poolId?: InputMaybe<Scalars['Int']>;
    poolId_gt?: InputMaybe<Scalars['Int']>;
    poolId_gte?: InputMaybe<Scalars['Int']>;
    poolId_in?: InputMaybe<Array<Scalars['Int']>>;
    poolId_lt?: InputMaybe<Scalars['Int']>;
    poolId_lte?: InputMaybe<Scalars['Int']>;
    poolId_not?: InputMaybe<Scalars['Int']>;
    poolId_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
    relicCount?: InputMaybe<Scalars['Int']>;
    relicCount_gt?: InputMaybe<Scalars['Int']>;
    relicCount_gte?: InputMaybe<Scalars['Int']>;
    relicCount_in?: InputMaybe<Array<Scalars['Int']>>;
    relicCount_lt?: InputMaybe<Scalars['Int']>;
    relicCount_lte?: InputMaybe<Scalars['Int']>;
    relicCount_not?: InputMaybe<Scalars['Int']>;
    relicCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
    snapshotTimestamp?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_gt?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_gte?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    snapshotTimestamp_lt?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_lte?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_not?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
    totalBalance?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalBalance_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_not?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum DailyPoolSnapshot_OrderBy {
    dailyDeposited = 'dailyDeposited',
    dailyWithdrawn = 'dailyWithdrawn',
    id = 'id',
    pool = 'pool',
    poolId = 'poolId',
    pool__allocPoint = 'pool__allocPoint',
    pool__id = 'pool__id',
    pool__name = 'pool__name',
    pool__nftDescriptor = 'pool__nftDescriptor',
    pool__pid = 'pool__pid',
    pool__poolTokenAddress = 'pool__poolTokenAddress',
    pool__relicCount = 'pool__relicCount',
    pool__totalBalance = 'pool__totalBalance',
    relicCount = 'relicCount',
    snapshotTimestamp = 'snapshotTimestamp',
    totalBalance = 'totalBalance',
}

export type DailyRelicSnapshot = {
    __typename?: 'DailyRelicSnapshot';
    balance: Scalars['BigDecimal'];
    entryTimestamp: Scalars['Int'];
    id: Scalars['ID'];
    level: Scalars['Int'];
    pool: Pool;
    poolId: Scalars['Int'];
    relic: Relic;
    relicId: Scalars['Int'];
    snapshotTimestamp: Scalars['Int'];
    user: User;
    userAddress: Scalars['Bytes'];
};

export type DailyRelicSnapshot_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<DailyRelicSnapshot_Filter>>>;
    balance?: InputMaybe<Scalars['BigDecimal']>;
    balance_gt?: InputMaybe<Scalars['BigDecimal']>;
    balance_gte?: InputMaybe<Scalars['BigDecimal']>;
    balance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balance_lt?: InputMaybe<Scalars['BigDecimal']>;
    balance_lte?: InputMaybe<Scalars['BigDecimal']>;
    balance_not?: InputMaybe<Scalars['BigDecimal']>;
    balance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    entryTimestamp?: InputMaybe<Scalars['Int']>;
    entryTimestamp_gt?: InputMaybe<Scalars['Int']>;
    entryTimestamp_gte?: InputMaybe<Scalars['Int']>;
    entryTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    entryTimestamp_lt?: InputMaybe<Scalars['Int']>;
    entryTimestamp_lte?: InputMaybe<Scalars['Int']>;
    entryTimestamp_not?: InputMaybe<Scalars['Int']>;
    entryTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
    id?: InputMaybe<Scalars['ID']>;
    id_gt?: InputMaybe<Scalars['ID']>;
    id_gte?: InputMaybe<Scalars['ID']>;
    id_in?: InputMaybe<Array<Scalars['ID']>>;
    id_lt?: InputMaybe<Scalars['ID']>;
    id_lte?: InputMaybe<Scalars['ID']>;
    id_not?: InputMaybe<Scalars['ID']>;
    id_not_in?: InputMaybe<Array<Scalars['ID']>>;
    level?: InputMaybe<Scalars['Int']>;
    level_gt?: InputMaybe<Scalars['Int']>;
    level_gte?: InputMaybe<Scalars['Int']>;
    level_in?: InputMaybe<Array<Scalars['Int']>>;
    level_lt?: InputMaybe<Scalars['Int']>;
    level_lte?: InputMaybe<Scalars['Int']>;
    level_not?: InputMaybe<Scalars['Int']>;
    level_not_in?: InputMaybe<Array<Scalars['Int']>>;
    or?: InputMaybe<Array<InputMaybe<DailyRelicSnapshot_Filter>>>;
    pool?: InputMaybe<Scalars['String']>;
    poolId?: InputMaybe<Scalars['Int']>;
    poolId_gt?: InputMaybe<Scalars['Int']>;
    poolId_gte?: InputMaybe<Scalars['Int']>;
    poolId_in?: InputMaybe<Array<Scalars['Int']>>;
    poolId_lt?: InputMaybe<Scalars['Int']>;
    poolId_lte?: InputMaybe<Scalars['Int']>;
    poolId_not?: InputMaybe<Scalars['Int']>;
    poolId_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
    relic?: InputMaybe<Scalars['String']>;
    relicId?: InputMaybe<Scalars['Int']>;
    relicId_gt?: InputMaybe<Scalars['Int']>;
    relicId_gte?: InputMaybe<Scalars['Int']>;
    relicId_in?: InputMaybe<Array<Scalars['Int']>>;
    relicId_lt?: InputMaybe<Scalars['Int']>;
    relicId_lte?: InputMaybe<Scalars['Int']>;
    relicId_not?: InputMaybe<Scalars['Int']>;
    relicId_not_in?: InputMaybe<Array<Scalars['Int']>>;
    relic_?: InputMaybe<Relic_Filter>;
    relic_contains?: InputMaybe<Scalars['String']>;
    relic_contains_nocase?: InputMaybe<Scalars['String']>;
    relic_ends_with?: InputMaybe<Scalars['String']>;
    relic_ends_with_nocase?: InputMaybe<Scalars['String']>;
    relic_gt?: InputMaybe<Scalars['String']>;
    relic_gte?: InputMaybe<Scalars['String']>;
    relic_in?: InputMaybe<Array<Scalars['String']>>;
    relic_lt?: InputMaybe<Scalars['String']>;
    relic_lte?: InputMaybe<Scalars['String']>;
    relic_not?: InputMaybe<Scalars['String']>;
    relic_not_contains?: InputMaybe<Scalars['String']>;
    relic_not_contains_nocase?: InputMaybe<Scalars['String']>;
    relic_not_ends_with?: InputMaybe<Scalars['String']>;
    relic_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    relic_not_in?: InputMaybe<Array<Scalars['String']>>;
    relic_not_starts_with?: InputMaybe<Scalars['String']>;
    relic_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    relic_starts_with?: InputMaybe<Scalars['String']>;
    relic_starts_with_nocase?: InputMaybe<Scalars['String']>;
    snapshotTimestamp?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_gt?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_gte?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    snapshotTimestamp_lt?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_lte?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_not?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
    user?: InputMaybe<Scalars['String']>;
    userAddress?: InputMaybe<Scalars['Bytes']>;
    userAddress_contains?: InputMaybe<Scalars['Bytes']>;
    userAddress_gt?: InputMaybe<Scalars['Bytes']>;
    userAddress_gte?: InputMaybe<Scalars['Bytes']>;
    userAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
    userAddress_lt?: InputMaybe<Scalars['Bytes']>;
    userAddress_lte?: InputMaybe<Scalars['Bytes']>;
    userAddress_not?: InputMaybe<Scalars['Bytes']>;
    userAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
    userAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
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

export enum DailyRelicSnapshot_OrderBy {
    balance = 'balance',
    entryTimestamp = 'entryTimestamp',
    id = 'id',
    level = 'level',
    pool = 'pool',
    poolId = 'poolId',
    pool__allocPoint = 'pool__allocPoint',
    pool__id = 'pool__id',
    pool__name = 'pool__name',
    pool__nftDescriptor = 'pool__nftDescriptor',
    pool__pid = 'pool__pid',
    pool__poolTokenAddress = 'pool__poolTokenAddress',
    pool__relicCount = 'pool__relicCount',
    pool__totalBalance = 'pool__totalBalance',
    relic = 'relic',
    relicId = 'relicId',
    relic__balance = 'relic__balance',
    relic__entryTimestamp = 'relic__entryTimestamp',
    relic__id = 'relic__id',
    relic__level = 'relic__level',
    relic__pid = 'relic__pid',
    relic__relicId = 'relic__relicId',
    relic__userAddress = 'relic__userAddress',
    snapshotTimestamp = 'snapshotTimestamp',
    user = 'user',
    userAddress = 'userAddress',
    user__address = 'user__address',
    user__id = 'user__id',
}

export type EmissionCurve = {
    __typename?: 'EmissionCurve';
    address: Scalars['Bytes'];
    id: Scalars['Bytes'];
    rewardPerSecond: Scalars['BigDecimal'];
};

export type EmissionCurve_Filter = {
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
    and?: InputMaybe<Array<InputMaybe<EmissionCurve_Filter>>>;
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
    or?: InputMaybe<Array<InputMaybe<EmissionCurve_Filter>>>;
    rewardPerSecond?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_gt?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_gte?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    rewardPerSecond_lt?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_lte?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_not?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum EmissionCurve_OrderBy {
    address = 'address',
    id = 'id',
    rewardPerSecond = 'rewardPerSecond',
}

export type Harvest = {
    __typename?: 'Harvest';
    amount: Scalars['BigDecimal'];
    id: Scalars['Bytes'];
    relic: Relic;
    reliquary: Reliquary;
    timestamp: Scalars['Int'];
    token: Token;
    user: User;
};

export type Harvest_Filter = {
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
    and?: InputMaybe<Array<InputMaybe<Harvest_Filter>>>;
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
    or?: InputMaybe<Array<InputMaybe<Harvest_Filter>>>;
    relic?: InputMaybe<Scalars['String']>;
    relic_?: InputMaybe<Relic_Filter>;
    relic_contains?: InputMaybe<Scalars['String']>;
    relic_contains_nocase?: InputMaybe<Scalars['String']>;
    relic_ends_with?: InputMaybe<Scalars['String']>;
    relic_ends_with_nocase?: InputMaybe<Scalars['String']>;
    relic_gt?: InputMaybe<Scalars['String']>;
    relic_gte?: InputMaybe<Scalars['String']>;
    relic_in?: InputMaybe<Array<Scalars['String']>>;
    relic_lt?: InputMaybe<Scalars['String']>;
    relic_lte?: InputMaybe<Scalars['String']>;
    relic_not?: InputMaybe<Scalars['String']>;
    relic_not_contains?: InputMaybe<Scalars['String']>;
    relic_not_contains_nocase?: InputMaybe<Scalars['String']>;
    relic_not_ends_with?: InputMaybe<Scalars['String']>;
    relic_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    relic_not_in?: InputMaybe<Array<Scalars['String']>>;
    relic_not_starts_with?: InputMaybe<Scalars['String']>;
    relic_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    relic_starts_with?: InputMaybe<Scalars['String']>;
    relic_starts_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary?: InputMaybe<Scalars['String']>;
    reliquary_?: InputMaybe<Reliquary_Filter>;
    reliquary_contains?: InputMaybe<Scalars['String']>;
    reliquary_contains_nocase?: InputMaybe<Scalars['String']>;
    reliquary_ends_with?: InputMaybe<Scalars['String']>;
    reliquary_ends_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_gt?: InputMaybe<Scalars['String']>;
    reliquary_gte?: InputMaybe<Scalars['String']>;
    reliquary_in?: InputMaybe<Array<Scalars['String']>>;
    reliquary_lt?: InputMaybe<Scalars['String']>;
    reliquary_lte?: InputMaybe<Scalars['String']>;
    reliquary_not?: InputMaybe<Scalars['String']>;
    reliquary_not_contains?: InputMaybe<Scalars['String']>;
    reliquary_not_contains_nocase?: InputMaybe<Scalars['String']>;
    reliquary_not_ends_with?: InputMaybe<Scalars['String']>;
    reliquary_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_not_in?: InputMaybe<Array<Scalars['String']>>;
    reliquary_not_starts_with?: InputMaybe<Scalars['String']>;
    reliquary_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_starts_with?: InputMaybe<Scalars['String']>;
    reliquary_starts_with_nocase?: InputMaybe<Scalars['String']>;
    timestamp?: InputMaybe<Scalars['Int']>;
    timestamp_gt?: InputMaybe<Scalars['Int']>;
    timestamp_gte?: InputMaybe<Scalars['Int']>;
    timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    timestamp_lt?: InputMaybe<Scalars['Int']>;
    timestamp_lte?: InputMaybe<Scalars['Int']>;
    timestamp_not?: InputMaybe<Scalars['Int']>;
    timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
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

export enum Harvest_OrderBy {
    amount = 'amount',
    id = 'id',
    relic = 'relic',
    relic__balance = 'relic__balance',
    relic__entryTimestamp = 'relic__entryTimestamp',
    relic__id = 'relic__id',
    relic__level = 'relic__level',
    relic__pid = 'relic__pid',
    relic__relicId = 'relic__relicId',
    relic__userAddress = 'relic__userAddress',
    reliquary = 'reliquary',
    reliquary__id = 'reliquary__id',
    reliquary__poolCount = 'reliquary__poolCount',
    reliquary__relicCount = 'reliquary__relicCount',
    reliquary__totalAllocPoint = 'reliquary__totalAllocPoint',
    timestamp = 'timestamp',
    token = 'token',
    token__address = 'token__address',
    token__decimals = 'token__decimals',
    token__id = 'token__id',
    token__name = 'token__name',
    token__symbol = 'token__symbol',
    user = 'user',
    user__address = 'user__address',
    user__id = 'user__id',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    asc = 'asc',
    desc = 'desc',
}

export type Pool = {
    __typename?: 'Pool';
    allocPoint: Scalars['Int'];
    dailyPoolSnapshots: Array<DailyPoolSnapshot>;
    dailyRelicSnapshots: Array<DailyRelicSnapshot>;
    id: Scalars['Bytes'];
    levels: Array<PoolLevel>;
    name: Scalars['String'];
    nftDescriptor: Scalars['Bytes'];
    pid: Scalars['Int'];
    poolToken: Token;
    poolTokenAddress: Scalars['Bytes'];
    relicCount: Scalars['Int'];
    relics: Array<Relic>;
    reliquary: Reliquary;
    rewarder?: Maybe<Rewarder>;
    totalBalance: Scalars['BigDecimal'];
};

export type PoolDailyPoolSnapshotsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyPoolSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<DailyPoolSnapshot_Filter>;
};

export type PoolDailyRelicSnapshotsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyRelicSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<DailyRelicSnapshot_Filter>;
};

export type PoolLevelsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolLevel_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<PoolLevel_Filter>;
};

export type PoolRelicsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Relic_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Relic_Filter>;
};

export type PoolLevel = {
    __typename?: 'PoolLevel';
    allocationPoints: Scalars['Int'];
    balance: Scalars['BigDecimal'];
    id: Scalars['Bytes'];
    level: Scalars['Int'];
    pool: Pool;
    relics: Array<Relic>;
    requiredMaturity: Scalars['Int'];
};

export type PoolLevelRelicsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Relic_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Relic_Filter>;
};

export type PoolLevel_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    allocationPoints?: InputMaybe<Scalars['Int']>;
    allocationPoints_gt?: InputMaybe<Scalars['Int']>;
    allocationPoints_gte?: InputMaybe<Scalars['Int']>;
    allocationPoints_in?: InputMaybe<Array<Scalars['Int']>>;
    allocationPoints_lt?: InputMaybe<Scalars['Int']>;
    allocationPoints_lte?: InputMaybe<Scalars['Int']>;
    allocationPoints_not?: InputMaybe<Scalars['Int']>;
    allocationPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
    and?: InputMaybe<Array<InputMaybe<PoolLevel_Filter>>>;
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
    level?: InputMaybe<Scalars['Int']>;
    level_gt?: InputMaybe<Scalars['Int']>;
    level_gte?: InputMaybe<Scalars['Int']>;
    level_in?: InputMaybe<Array<Scalars['Int']>>;
    level_lt?: InputMaybe<Scalars['Int']>;
    level_lte?: InputMaybe<Scalars['Int']>;
    level_not?: InputMaybe<Scalars['Int']>;
    level_not_in?: InputMaybe<Array<Scalars['Int']>>;
    or?: InputMaybe<Array<InputMaybe<PoolLevel_Filter>>>;
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
    relics_?: InputMaybe<Relic_Filter>;
    requiredMaturity?: InputMaybe<Scalars['Int']>;
    requiredMaturity_gt?: InputMaybe<Scalars['Int']>;
    requiredMaturity_gte?: InputMaybe<Scalars['Int']>;
    requiredMaturity_in?: InputMaybe<Array<Scalars['Int']>>;
    requiredMaturity_lt?: InputMaybe<Scalars['Int']>;
    requiredMaturity_lte?: InputMaybe<Scalars['Int']>;
    requiredMaturity_not?: InputMaybe<Scalars['Int']>;
    requiredMaturity_not_in?: InputMaybe<Array<Scalars['Int']>>;
};

export enum PoolLevel_OrderBy {
    allocationPoints = 'allocationPoints',
    balance = 'balance',
    id = 'id',
    level = 'level',
    pool = 'pool',
    pool__allocPoint = 'pool__allocPoint',
    pool__id = 'pool__id',
    pool__name = 'pool__name',
    pool__nftDescriptor = 'pool__nftDescriptor',
    pool__pid = 'pool__pid',
    pool__poolTokenAddress = 'pool__poolTokenAddress',
    pool__relicCount = 'pool__relicCount',
    pool__totalBalance = 'pool__totalBalance',
    relics = 'relics',
    requiredMaturity = 'requiredMaturity',
}

export type Pool_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    allocPoint?: InputMaybe<Scalars['Int']>;
    allocPoint_gt?: InputMaybe<Scalars['Int']>;
    allocPoint_gte?: InputMaybe<Scalars['Int']>;
    allocPoint_in?: InputMaybe<Array<Scalars['Int']>>;
    allocPoint_lt?: InputMaybe<Scalars['Int']>;
    allocPoint_lte?: InputMaybe<Scalars['Int']>;
    allocPoint_not?: InputMaybe<Scalars['Int']>;
    allocPoint_not_in?: InputMaybe<Array<Scalars['Int']>>;
    and?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
    dailyPoolSnapshots_?: InputMaybe<DailyPoolSnapshot_Filter>;
    dailyRelicSnapshots_?: InputMaybe<DailyRelicSnapshot_Filter>;
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
    levels_?: InputMaybe<PoolLevel_Filter>;
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
    nftDescriptor?: InputMaybe<Scalars['Bytes']>;
    nftDescriptor_contains?: InputMaybe<Scalars['Bytes']>;
    nftDescriptor_gt?: InputMaybe<Scalars['Bytes']>;
    nftDescriptor_gte?: InputMaybe<Scalars['Bytes']>;
    nftDescriptor_in?: InputMaybe<Array<Scalars['Bytes']>>;
    nftDescriptor_lt?: InputMaybe<Scalars['Bytes']>;
    nftDescriptor_lte?: InputMaybe<Scalars['Bytes']>;
    nftDescriptor_not?: InputMaybe<Scalars['Bytes']>;
    nftDescriptor_not_contains?: InputMaybe<Scalars['Bytes']>;
    nftDescriptor_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    or?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
    pid?: InputMaybe<Scalars['Int']>;
    pid_gt?: InputMaybe<Scalars['Int']>;
    pid_gte?: InputMaybe<Scalars['Int']>;
    pid_in?: InputMaybe<Array<Scalars['Int']>>;
    pid_lt?: InputMaybe<Scalars['Int']>;
    pid_lte?: InputMaybe<Scalars['Int']>;
    pid_not?: InputMaybe<Scalars['Int']>;
    pid_not_in?: InputMaybe<Array<Scalars['Int']>>;
    poolToken?: InputMaybe<Scalars['String']>;
    poolTokenAddress?: InputMaybe<Scalars['Bytes']>;
    poolTokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
    poolTokenAddress_gt?: InputMaybe<Scalars['Bytes']>;
    poolTokenAddress_gte?: InputMaybe<Scalars['Bytes']>;
    poolTokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
    poolTokenAddress_lt?: InputMaybe<Scalars['Bytes']>;
    poolTokenAddress_lte?: InputMaybe<Scalars['Bytes']>;
    poolTokenAddress_not?: InputMaybe<Scalars['Bytes']>;
    poolTokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
    poolTokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    poolToken_?: InputMaybe<Token_Filter>;
    poolToken_contains?: InputMaybe<Scalars['String']>;
    poolToken_contains_nocase?: InputMaybe<Scalars['String']>;
    poolToken_ends_with?: InputMaybe<Scalars['String']>;
    poolToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
    poolToken_gt?: InputMaybe<Scalars['String']>;
    poolToken_gte?: InputMaybe<Scalars['String']>;
    poolToken_in?: InputMaybe<Array<Scalars['String']>>;
    poolToken_lt?: InputMaybe<Scalars['String']>;
    poolToken_lte?: InputMaybe<Scalars['String']>;
    poolToken_not?: InputMaybe<Scalars['String']>;
    poolToken_not_contains?: InputMaybe<Scalars['String']>;
    poolToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
    poolToken_not_ends_with?: InputMaybe<Scalars['String']>;
    poolToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    poolToken_not_in?: InputMaybe<Array<Scalars['String']>>;
    poolToken_not_starts_with?: InputMaybe<Scalars['String']>;
    poolToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    poolToken_starts_with?: InputMaybe<Scalars['String']>;
    poolToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
    relicCount?: InputMaybe<Scalars['Int']>;
    relicCount_gt?: InputMaybe<Scalars['Int']>;
    relicCount_gte?: InputMaybe<Scalars['Int']>;
    relicCount_in?: InputMaybe<Array<Scalars['Int']>>;
    relicCount_lt?: InputMaybe<Scalars['Int']>;
    relicCount_lte?: InputMaybe<Scalars['Int']>;
    relicCount_not?: InputMaybe<Scalars['Int']>;
    relicCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
    relics_?: InputMaybe<Relic_Filter>;
    reliquary?: InputMaybe<Scalars['String']>;
    reliquary_?: InputMaybe<Reliquary_Filter>;
    reliquary_contains?: InputMaybe<Scalars['String']>;
    reliquary_contains_nocase?: InputMaybe<Scalars['String']>;
    reliquary_ends_with?: InputMaybe<Scalars['String']>;
    reliquary_ends_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_gt?: InputMaybe<Scalars['String']>;
    reliquary_gte?: InputMaybe<Scalars['String']>;
    reliquary_in?: InputMaybe<Array<Scalars['String']>>;
    reliquary_lt?: InputMaybe<Scalars['String']>;
    reliquary_lte?: InputMaybe<Scalars['String']>;
    reliquary_not?: InputMaybe<Scalars['String']>;
    reliquary_not_contains?: InputMaybe<Scalars['String']>;
    reliquary_not_contains_nocase?: InputMaybe<Scalars['String']>;
    reliquary_not_ends_with?: InputMaybe<Scalars['String']>;
    reliquary_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_not_in?: InputMaybe<Array<Scalars['String']>>;
    reliquary_not_starts_with?: InputMaybe<Scalars['String']>;
    reliquary_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_starts_with?: InputMaybe<Scalars['String']>;
    reliquary_starts_with_nocase?: InputMaybe<Scalars['String']>;
    rewarder?: InputMaybe<Scalars['String']>;
    rewarder_?: InputMaybe<Rewarder_Filter>;
    rewarder_contains?: InputMaybe<Scalars['String']>;
    rewarder_contains_nocase?: InputMaybe<Scalars['String']>;
    rewarder_ends_with?: InputMaybe<Scalars['String']>;
    rewarder_ends_with_nocase?: InputMaybe<Scalars['String']>;
    rewarder_gt?: InputMaybe<Scalars['String']>;
    rewarder_gte?: InputMaybe<Scalars['String']>;
    rewarder_in?: InputMaybe<Array<Scalars['String']>>;
    rewarder_lt?: InputMaybe<Scalars['String']>;
    rewarder_lte?: InputMaybe<Scalars['String']>;
    rewarder_not?: InputMaybe<Scalars['String']>;
    rewarder_not_contains?: InputMaybe<Scalars['String']>;
    rewarder_not_contains_nocase?: InputMaybe<Scalars['String']>;
    rewarder_not_ends_with?: InputMaybe<Scalars['String']>;
    rewarder_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    rewarder_not_in?: InputMaybe<Array<Scalars['String']>>;
    rewarder_not_starts_with?: InputMaybe<Scalars['String']>;
    rewarder_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    rewarder_starts_with?: InputMaybe<Scalars['String']>;
    rewarder_starts_with_nocase?: InputMaybe<Scalars['String']>;
    totalBalance?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalBalance_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_not?: InputMaybe<Scalars['BigDecimal']>;
    totalBalance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum Pool_OrderBy {
    allocPoint = 'allocPoint',
    dailyPoolSnapshots = 'dailyPoolSnapshots',
    dailyRelicSnapshots = 'dailyRelicSnapshots',
    id = 'id',
    levels = 'levels',
    name = 'name',
    nftDescriptor = 'nftDescriptor',
    pid = 'pid',
    poolToken = 'poolToken',
    poolTokenAddress = 'poolTokenAddress',
    poolToken__address = 'poolToken__address',
    poolToken__decimals = 'poolToken__decimals',
    poolToken__id = 'poolToken__id',
    poolToken__name = 'poolToken__name',
    poolToken__symbol = 'poolToken__symbol',
    relicCount = 'relicCount',
    relics = 'relics',
    reliquary = 'reliquary',
    reliquary__id = 'reliquary__id',
    reliquary__poolCount = 'reliquary__poolCount',
    reliquary__relicCount = 'reliquary__relicCount',
    reliquary__totalAllocPoint = 'reliquary__totalAllocPoint',
    rewarder = 'rewarder',
    rewarder__id = 'rewarder__id',
    totalBalance = 'totalBalance',
}

export type Query = {
    __typename?: 'Query';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    dailyPoolSnapshot?: Maybe<DailyPoolSnapshot>;
    dailyPoolSnapshots: Array<DailyPoolSnapshot>;
    dailyRelicSnapshot?: Maybe<DailyRelicSnapshot>;
    dailyRelicSnapshots: Array<DailyRelicSnapshot>;
    emissionCurve?: Maybe<EmissionCurve>;
    emissionCurves: Array<EmissionCurve>;
    harvest?: Maybe<Harvest>;
    harvests: Array<Harvest>;
    pool?: Maybe<Pool>;
    poolLevel?: Maybe<PoolLevel>;
    poolLevels: Array<PoolLevel>;
    pools: Array<Pool>;
    relic?: Maybe<Relic>;
    relics: Array<Relic>;
    reliquaries: Array<Reliquary>;
    reliquary?: Maybe<Reliquary>;
    rewarder?: Maybe<Rewarder>;
    rewarderEmission?: Maybe<RewarderEmission>;
    rewarderEmissions: Array<RewarderEmission>;
    rewarders: Array<Rewarder>;
    token?: Maybe<Token>;
    tokens: Array<Token>;
    user?: Maybe<User>;
    users: Array<User>;
};

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type QueryDailyPoolSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDailyPoolSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyPoolSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<DailyPoolSnapshot_Filter>;
};

export type QueryDailyRelicSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDailyRelicSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyRelicSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<DailyRelicSnapshot_Filter>;
};

export type QueryEmissionCurveArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryEmissionCurvesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<EmissionCurve_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<EmissionCurve_Filter>;
};

export type QueryHarvestArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryHarvestsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Harvest_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Harvest_Filter>;
};

export type QueryPoolArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolLevelArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryPoolLevelsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolLevel_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<PoolLevel_Filter>;
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

export type QueryRelicArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRelicsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Relic_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Relic_Filter>;
};

export type QueryReliquariesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Reliquary_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Reliquary_Filter>;
};

export type QueryReliquaryArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRewarderArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRewarderEmissionArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRewarderEmissionsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<RewarderEmission_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<RewarderEmission_Filter>;
};

export type QueryRewardersArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Rewarder_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Rewarder_Filter>;
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

export type Relic = {
    __typename?: 'Relic';
    balance: Scalars['BigDecimal'];
    dailyRelicSnapshots: Array<DailyRelicSnapshot>;
    entryTimestamp: Scalars['Int'];
    harvests: Array<Harvest>;
    id: Scalars['Bytes'];
    level: Scalars['Int'];
    pid: Scalars['Int'];
    pool: Pool;
    poolLevel: PoolLevel;
    relicId: Scalars['Int'];
    reliquary: Reliquary;
    user: User;
    userAddress: Scalars['Bytes'];
};

export type RelicDailyRelicSnapshotsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyRelicSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<DailyRelicSnapshot_Filter>;
};

export type RelicHarvestsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Harvest_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Harvest_Filter>;
};

export type Relic_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<Relic_Filter>>>;
    balance?: InputMaybe<Scalars['BigDecimal']>;
    balance_gt?: InputMaybe<Scalars['BigDecimal']>;
    balance_gte?: InputMaybe<Scalars['BigDecimal']>;
    balance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    balance_lt?: InputMaybe<Scalars['BigDecimal']>;
    balance_lte?: InputMaybe<Scalars['BigDecimal']>;
    balance_not?: InputMaybe<Scalars['BigDecimal']>;
    balance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    dailyRelicSnapshots_?: InputMaybe<DailyRelicSnapshot_Filter>;
    entryTimestamp?: InputMaybe<Scalars['Int']>;
    entryTimestamp_gt?: InputMaybe<Scalars['Int']>;
    entryTimestamp_gte?: InputMaybe<Scalars['Int']>;
    entryTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    entryTimestamp_lt?: InputMaybe<Scalars['Int']>;
    entryTimestamp_lte?: InputMaybe<Scalars['Int']>;
    entryTimestamp_not?: InputMaybe<Scalars['Int']>;
    entryTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
    harvests_?: InputMaybe<Harvest_Filter>;
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
    level?: InputMaybe<Scalars['Int']>;
    level_gt?: InputMaybe<Scalars['Int']>;
    level_gte?: InputMaybe<Scalars['Int']>;
    level_in?: InputMaybe<Array<Scalars['Int']>>;
    level_lt?: InputMaybe<Scalars['Int']>;
    level_lte?: InputMaybe<Scalars['Int']>;
    level_not?: InputMaybe<Scalars['Int']>;
    level_not_in?: InputMaybe<Array<Scalars['Int']>>;
    or?: InputMaybe<Array<InputMaybe<Relic_Filter>>>;
    pid?: InputMaybe<Scalars['Int']>;
    pid_gt?: InputMaybe<Scalars['Int']>;
    pid_gte?: InputMaybe<Scalars['Int']>;
    pid_in?: InputMaybe<Array<Scalars['Int']>>;
    pid_lt?: InputMaybe<Scalars['Int']>;
    pid_lte?: InputMaybe<Scalars['Int']>;
    pid_not?: InputMaybe<Scalars['Int']>;
    pid_not_in?: InputMaybe<Array<Scalars['Int']>>;
    pool?: InputMaybe<Scalars['String']>;
    poolLevel?: InputMaybe<Scalars['String']>;
    poolLevel_?: InputMaybe<PoolLevel_Filter>;
    poolLevel_contains?: InputMaybe<Scalars['String']>;
    poolLevel_contains_nocase?: InputMaybe<Scalars['String']>;
    poolLevel_ends_with?: InputMaybe<Scalars['String']>;
    poolLevel_ends_with_nocase?: InputMaybe<Scalars['String']>;
    poolLevel_gt?: InputMaybe<Scalars['String']>;
    poolLevel_gte?: InputMaybe<Scalars['String']>;
    poolLevel_in?: InputMaybe<Array<Scalars['String']>>;
    poolLevel_lt?: InputMaybe<Scalars['String']>;
    poolLevel_lte?: InputMaybe<Scalars['String']>;
    poolLevel_not?: InputMaybe<Scalars['String']>;
    poolLevel_not_contains?: InputMaybe<Scalars['String']>;
    poolLevel_not_contains_nocase?: InputMaybe<Scalars['String']>;
    poolLevel_not_ends_with?: InputMaybe<Scalars['String']>;
    poolLevel_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    poolLevel_not_in?: InputMaybe<Array<Scalars['String']>>;
    poolLevel_not_starts_with?: InputMaybe<Scalars['String']>;
    poolLevel_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    poolLevel_starts_with?: InputMaybe<Scalars['String']>;
    poolLevel_starts_with_nocase?: InputMaybe<Scalars['String']>;
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
    relicId?: InputMaybe<Scalars['Int']>;
    relicId_gt?: InputMaybe<Scalars['Int']>;
    relicId_gte?: InputMaybe<Scalars['Int']>;
    relicId_in?: InputMaybe<Array<Scalars['Int']>>;
    relicId_lt?: InputMaybe<Scalars['Int']>;
    relicId_lte?: InputMaybe<Scalars['Int']>;
    relicId_not?: InputMaybe<Scalars['Int']>;
    relicId_not_in?: InputMaybe<Array<Scalars['Int']>>;
    reliquary?: InputMaybe<Scalars['String']>;
    reliquary_?: InputMaybe<Reliquary_Filter>;
    reliquary_contains?: InputMaybe<Scalars['String']>;
    reliquary_contains_nocase?: InputMaybe<Scalars['String']>;
    reliquary_ends_with?: InputMaybe<Scalars['String']>;
    reliquary_ends_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_gt?: InputMaybe<Scalars['String']>;
    reliquary_gte?: InputMaybe<Scalars['String']>;
    reliquary_in?: InputMaybe<Array<Scalars['String']>>;
    reliquary_lt?: InputMaybe<Scalars['String']>;
    reliquary_lte?: InputMaybe<Scalars['String']>;
    reliquary_not?: InputMaybe<Scalars['String']>;
    reliquary_not_contains?: InputMaybe<Scalars['String']>;
    reliquary_not_contains_nocase?: InputMaybe<Scalars['String']>;
    reliquary_not_ends_with?: InputMaybe<Scalars['String']>;
    reliquary_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_not_in?: InputMaybe<Array<Scalars['String']>>;
    reliquary_not_starts_with?: InputMaybe<Scalars['String']>;
    reliquary_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_starts_with?: InputMaybe<Scalars['String']>;
    reliquary_starts_with_nocase?: InputMaybe<Scalars['String']>;
    user?: InputMaybe<Scalars['String']>;
    userAddress?: InputMaybe<Scalars['Bytes']>;
    userAddress_contains?: InputMaybe<Scalars['Bytes']>;
    userAddress_gt?: InputMaybe<Scalars['Bytes']>;
    userAddress_gte?: InputMaybe<Scalars['Bytes']>;
    userAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
    userAddress_lt?: InputMaybe<Scalars['Bytes']>;
    userAddress_lte?: InputMaybe<Scalars['Bytes']>;
    userAddress_not?: InputMaybe<Scalars['Bytes']>;
    userAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
    userAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
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

export enum Relic_OrderBy {
    balance = 'balance',
    dailyRelicSnapshots = 'dailyRelicSnapshots',
    entryTimestamp = 'entryTimestamp',
    harvests = 'harvests',
    id = 'id',
    level = 'level',
    pid = 'pid',
    pool = 'pool',
    poolLevel = 'poolLevel',
    poolLevel__allocationPoints = 'poolLevel__allocationPoints',
    poolLevel__balance = 'poolLevel__balance',
    poolLevel__id = 'poolLevel__id',
    poolLevel__level = 'poolLevel__level',
    poolLevel__requiredMaturity = 'poolLevel__requiredMaturity',
    pool__allocPoint = 'pool__allocPoint',
    pool__id = 'pool__id',
    pool__name = 'pool__name',
    pool__nftDescriptor = 'pool__nftDescriptor',
    pool__pid = 'pool__pid',
    pool__poolTokenAddress = 'pool__poolTokenAddress',
    pool__relicCount = 'pool__relicCount',
    pool__totalBalance = 'pool__totalBalance',
    relicId = 'relicId',
    reliquary = 'reliquary',
    reliquary__id = 'reliquary__id',
    reliquary__poolCount = 'reliquary__poolCount',
    reliquary__relicCount = 'reliquary__relicCount',
    reliquary__totalAllocPoint = 'reliquary__totalAllocPoint',
    user = 'user',
    userAddress = 'userAddress',
    user__address = 'user__address',
    user__id = 'user__id',
}

export type Reliquary = {
    __typename?: 'Reliquary';
    emissionCurve: EmissionCurve;
    emissionToken: Token;
    harvests: Array<Harvest>;
    id: Scalars['Bytes'];
    poolCount: Scalars['Int'];
    pools?: Maybe<Array<Pool>>;
    relicCount: Scalars['Int'];
    relics: Array<Relic>;
    totalAllocPoint: Scalars['Int'];
    users?: Maybe<Array<User>>;
};

export type ReliquaryHarvestsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Harvest_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Harvest_Filter>;
};

export type ReliquaryPoolsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Pool_Filter>;
};

export type ReliquaryRelicsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Relic_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Relic_Filter>;
};

export type ReliquaryUsersArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<User_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<User_Filter>;
};

export type Reliquary_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<Reliquary_Filter>>>;
    emissionCurve?: InputMaybe<Scalars['String']>;
    emissionCurve_?: InputMaybe<EmissionCurve_Filter>;
    emissionCurve_contains?: InputMaybe<Scalars['String']>;
    emissionCurve_contains_nocase?: InputMaybe<Scalars['String']>;
    emissionCurve_ends_with?: InputMaybe<Scalars['String']>;
    emissionCurve_ends_with_nocase?: InputMaybe<Scalars['String']>;
    emissionCurve_gt?: InputMaybe<Scalars['String']>;
    emissionCurve_gte?: InputMaybe<Scalars['String']>;
    emissionCurve_in?: InputMaybe<Array<Scalars['String']>>;
    emissionCurve_lt?: InputMaybe<Scalars['String']>;
    emissionCurve_lte?: InputMaybe<Scalars['String']>;
    emissionCurve_not?: InputMaybe<Scalars['String']>;
    emissionCurve_not_contains?: InputMaybe<Scalars['String']>;
    emissionCurve_not_contains_nocase?: InputMaybe<Scalars['String']>;
    emissionCurve_not_ends_with?: InputMaybe<Scalars['String']>;
    emissionCurve_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    emissionCurve_not_in?: InputMaybe<Array<Scalars['String']>>;
    emissionCurve_not_starts_with?: InputMaybe<Scalars['String']>;
    emissionCurve_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    emissionCurve_starts_with?: InputMaybe<Scalars['String']>;
    emissionCurve_starts_with_nocase?: InputMaybe<Scalars['String']>;
    emissionToken?: InputMaybe<Scalars['String']>;
    emissionToken_?: InputMaybe<Token_Filter>;
    emissionToken_contains?: InputMaybe<Scalars['String']>;
    emissionToken_contains_nocase?: InputMaybe<Scalars['String']>;
    emissionToken_ends_with?: InputMaybe<Scalars['String']>;
    emissionToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
    emissionToken_gt?: InputMaybe<Scalars['String']>;
    emissionToken_gte?: InputMaybe<Scalars['String']>;
    emissionToken_in?: InputMaybe<Array<Scalars['String']>>;
    emissionToken_lt?: InputMaybe<Scalars['String']>;
    emissionToken_lte?: InputMaybe<Scalars['String']>;
    emissionToken_not?: InputMaybe<Scalars['String']>;
    emissionToken_not_contains?: InputMaybe<Scalars['String']>;
    emissionToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
    emissionToken_not_ends_with?: InputMaybe<Scalars['String']>;
    emissionToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    emissionToken_not_in?: InputMaybe<Array<Scalars['String']>>;
    emissionToken_not_starts_with?: InputMaybe<Scalars['String']>;
    emissionToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    emissionToken_starts_with?: InputMaybe<Scalars['String']>;
    emissionToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
    harvests_?: InputMaybe<Harvest_Filter>;
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
    or?: InputMaybe<Array<InputMaybe<Reliquary_Filter>>>;
    poolCount?: InputMaybe<Scalars['Int']>;
    poolCount_gt?: InputMaybe<Scalars['Int']>;
    poolCount_gte?: InputMaybe<Scalars['Int']>;
    poolCount_in?: InputMaybe<Array<Scalars['Int']>>;
    poolCount_lt?: InputMaybe<Scalars['Int']>;
    poolCount_lte?: InputMaybe<Scalars['Int']>;
    poolCount_not?: InputMaybe<Scalars['Int']>;
    poolCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
    pools_?: InputMaybe<Pool_Filter>;
    relicCount?: InputMaybe<Scalars['Int']>;
    relicCount_gt?: InputMaybe<Scalars['Int']>;
    relicCount_gte?: InputMaybe<Scalars['Int']>;
    relicCount_in?: InputMaybe<Array<Scalars['Int']>>;
    relicCount_lt?: InputMaybe<Scalars['Int']>;
    relicCount_lte?: InputMaybe<Scalars['Int']>;
    relicCount_not?: InputMaybe<Scalars['Int']>;
    relicCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
    relics_?: InputMaybe<Relic_Filter>;
    totalAllocPoint?: InputMaybe<Scalars['Int']>;
    totalAllocPoint_gt?: InputMaybe<Scalars['Int']>;
    totalAllocPoint_gte?: InputMaybe<Scalars['Int']>;
    totalAllocPoint_in?: InputMaybe<Array<Scalars['Int']>>;
    totalAllocPoint_lt?: InputMaybe<Scalars['Int']>;
    totalAllocPoint_lte?: InputMaybe<Scalars['Int']>;
    totalAllocPoint_not?: InputMaybe<Scalars['Int']>;
    totalAllocPoint_not_in?: InputMaybe<Array<Scalars['Int']>>;
    users_?: InputMaybe<User_Filter>;
};

export enum Reliquary_OrderBy {
    emissionCurve = 'emissionCurve',
    emissionCurve__address = 'emissionCurve__address',
    emissionCurve__id = 'emissionCurve__id',
    emissionCurve__rewardPerSecond = 'emissionCurve__rewardPerSecond',
    emissionToken = 'emissionToken',
    emissionToken__address = 'emissionToken__address',
    emissionToken__decimals = 'emissionToken__decimals',
    emissionToken__id = 'emissionToken__id',
    emissionToken__name = 'emissionToken__name',
    emissionToken__symbol = 'emissionToken__symbol',
    harvests = 'harvests',
    id = 'id',
    poolCount = 'poolCount',
    pools = 'pools',
    relicCount = 'relicCount',
    relics = 'relics',
    totalAllocPoint = 'totalAllocPoint',
    users = 'users',
}

export type Rewarder = {
    __typename?: 'Rewarder';
    emissions: Array<RewarderEmission>;
    id: Scalars['Bytes'];
};

export type RewarderEmissionsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<RewarderEmission_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<RewarderEmission_Filter>;
};

export type RewarderEmission = {
    __typename?: 'RewarderEmission';
    id: Scalars['Bytes'];
    rewardPerSecond: Scalars['BigDecimal'];
    rewardToken: Token;
    rewardTokenAddress: Scalars['Bytes'];
    rewarder: Rewarder;
};

export type RewarderEmission_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<RewarderEmission_Filter>>>;
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
    or?: InputMaybe<Array<InputMaybe<RewarderEmission_Filter>>>;
    rewardPerSecond?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_gt?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_gte?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    rewardPerSecond_lt?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_lte?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_not?: InputMaybe<Scalars['BigDecimal']>;
    rewardPerSecond_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    rewardToken?: InputMaybe<Scalars['String']>;
    rewardTokenAddress?: InputMaybe<Scalars['Bytes']>;
    rewardTokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
    rewardTokenAddress_gt?: InputMaybe<Scalars['Bytes']>;
    rewardTokenAddress_gte?: InputMaybe<Scalars['Bytes']>;
    rewardTokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
    rewardTokenAddress_lt?: InputMaybe<Scalars['Bytes']>;
    rewardTokenAddress_lte?: InputMaybe<Scalars['Bytes']>;
    rewardTokenAddress_not?: InputMaybe<Scalars['Bytes']>;
    rewardTokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
    rewardTokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
    rewardToken_?: InputMaybe<Token_Filter>;
    rewardToken_contains?: InputMaybe<Scalars['String']>;
    rewardToken_contains_nocase?: InputMaybe<Scalars['String']>;
    rewardToken_ends_with?: InputMaybe<Scalars['String']>;
    rewardToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
    rewardToken_gt?: InputMaybe<Scalars['String']>;
    rewardToken_gte?: InputMaybe<Scalars['String']>;
    rewardToken_in?: InputMaybe<Array<Scalars['String']>>;
    rewardToken_lt?: InputMaybe<Scalars['String']>;
    rewardToken_lte?: InputMaybe<Scalars['String']>;
    rewardToken_not?: InputMaybe<Scalars['String']>;
    rewardToken_not_contains?: InputMaybe<Scalars['String']>;
    rewardToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
    rewardToken_not_ends_with?: InputMaybe<Scalars['String']>;
    rewardToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    rewardToken_not_in?: InputMaybe<Array<Scalars['String']>>;
    rewardToken_not_starts_with?: InputMaybe<Scalars['String']>;
    rewardToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    rewardToken_starts_with?: InputMaybe<Scalars['String']>;
    rewardToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
    rewarder?: InputMaybe<Scalars['String']>;
    rewarder_?: InputMaybe<Rewarder_Filter>;
    rewarder_contains?: InputMaybe<Scalars['String']>;
    rewarder_contains_nocase?: InputMaybe<Scalars['String']>;
    rewarder_ends_with?: InputMaybe<Scalars['String']>;
    rewarder_ends_with_nocase?: InputMaybe<Scalars['String']>;
    rewarder_gt?: InputMaybe<Scalars['String']>;
    rewarder_gte?: InputMaybe<Scalars['String']>;
    rewarder_in?: InputMaybe<Array<Scalars['String']>>;
    rewarder_lt?: InputMaybe<Scalars['String']>;
    rewarder_lte?: InputMaybe<Scalars['String']>;
    rewarder_not?: InputMaybe<Scalars['String']>;
    rewarder_not_contains?: InputMaybe<Scalars['String']>;
    rewarder_not_contains_nocase?: InputMaybe<Scalars['String']>;
    rewarder_not_ends_with?: InputMaybe<Scalars['String']>;
    rewarder_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    rewarder_not_in?: InputMaybe<Array<Scalars['String']>>;
    rewarder_not_starts_with?: InputMaybe<Scalars['String']>;
    rewarder_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    rewarder_starts_with?: InputMaybe<Scalars['String']>;
    rewarder_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum RewarderEmission_OrderBy {
    id = 'id',
    rewardPerSecond = 'rewardPerSecond',
    rewardToken = 'rewardToken',
    rewardTokenAddress = 'rewardTokenAddress',
    rewardToken__address = 'rewardToken__address',
    rewardToken__decimals = 'rewardToken__decimals',
    rewardToken__id = 'rewardToken__id',
    rewardToken__name = 'rewardToken__name',
    rewardToken__symbol = 'rewardToken__symbol',
    rewarder = 'rewarder',
    rewarder__id = 'rewarder__id',
}

export type Rewarder_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<Rewarder_Filter>>>;
    emissions_?: InputMaybe<RewarderEmission_Filter>;
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
    or?: InputMaybe<Array<InputMaybe<Rewarder_Filter>>>;
};

export enum Rewarder_OrderBy {
    emissions = 'emissions',
    id = 'id',
}

export type Subscription = {
    __typename?: 'Subscription';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    dailyPoolSnapshot?: Maybe<DailyPoolSnapshot>;
    dailyPoolSnapshots: Array<DailyPoolSnapshot>;
    dailyRelicSnapshot?: Maybe<DailyRelicSnapshot>;
    dailyRelicSnapshots: Array<DailyRelicSnapshot>;
    emissionCurve?: Maybe<EmissionCurve>;
    emissionCurves: Array<EmissionCurve>;
    harvest?: Maybe<Harvest>;
    harvests: Array<Harvest>;
    pool?: Maybe<Pool>;
    poolLevel?: Maybe<PoolLevel>;
    poolLevels: Array<PoolLevel>;
    pools: Array<Pool>;
    relic?: Maybe<Relic>;
    relics: Array<Relic>;
    reliquaries: Array<Reliquary>;
    reliquary?: Maybe<Reliquary>;
    rewarder?: Maybe<Rewarder>;
    rewarderEmission?: Maybe<RewarderEmission>;
    rewarderEmissions: Array<RewarderEmission>;
    rewarders: Array<Rewarder>;
    token?: Maybe<Token>;
    tokens: Array<Token>;
    user?: Maybe<User>;
    users: Array<User>;
};

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type SubscriptionDailyPoolSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDailyPoolSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyPoolSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<DailyPoolSnapshot_Filter>;
};

export type SubscriptionDailyRelicSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDailyRelicSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyRelicSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<DailyRelicSnapshot_Filter>;
};

export type SubscriptionEmissionCurveArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionEmissionCurvesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<EmissionCurve_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<EmissionCurve_Filter>;
};

export type SubscriptionHarvestArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionHarvestsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Harvest_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Harvest_Filter>;
};

export type SubscriptionPoolArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolLevelArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionPoolLevelsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolLevel_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<PoolLevel_Filter>;
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

export type SubscriptionRelicArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRelicsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Relic_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Relic_Filter>;
};

export type SubscriptionReliquariesArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Reliquary_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Reliquary_Filter>;
};

export type SubscriptionReliquaryArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRewarderArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRewarderEmissionArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRewarderEmissionsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<RewarderEmission_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<RewarderEmission_Filter>;
};

export type SubscriptionRewardersArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Rewarder_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Rewarder_Filter>;
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
    address = 'address',
    decimals = 'decimals',
    id = 'id',
    name = 'name',
    symbol = 'symbol',
}

export type User = {
    __typename?: 'User';
    address: Scalars['Bytes'];
    dailyRelicSnapshots: Array<DailyRelicSnapshot>;
    id: Scalars['Bytes'];
    relics: Array<Relic>;
    reliquary: Reliquary;
};

export type UserDailyRelicSnapshotsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyRelicSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<DailyRelicSnapshot_Filter>;
};

export type UserRelicsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Relic_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Relic_Filter>;
};

export type User_Filter = {
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
    and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
    dailyRelicSnapshots_?: InputMaybe<DailyRelicSnapshot_Filter>;
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
    relics_?: InputMaybe<Relic_Filter>;
    reliquary?: InputMaybe<Scalars['String']>;
    reliquary_?: InputMaybe<Reliquary_Filter>;
    reliquary_contains?: InputMaybe<Scalars['String']>;
    reliquary_contains_nocase?: InputMaybe<Scalars['String']>;
    reliquary_ends_with?: InputMaybe<Scalars['String']>;
    reliquary_ends_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_gt?: InputMaybe<Scalars['String']>;
    reliquary_gte?: InputMaybe<Scalars['String']>;
    reliquary_in?: InputMaybe<Array<Scalars['String']>>;
    reliquary_lt?: InputMaybe<Scalars['String']>;
    reliquary_lte?: InputMaybe<Scalars['String']>;
    reliquary_not?: InputMaybe<Scalars['String']>;
    reliquary_not_contains?: InputMaybe<Scalars['String']>;
    reliquary_not_contains_nocase?: InputMaybe<Scalars['String']>;
    reliquary_not_ends_with?: InputMaybe<Scalars['String']>;
    reliquary_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_not_in?: InputMaybe<Array<Scalars['String']>>;
    reliquary_not_starts_with?: InputMaybe<Scalars['String']>;
    reliquary_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    reliquary_starts_with?: InputMaybe<Scalars['String']>;
    reliquary_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum User_OrderBy {
    address = 'address',
    dailyRelicSnapshots = 'dailyRelicSnapshots',
    id = 'id',
    relics = 'relics',
    reliquary = 'reliquary',
    reliquary__id = 'reliquary__id',
    reliquary__poolCount = 'reliquary__poolCount',
    reliquary__relicCount = 'reliquary__relicCount',
    reliquary__totalAllocPoint = 'reliquary__totalAllocPoint',
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

export type ReliquaryQueryVariables = Exact<{
    id: Scalars['ID'];
    block?: InputMaybe<Block_Height>;
}>;

export type ReliquaryQuery = {
    __typename?: 'Query';
    reliquary?: {
        __typename?: 'Reliquary';
        id: string;
        totalAllocPoint: number;
        poolCount: number;
        relicCount: number;
        emissionToken: {
            __typename?: 'Token';
            id: string;
            address: string;
            name: string;
            symbol: string;
            decimals: number;
        };
        emissionCurve: { __typename?: 'EmissionCurve'; id: string; address: string; rewardPerSecond: string };
    } | null;
};

export type ReliquaryRelicsQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Relic_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Relic_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type ReliquaryRelicsQuery = {
    __typename?: 'Query';
    relics: Array<{
        __typename?: 'Relic';
        id: string;
        relicId: number;
        pid: number;
        userAddress: string;
        balance: string;
        level: number;
        entryTimestamp: number;
        pool: { __typename?: 'Pool'; poolTokenAddress: string };
    }>;
};

export type ReliquaryUsersQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<User_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<User_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type ReliquaryUsersQuery = {
    __typename?: 'Query';
    reliquaryUsers: Array<{
        __typename?: 'User';
        address: string;
        relics: Array<{
            __typename?: 'Relic';
            id: string;
            relicId: number;
            pid: number;
            userAddress: string;
            balance: string;
            level: number;
            entryTimestamp: number;
            pool: { __typename?: 'Pool'; poolTokenAddress: string };
        }>;
    }>;
};

export type ReliquaryPoolsQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Pool_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type ReliquaryPoolsQuery = {
    __typename?: 'Query';
    farms: Array<{
        __typename?: 'Pool';
        id: string;
        pid: number;
        name: string;
        poolTokenAddress: string;
        totalBalance: string;
        relicCount: number;
        allocPoint: number;
        rewarder?: {
            __typename?: 'Rewarder';
            id: string;
            emissions: Array<{
                __typename?: 'RewarderEmission';
                rewardPerSecond: string;
                rewardToken: {
                    __typename?: 'Token';
                    id: string;
                    address: string;
                    name: string;
                    symbol: string;
                    decimals: number;
                };
            }>;
        } | null;
        levels: Array<{
            __typename?: 'PoolLevel';
            level: number;
            balance: string;
            allocationPoints: number;
            requiredMaturity: number;
        }>;
    }>;
};

export type ReliquaryFarmSnapshotsQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyPoolSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<DailyPoolSnapshot_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type ReliquaryFarmSnapshotsQuery = {
    __typename?: 'Query';
    farmSnapshots: Array<{
        __typename?: 'DailyPoolSnapshot';
        id: string;
        snapshotTimestamp: number;
        totalBalance: string;
        dailyDeposited: string;
        dailyWithdrawn: string;
        relicCount: number;
        farmId: number;
    }>;
};

export type ReliquaryRelicSnapshotsQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<DailyRelicSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<DailyRelicSnapshot_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type ReliquaryRelicSnapshotsQuery = {
    __typename?: 'Query';
    relicSnapshots: Array<{
        __typename?: 'DailyRelicSnapshot';
        id: string;
        relicId: number;
        snapshotTimestamp: number;
        userAddress: string;
        poolId: number;
        balance: string;
        entryTimestamp: number;
        level: number;
    }>;
};

export type ReliquaryPoolLevelsQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<PoolLevel_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<PoolLevel_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type ReliquaryPoolLevelsQuery = {
    __typename?: 'Query';
    poolLevels: Array<{
        __typename?: 'PoolLevel';
        id: string;
        level: number;
        balance: string;
        requiredMaturity: number;
        allocationPoints: number;
    }>;
};

export type ReliquaryUserFragment = {
    __typename?: 'User';
    address: string;
    relics: Array<{
        __typename?: 'Relic';
        id: string;
        relicId: number;
        pid: number;
        userAddress: string;
        balance: string;
        level: number;
        entryTimestamp: number;
        pool: { __typename?: 'Pool'; poolTokenAddress: string };
    }>;
};

export type ReliquaryRelicFragment = {
    __typename?: 'Relic';
    id: string;
    relicId: number;
    pid: number;
    userAddress: string;
    balance: string;
    level: number;
    entryTimestamp: number;
    pool: { __typename?: 'Pool'; poolTokenAddress: string };
};

export type ReliquaryFarmFragment = {
    __typename?: 'Pool';
    id: string;
    pid: number;
    name: string;
    poolTokenAddress: string;
    totalBalance: string;
    relicCount: number;
    allocPoint: number;
    rewarder?: {
        __typename?: 'Rewarder';
        id: string;
        emissions: Array<{
            __typename?: 'RewarderEmission';
            rewardPerSecond: string;
            rewardToken: {
                __typename?: 'Token';
                id: string;
                address: string;
                name: string;
                symbol: string;
                decimals: number;
            };
        }>;
    } | null;
    levels: Array<{
        __typename?: 'PoolLevel';
        level: number;
        balance: string;
        allocationPoints: number;
        requiredMaturity: number;
    }>;
};

export type ReliquaryRelicSnapshotFragment = {
    __typename?: 'DailyRelicSnapshot';
    id: string;
    relicId: number;
    snapshotTimestamp: number;
    userAddress: string;
    poolId: number;
    balance: string;
    entryTimestamp: number;
    level: number;
};

export type ReliquaryFarmSnapshotFragment = {
    __typename?: 'DailyPoolSnapshot';
    id: string;
    snapshotTimestamp: number;
    totalBalance: string;
    dailyDeposited: string;
    dailyWithdrawn: string;
    relicCount: number;
    farmId: number;
};

export type ReliquaryGetMetaQueryVariables = Exact<{ [key: string]: never }>;

export type ReliquaryGetMetaQuery = {
    __typename?: 'Query';
    meta?: {
        __typename?: '_Meta_';
        deployment: string;
        hasIndexingErrors: boolean;
        block: { __typename?: '_Block_'; number: number };
    } | null;
};

export const ReliquaryRelicFragmentDoc = gql`
    fragment ReliquaryRelic on Relic {
        id
        relicId
        pid
        userAddress
        balance
        level
        entryTimestamp
        pool {
            poolTokenAddress
        }
    }
`;
export const ReliquaryUserFragmentDoc = gql`
    fragment ReliquaryUser on User {
        address
        relics {
            ...ReliquaryRelic
        }
    }
    ${ReliquaryRelicFragmentDoc}
`;
export const ReliquaryFarmFragmentDoc = gql`
    fragment ReliquaryFarm on Pool {
        id
        pid
        name
        rewarder {
            id
            emissions {
                rewardToken {
                    id
                    address
                    name
                    symbol
                    decimals
                }
                rewardPerSecond
            }
        }
        poolTokenAddress
        totalBalance
        relicCount
        allocPoint
        levels {
            level
            balance
            allocationPoints
            requiredMaturity
        }
    }
`;
export const ReliquaryRelicSnapshotFragmentDoc = gql`
    fragment ReliquaryRelicSnapshot on DailyRelicSnapshot {
        id
        relicId
        snapshotTimestamp
        userAddress
        poolId
        balance
        entryTimestamp
        level
    }
`;
export const ReliquaryFarmSnapshotFragmentDoc = gql`
    fragment ReliquaryFarmSnapshot on DailyPoolSnapshot {
        id
        farmId: poolId
        snapshotTimestamp
        totalBalance
        dailyDeposited
        dailyWithdrawn
        relicCount
    }
`;
export const ReliquaryDocument = gql`
    query Reliquary($id: ID!, $block: Block_height) {
        reliquary(id: $id, block: $block) {
            id
            emissionToken {
                id
                address
                name
                symbol
                decimals
            }
            totalAllocPoint
            poolCount
            relicCount
            emissionCurve {
                id
                address
                rewardPerSecond
            }
        }
    }
`;
export const ReliquaryRelicsDocument = gql`
    query ReliquaryRelics(
        $skip: Int
        $first: Int
        $orderBy: Relic_orderBy
        $orderDirection: OrderDirection
        $where: Relic_filter
        $block: Block_height
    ) {
        relics(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...ReliquaryRelic
        }
    }
    ${ReliquaryRelicFragmentDoc}
`;
export const ReliquaryUsersDocument = gql`
    query ReliquaryUsers(
        $skip: Int
        $first: Int
        $orderBy: User_orderBy
        $orderDirection: OrderDirection
        $where: User_filter
        $block: Block_height
    ) {
        reliquaryUsers: users(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...ReliquaryUser
        }
    }
    ${ReliquaryUserFragmentDoc}
`;
export const ReliquaryPoolsDocument = gql`
    query ReliquaryPools(
        $skip: Int
        $first: Int
        $orderBy: Pool_orderBy
        $orderDirection: OrderDirection
        $where: Pool_filter
        $block: Block_height
    ) {
        farms: pools(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...ReliquaryFarm
        }
    }
    ${ReliquaryFarmFragmentDoc}
`;
export const ReliquaryFarmSnapshotsDocument = gql`
    query ReliquaryFarmSnapshots(
        $skip: Int
        $first: Int
        $orderBy: DailyPoolSnapshot_orderBy
        $orderDirection: OrderDirection
        $where: DailyPoolSnapshot_filter
        $block: Block_height
    ) {
        farmSnapshots: dailyPoolSnapshots(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...ReliquaryFarmSnapshot
        }
    }
    ${ReliquaryFarmSnapshotFragmentDoc}
`;
export const ReliquaryRelicSnapshotsDocument = gql`
    query ReliquaryRelicSnapshots(
        $skip: Int
        $first: Int
        $orderBy: DailyRelicSnapshot_orderBy
        $orderDirection: OrderDirection
        $where: DailyRelicSnapshot_filter
        $block: Block_height
    ) {
        relicSnapshots: dailyRelicSnapshots(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...ReliquaryRelicSnapshot
        }
    }
    ${ReliquaryRelicSnapshotFragmentDoc}
`;
export const ReliquaryPoolLevelsDocument = gql`
    query ReliquaryPoolLevels(
        $skip: Int
        $first: Int
        $orderBy: PoolLevel_orderBy
        $orderDirection: OrderDirection
        $where: PoolLevel_filter
        $block: Block_height
    ) {
        poolLevels(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            id
            level
            balance
            requiredMaturity
            allocationPoints
        }
    }
`;
export const ReliquaryGetMetaDocument = gql`
    query ReliquaryGetMeta {
        meta: _meta {
            block {
                number
            }
            deployment
            hasIndexingErrors
        }
    }
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
    operationType?: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        Reliquary(
            variables: ReliquaryQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ReliquaryQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ReliquaryQuery>(ReliquaryDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'Reliquary',
                'query',
            );
        },
        ReliquaryRelics(
            variables?: ReliquaryRelicsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ReliquaryRelicsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ReliquaryRelicsQuery>(ReliquaryRelicsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'ReliquaryRelics',
                'query',
            );
        },
        ReliquaryUsers(
            variables?: ReliquaryUsersQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ReliquaryUsersQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ReliquaryUsersQuery>(ReliquaryUsersDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'ReliquaryUsers',
                'query',
            );
        },
        ReliquaryPools(
            variables?: ReliquaryPoolsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ReliquaryPoolsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ReliquaryPoolsQuery>(ReliquaryPoolsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'ReliquaryPools',
                'query',
            );
        },
        ReliquaryFarmSnapshots(
            variables?: ReliquaryFarmSnapshotsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ReliquaryFarmSnapshotsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ReliquaryFarmSnapshotsQuery>(ReliquaryFarmSnapshotsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'ReliquaryFarmSnapshots',
                'query',
            );
        },
        ReliquaryRelicSnapshots(
            variables?: ReliquaryRelicSnapshotsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ReliquaryRelicSnapshotsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ReliquaryRelicSnapshotsQuery>(ReliquaryRelicSnapshotsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'ReliquaryRelicSnapshots',
                'query',
            );
        },
        ReliquaryPoolLevels(
            variables?: ReliquaryPoolLevelsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ReliquaryPoolLevelsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ReliquaryPoolLevelsQuery>(ReliquaryPoolLevelsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'ReliquaryPoolLevels',
                'query',
            );
        },
        ReliquaryGetMeta(
            variables?: ReliquaryGetMetaQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ReliquaryGetMetaQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ReliquaryGetMetaQuery>(ReliquaryGetMetaDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'ReliquaryGetMeta',
                'query',
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
