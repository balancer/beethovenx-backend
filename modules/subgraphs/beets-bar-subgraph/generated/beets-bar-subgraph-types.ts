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
    Day = 'day',
    Hour = 'hour',
}

export type Bar = {
    __typename?: 'Bar';
    address: Scalars['Bytes'];
    block: Scalars['BigInt'];
    decimals: Scalars['Int'];
    fBeetsBurned: Scalars['BigDecimal'];
    fBeetsMinted: Scalars['BigDecimal'];
    id: Scalars['ID'];
    name: Scalars['String'];
    ratio: Scalars['BigDecimal'];
    sharedVestingTokenRevenue: Scalars['BigDecimal'];
    symbol: Scalars['String'];
    timestamp: Scalars['BigInt'];
    totalSupply: Scalars['BigDecimal'];
    users: Array<User>;
    vestingToken: Scalars['Bytes'];
    vestingTokenStaked: Scalars['BigDecimal'];
};

export type BarUsersArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<User_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<User_Filter>;
};

export type Bar_Filter = {
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
    and?: InputMaybe<Array<InputMaybe<Bar_Filter>>>;
    block?: InputMaybe<Scalars['BigInt']>;
    block_gt?: InputMaybe<Scalars['BigInt']>;
    block_gte?: InputMaybe<Scalars['BigInt']>;
    block_in?: InputMaybe<Array<Scalars['BigInt']>>;
    block_lt?: InputMaybe<Scalars['BigInt']>;
    block_lte?: InputMaybe<Scalars['BigInt']>;
    block_not?: InputMaybe<Scalars['BigInt']>;
    block_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    decimals?: InputMaybe<Scalars['Int']>;
    decimals_gt?: InputMaybe<Scalars['Int']>;
    decimals_gte?: InputMaybe<Scalars['Int']>;
    decimals_in?: InputMaybe<Array<Scalars['Int']>>;
    decimals_lt?: InputMaybe<Scalars['Int']>;
    decimals_lte?: InputMaybe<Scalars['Int']>;
    decimals_not?: InputMaybe<Scalars['Int']>;
    decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
    fBeetsBurned?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsBurned_gt?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsBurned_gte?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsBurned_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    fBeetsBurned_lt?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsBurned_lte?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsBurned_not?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsBurned_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    fBeetsMinted?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsMinted_gt?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsMinted_gte?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsMinted_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    fBeetsMinted_lt?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsMinted_lte?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsMinted_not?: InputMaybe<Scalars['BigDecimal']>;
    fBeetsMinted_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    id?: InputMaybe<Scalars['ID']>;
    id_gt?: InputMaybe<Scalars['ID']>;
    id_gte?: InputMaybe<Scalars['ID']>;
    id_in?: InputMaybe<Array<Scalars['ID']>>;
    id_lt?: InputMaybe<Scalars['ID']>;
    id_lte?: InputMaybe<Scalars['ID']>;
    id_not?: InputMaybe<Scalars['ID']>;
    id_not_in?: InputMaybe<Array<Scalars['ID']>>;
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
    or?: InputMaybe<Array<InputMaybe<Bar_Filter>>>;
    ratio?: InputMaybe<Scalars['BigDecimal']>;
    ratio_gt?: InputMaybe<Scalars['BigDecimal']>;
    ratio_gte?: InputMaybe<Scalars['BigDecimal']>;
    ratio_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    ratio_lt?: InputMaybe<Scalars['BigDecimal']>;
    ratio_lte?: InputMaybe<Scalars['BigDecimal']>;
    ratio_not?: InputMaybe<Scalars['BigDecimal']>;
    ratio_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    sharedVestingTokenRevenue?: InputMaybe<Scalars['BigDecimal']>;
    sharedVestingTokenRevenue_gt?: InputMaybe<Scalars['BigDecimal']>;
    sharedVestingTokenRevenue_gte?: InputMaybe<Scalars['BigDecimal']>;
    sharedVestingTokenRevenue_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    sharedVestingTokenRevenue_lt?: InputMaybe<Scalars['BigDecimal']>;
    sharedVestingTokenRevenue_lte?: InputMaybe<Scalars['BigDecimal']>;
    sharedVestingTokenRevenue_not?: InputMaybe<Scalars['BigDecimal']>;
    sharedVestingTokenRevenue_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
    timestamp?: InputMaybe<Scalars['BigInt']>;
    timestamp_gt?: InputMaybe<Scalars['BigInt']>;
    timestamp_gte?: InputMaybe<Scalars['BigInt']>;
    timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    timestamp_lt?: InputMaybe<Scalars['BigInt']>;
    timestamp_lte?: InputMaybe<Scalars['BigInt']>;
    timestamp_not?: InputMaybe<Scalars['BigInt']>;
    timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    totalSupply?: InputMaybe<Scalars['BigDecimal']>;
    totalSupply_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalSupply_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalSupply_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalSupply_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalSupply_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalSupply_not?: InputMaybe<Scalars['BigDecimal']>;
    totalSupply_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    users_?: InputMaybe<User_Filter>;
    vestingToken?: InputMaybe<Scalars['Bytes']>;
    vestingTokenStaked?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenStaked_gt?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenStaked_gte?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenStaked_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    vestingTokenStaked_lt?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenStaked_lte?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenStaked_not?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenStaked_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    vestingToken_contains?: InputMaybe<Scalars['Bytes']>;
    vestingToken_gt?: InputMaybe<Scalars['Bytes']>;
    vestingToken_gte?: InputMaybe<Scalars['Bytes']>;
    vestingToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
    vestingToken_lt?: InputMaybe<Scalars['Bytes']>;
    vestingToken_lte?: InputMaybe<Scalars['Bytes']>;
    vestingToken_not?: InputMaybe<Scalars['Bytes']>;
    vestingToken_not_contains?: InputMaybe<Scalars['Bytes']>;
    vestingToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Bar_OrderBy {
    Address = 'address',
    Block = 'block',
    Decimals = 'decimals',
    FBeetsBurned = 'fBeetsBurned',
    FBeetsMinted = 'fBeetsMinted',
    Id = 'id',
    Name = 'name',
    Ratio = 'ratio',
    SharedVestingTokenRevenue = 'sharedVestingTokenRevenue',
    Symbol = 'symbol',
    Timestamp = 'timestamp',
    TotalSupply = 'totalSupply',
    Users = 'users',
    VestingToken = 'vestingToken',
    VestingTokenStaked = 'vestingTokenStaked',
}

export type BlockChangedFilter = {
    number_gte: Scalars['Int'];
};

export type Block_Height = {
    hash?: InputMaybe<Scalars['Bytes']>;
    number?: InputMaybe<Scalars['Int']>;
    number_gte?: InputMaybe<Scalars['Int']>;
};

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export type Query = {
    __typename?: 'Query';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    bar?: Maybe<Bar>;
    bars: Array<Bar>;
    user?: Maybe<User>;
    users: Array<User>;
};

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type QueryBarArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryBarsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Bar_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Bar_Filter>;
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
    bar?: Maybe<Bar>;
    bars: Array<Bar>;
    user?: Maybe<User>;
    users: Array<User>;
};

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type SubscriptionBarArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionBarsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Bar_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Bar_Filter>;
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

export type User = {
    __typename?: 'User';
    address: Scalars['Bytes'];
    bar?: Maybe<Bar>;
    block: Scalars['BigInt'];
    fBeets: Scalars['BigDecimal'];
    id: Scalars['ID'];
    timestamp: Scalars['BigInt'];
    vestingTokenHarvested: Scalars['BigDecimal'];
    vestingTokenIn: Scalars['BigDecimal'];
    vestingTokenOut: Scalars['BigDecimal'];
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
    bar?: InputMaybe<Scalars['String']>;
    bar_?: InputMaybe<Bar_Filter>;
    bar_contains?: InputMaybe<Scalars['String']>;
    bar_contains_nocase?: InputMaybe<Scalars['String']>;
    bar_ends_with?: InputMaybe<Scalars['String']>;
    bar_ends_with_nocase?: InputMaybe<Scalars['String']>;
    bar_gt?: InputMaybe<Scalars['String']>;
    bar_gte?: InputMaybe<Scalars['String']>;
    bar_in?: InputMaybe<Array<Scalars['String']>>;
    bar_lt?: InputMaybe<Scalars['String']>;
    bar_lte?: InputMaybe<Scalars['String']>;
    bar_not?: InputMaybe<Scalars['String']>;
    bar_not_contains?: InputMaybe<Scalars['String']>;
    bar_not_contains_nocase?: InputMaybe<Scalars['String']>;
    bar_not_ends_with?: InputMaybe<Scalars['String']>;
    bar_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    bar_not_in?: InputMaybe<Array<Scalars['String']>>;
    bar_not_starts_with?: InputMaybe<Scalars['String']>;
    bar_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    bar_starts_with?: InputMaybe<Scalars['String']>;
    bar_starts_with_nocase?: InputMaybe<Scalars['String']>;
    block?: InputMaybe<Scalars['BigInt']>;
    block_gt?: InputMaybe<Scalars['BigInt']>;
    block_gte?: InputMaybe<Scalars['BigInt']>;
    block_in?: InputMaybe<Array<Scalars['BigInt']>>;
    block_lt?: InputMaybe<Scalars['BigInt']>;
    block_lte?: InputMaybe<Scalars['BigInt']>;
    block_not?: InputMaybe<Scalars['BigInt']>;
    block_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    fBeets?: InputMaybe<Scalars['BigDecimal']>;
    fBeets_gt?: InputMaybe<Scalars['BigDecimal']>;
    fBeets_gte?: InputMaybe<Scalars['BigDecimal']>;
    fBeets_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    fBeets_lt?: InputMaybe<Scalars['BigDecimal']>;
    fBeets_lte?: InputMaybe<Scalars['BigDecimal']>;
    fBeets_not?: InputMaybe<Scalars['BigDecimal']>;
    fBeets_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    id?: InputMaybe<Scalars['ID']>;
    id_gt?: InputMaybe<Scalars['ID']>;
    id_gte?: InputMaybe<Scalars['ID']>;
    id_in?: InputMaybe<Array<Scalars['ID']>>;
    id_lt?: InputMaybe<Scalars['ID']>;
    id_lte?: InputMaybe<Scalars['ID']>;
    id_not?: InputMaybe<Scalars['ID']>;
    id_not_in?: InputMaybe<Array<Scalars['ID']>>;
    or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
    timestamp?: InputMaybe<Scalars['BigInt']>;
    timestamp_gt?: InputMaybe<Scalars['BigInt']>;
    timestamp_gte?: InputMaybe<Scalars['BigInt']>;
    timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    timestamp_lt?: InputMaybe<Scalars['BigInt']>;
    timestamp_lte?: InputMaybe<Scalars['BigInt']>;
    timestamp_not?: InputMaybe<Scalars['BigInt']>;
    timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    vestingTokenHarvested?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenHarvested_gt?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenHarvested_gte?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenHarvested_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    vestingTokenHarvested_lt?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenHarvested_lte?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenHarvested_not?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenHarvested_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    vestingTokenIn?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenIn_gt?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenIn_gte?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenIn_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    vestingTokenIn_lt?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenIn_lte?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenIn_not?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenIn_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    vestingTokenOut?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenOut_gt?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenOut_gte?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenOut_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    vestingTokenOut_lt?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenOut_lte?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenOut_not?: InputMaybe<Scalars['BigDecimal']>;
    vestingTokenOut_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum User_OrderBy {
    Address = 'address',
    Bar = 'bar',
    BarAddress = 'bar__address',
    BarBlock = 'bar__block',
    BarDecimals = 'bar__decimals',
    BarFBeetsBurned = 'bar__fBeetsBurned',
    BarFBeetsMinted = 'bar__fBeetsMinted',
    BarId = 'bar__id',
    BarName = 'bar__name',
    BarRatio = 'bar__ratio',
    BarSharedVestingTokenRevenue = 'bar__sharedVestingTokenRevenue',
    BarSymbol = 'bar__symbol',
    BarTimestamp = 'bar__timestamp',
    BarTotalSupply = 'bar__totalSupply',
    BarVestingToken = 'bar__vestingToken',
    BarVestingTokenStaked = 'bar__vestingTokenStaked',
    Block = 'block',
    FBeets = 'fBeets',
    Id = 'id',
    Timestamp = 'timestamp',
    VestingTokenHarvested = 'vestingTokenHarvested',
    VestingTokenIn = 'vestingTokenIn',
    VestingTokenOut = 'vestingTokenOut',
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

export type GetBeetsBarQueryVariables = Exact<{
    id: Scalars['ID'];
    block?: Maybe<Block_Height>;
}>;

export type GetBeetsBarQuery = {
    __typename?: 'Query';
    bar?:
        | {
              __typename?: 'Bar';
              id: string;
              address: string;
              block: string;
              decimals: number;
              fBeetsBurned: string;
              fBeetsMinted: string;
              name: string;
              ratio: string;
              sharedVestingTokenRevenue: string;
              symbol: string;
              timestamp: string;
              totalSupply: string;
              vestingToken: string;
              vestingTokenStaked: string;
          }
        | null
        | undefined;
};

export type GetBeetsBarUserQueryVariables = Exact<{
    id: Scalars['ID'];
    block?: Maybe<Block_Height>;
}>;

export type GetBeetsBarUserQuery = {
    __typename?: 'Query';
    user?:
        | {
              __typename?: 'User';
              id: string;
              address: string;
              block: string;
              fBeets: string;
              timestamp: string;
              vestingTokenHarvested: string;
              vestingTokenIn: string;
              vestingTokenOut: string;
          }
        | null
        | undefined;
};

export type BeetsBarUsersQueryVariables = Exact<{
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<User_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<User_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type BeetsBarUsersQuery = {
    __typename?: 'Query';
    users: Array<{
        __typename?: 'User';
        id: string;
        address: string;
        block: string;
        fBeets: string;
        timestamp: string;
        vestingTokenHarvested: string;
        vestingTokenIn: string;
        vestingTokenOut: string;
    }>;
};

export type BeetsBarFragment = {
    __typename?: 'Bar';
    id: string;
    address: string;
    block: string;
    decimals: number;
    fBeetsBurned: string;
    fBeetsMinted: string;
    name: string;
    ratio: string;
    sharedVestingTokenRevenue: string;
    symbol: string;
    timestamp: string;
    totalSupply: string;
    vestingToken: string;
    vestingTokenStaked: string;
};

export type BeetsBarUserFragment = {
    __typename?: 'User';
    id: string;
    address: string;
    block: string;
    fBeets: string;
    timestamp: string;
    vestingTokenHarvested: string;
    vestingTokenIn: string;
    vestingTokenOut: string;
};

export type BeetsBarPortfolioDataQueryVariables = Exact<{
    barId: Scalars['ID'];
    userAddress: Scalars['ID'];
    previousBlockNumber: Scalars['Int'];
}>;

export type BeetsBarPortfolioDataQuery = {
    __typename?: 'Query';
    beetsBar?:
        | {
              __typename?: 'Bar';
              id: string;
              address: string;
              block: string;
              decimals: number;
              fBeetsBurned: string;
              fBeetsMinted: string;
              name: string;
              ratio: string;
              sharedVestingTokenRevenue: string;
              symbol: string;
              timestamp: string;
              totalSupply: string;
              vestingToken: string;
              vestingTokenStaked: string;
          }
        | null
        | undefined;
    previousBeetsBar?:
        | {
              __typename?: 'Bar';
              id: string;
              address: string;
              block: string;
              decimals: number;
              fBeetsBurned: string;
              fBeetsMinted: string;
              name: string;
              ratio: string;
              sharedVestingTokenRevenue: string;
              symbol: string;
              timestamp: string;
              totalSupply: string;
              vestingToken: string;
              vestingTokenStaked: string;
          }
        | null
        | undefined;
    beetsBarUser?:
        | {
              __typename?: 'User';
              id: string;
              address: string;
              block: string;
              fBeets: string;
              timestamp: string;
              vestingTokenHarvested: string;
              vestingTokenIn: string;
              vestingTokenOut: string;
          }
        | null
        | undefined;
    previousBeetsBarUser?:
        | {
              __typename?: 'User';
              id: string;
              address: string;
              block: string;
              fBeets: string;
              timestamp: string;
              vestingTokenHarvested: string;
              vestingTokenIn: string;
              vestingTokenOut: string;
          }
        | null
        | undefined;
};

export type BeetsBarDataQueryVariables = Exact<{
    barId: Scalars['ID'];
    previousBlockNumber: Scalars['Int'];
}>;

export type BeetsBarDataQuery = {
    __typename?: 'Query';
    beetsBar?:
        | {
              __typename?: 'Bar';
              id: string;
              address: string;
              block: string;
              decimals: number;
              fBeetsBurned: string;
              fBeetsMinted: string;
              name: string;
              ratio: string;
              sharedVestingTokenRevenue: string;
              symbol: string;
              timestamp: string;
              totalSupply: string;
              vestingToken: string;
              vestingTokenStaked: string;
          }
        | null
        | undefined;
    previousBeetsBar?:
        | {
              __typename?: 'Bar';
              id: string;
              address: string;
              block: string;
              decimals: number;
              fBeetsBurned: string;
              fBeetsMinted: string;
              name: string;
              ratio: string;
              sharedVestingTokenRevenue: string;
              symbol: string;
              timestamp: string;
              totalSupply: string;
              vestingToken: string;
              vestingTokenStaked: string;
          }
        | null
        | undefined;
};

export type BeetsBarGetMetaQueryVariables = Exact<{ [key: string]: never }>;

export type BeetsBarGetMetaQuery = {
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

export const BeetsBarFragmentDoc = gql`
    fragment BeetsBar on Bar {
        id
        address
        block
        decimals
        fBeetsBurned
        fBeetsMinted
        name
        ratio
        sharedVestingTokenRevenue
        symbol
        timestamp
        totalSupply
        vestingToken
        vestingTokenStaked
    }
`;
export const BeetsBarUserFragmentDoc = gql`
    fragment BeetsBarUser on User {
        id
        address
        block
        fBeets
        timestamp
        vestingTokenHarvested
        vestingTokenIn
        vestingTokenOut
    }
`;
export const GetBeetsBarDocument = gql`
    query GetBeetsBar($id: ID!, $block: Block_height) {
        bar(id: $id, block: $block) {
            ...BeetsBar
        }
    }
    ${BeetsBarFragmentDoc}
`;
export const GetBeetsBarUserDocument = gql`
    query GetBeetsBarUser($id: ID!, $block: Block_height) {
        user(id: $id, block: $block) {
            ...BeetsBarUser
        }
    }
    ${BeetsBarUserFragmentDoc}
`;
export const BeetsBarUsersDocument = gql`
    query BeetsBarUsers(
        $skip: Int
        $first: Int
        $orderBy: User_orderBy
        $orderDirection: OrderDirection
        $where: User_filter
        $block: Block_height
    ) {
        users(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...BeetsBarUser
        }
    }
    ${BeetsBarUserFragmentDoc}
`;
export const BeetsBarPortfolioDataDocument = gql`
    query BeetsBarPortfolioData($barId: ID!, $userAddress: ID!, $previousBlockNumber: Int!) {
        beetsBar: bar(id: $barId) {
            ...BeetsBar
        }
        previousBeetsBar: bar(id: $barId, block: { number: $previousBlockNumber }) {
            ...BeetsBar
        }
        beetsBarUser: user(id: $userAddress) {
            ...BeetsBarUser
        }
        previousBeetsBarUser: user(id: $userAddress, block: { number: $previousBlockNumber }) {
            ...BeetsBarUser
        }
    }
    ${BeetsBarFragmentDoc}
    ${BeetsBarUserFragmentDoc}
`;
export const BeetsBarDataDocument = gql`
    query BeetsBarData($barId: ID!, $previousBlockNumber: Int!) {
        beetsBar: bar(id: $barId) {
            ...BeetsBar
        }
        previousBeetsBar: bar(id: $barId, block: { number: $previousBlockNumber }) {
            ...BeetsBar
        }
    }
    ${BeetsBarFragmentDoc}
`;
export const BeetsBarGetMetaDocument = gql`
    query BeetsBarGetMeta {
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
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        GetBeetsBar(
            variables: GetBeetsBarQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetBeetsBarQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetBeetsBarQuery>(GetBeetsBarDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'GetBeetsBar',
            );
        },
        GetBeetsBarUser(
            variables: GetBeetsBarUserQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<GetBeetsBarUserQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetBeetsBarUserQuery>(GetBeetsBarUserDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'GetBeetsBarUser',
            );
        },
        BeetsBarUsers(
            variables?: BeetsBarUsersQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<BeetsBarUsersQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<BeetsBarUsersQuery>(BeetsBarUsersDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'BeetsBarUsers',
            );
        },
        BeetsBarPortfolioData(
            variables: BeetsBarPortfolioDataQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<BeetsBarPortfolioDataQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<BeetsBarPortfolioDataQuery>(BeetsBarPortfolioDataDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'BeetsBarPortfolioData',
            );
        },
        BeetsBarData(
            variables: BeetsBarDataQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<BeetsBarDataQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<BeetsBarDataQuery>(BeetsBarDataDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'BeetsBarData',
            );
        },
        BeetsBarGetMeta(
            variables?: BeetsBarGetMetaQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<BeetsBarGetMetaQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<BeetsBarGetMetaQuery>(BeetsBarGetMetaDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'BeetsBarGetMeta',
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
