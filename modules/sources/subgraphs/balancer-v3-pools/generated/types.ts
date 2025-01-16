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
    /** Address of the Factory contract */
    address: Scalars['Bytes'];
    /** Unique identifier for the Factory */
    id: Scalars['Bytes'];
    /** Pools created by this Factory */
    pools?: Maybe<Array<Pool>>;
    /** Type of pools this Factory creates */
    type: PoolType;
    /** Version number of the Factory */
    version: Scalars['Int'];
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
    type?: InputMaybe<PoolType>;
    type_in?: InputMaybe<Array<PoolType>>;
    type_not?: InputMaybe<PoolType>;
    type_not_in?: InputMaybe<Array<PoolType>>;
    version?: InputMaybe<Scalars['Int']>;
    version_gt?: InputMaybe<Scalars['Int']>;
    version_gte?: InputMaybe<Scalars['Int']>;
    version_in?: InputMaybe<Array<Scalars['Int']>>;
    version_lt?: InputMaybe<Scalars['Int']>;
    version_lte?: InputMaybe<Scalars['Int']>;
    version_not?: InputMaybe<Scalars['Int']>;
    version_not_in?: InputMaybe<Array<Scalars['Int']>>;
};

export enum Factory_OrderBy {
    Address = 'address',
    Id = 'id',
    Pools = 'pools',
    Type = 'type',
    Version = 'version',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export type Pool = {
    __typename?: 'Pool';
    /** Address of the Pool contract */
    address: Scalars['Bytes'];
    /** Factory that created this Pool */
    factory: Factory;
    /** Unique identifier for the Pool */
    id: Scalars['Bytes'];
    /** Parameters for Stable pools (null for other pool types) */
    stableParams?: Maybe<StableParams>;
    /** Parameters for Weighted pools (null for other pool types) */
    weightedParams?: Maybe<WeightedParams>;
};

export enum PoolType {
    Stable = 'Stable',
    Weighted = 'Weighted',
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
    or?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
    stableParams?: InputMaybe<Scalars['String']>;
    stableParams_?: InputMaybe<StableParams_Filter>;
    stableParams_contains?: InputMaybe<Scalars['String']>;
    stableParams_contains_nocase?: InputMaybe<Scalars['String']>;
    stableParams_ends_with?: InputMaybe<Scalars['String']>;
    stableParams_ends_with_nocase?: InputMaybe<Scalars['String']>;
    stableParams_gt?: InputMaybe<Scalars['String']>;
    stableParams_gte?: InputMaybe<Scalars['String']>;
    stableParams_in?: InputMaybe<Array<Scalars['String']>>;
    stableParams_lt?: InputMaybe<Scalars['String']>;
    stableParams_lte?: InputMaybe<Scalars['String']>;
    stableParams_not?: InputMaybe<Scalars['String']>;
    stableParams_not_contains?: InputMaybe<Scalars['String']>;
    stableParams_not_contains_nocase?: InputMaybe<Scalars['String']>;
    stableParams_not_ends_with?: InputMaybe<Scalars['String']>;
    stableParams_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    stableParams_not_in?: InputMaybe<Array<Scalars['String']>>;
    stableParams_not_starts_with?: InputMaybe<Scalars['String']>;
    stableParams_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    stableParams_starts_with?: InputMaybe<Scalars['String']>;
    stableParams_starts_with_nocase?: InputMaybe<Scalars['String']>;
    weightedParams?: InputMaybe<Scalars['String']>;
    weightedParams_?: InputMaybe<WeightedParams_Filter>;
    weightedParams_contains?: InputMaybe<Scalars['String']>;
    weightedParams_contains_nocase?: InputMaybe<Scalars['String']>;
    weightedParams_ends_with?: InputMaybe<Scalars['String']>;
    weightedParams_ends_with_nocase?: InputMaybe<Scalars['String']>;
    weightedParams_gt?: InputMaybe<Scalars['String']>;
    weightedParams_gte?: InputMaybe<Scalars['String']>;
    weightedParams_in?: InputMaybe<Array<Scalars['String']>>;
    weightedParams_lt?: InputMaybe<Scalars['String']>;
    weightedParams_lte?: InputMaybe<Scalars['String']>;
    weightedParams_not?: InputMaybe<Scalars['String']>;
    weightedParams_not_contains?: InputMaybe<Scalars['String']>;
    weightedParams_not_contains_nocase?: InputMaybe<Scalars['String']>;
    weightedParams_not_ends_with?: InputMaybe<Scalars['String']>;
    weightedParams_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    weightedParams_not_in?: InputMaybe<Array<Scalars['String']>>;
    weightedParams_not_starts_with?: InputMaybe<Scalars['String']>;
    weightedParams_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    weightedParams_starts_with?: InputMaybe<Scalars['String']>;
    weightedParams_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Pool_OrderBy {
    Address = 'address',
    Factory = 'factory',
    FactoryAddress = 'factory__address',
    FactoryId = 'factory__id',
    FactoryType = 'factory__type',
    FactoryVersion = 'factory__version',
    Id = 'id',
    StableParams = 'stableParams',
    StableParamsAmp = 'stableParams__amp',
    StableParamsId = 'stableParams__id',
    WeightedParams = 'weightedParams',
    WeightedParamsId = 'weightedParams__id',
}

export type Query = {
    __typename?: 'Query';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    factories: Array<Factory>;
    factory?: Maybe<Factory>;
    pool?: Maybe<Pool>;
    pools: Array<Pool>;
    stableParams?: Maybe<StableParams>;
    stableParams_collection: Array<StableParams>;
    weightedParams?: Maybe<WeightedParams>;
    weightedParams_collection: Array<WeightedParams>;
};

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>;
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

export type QueryPoolsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Pool_Filter>;
};

export type QueryStableParamsArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryStableParams_CollectionArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<StableParams_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<StableParams_Filter>;
};

export type QueryWeightedParamsArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryWeightedParams_CollectionArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<WeightedParams_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<WeightedParams_Filter>;
};

export type StableParams = {
    __typename?: 'StableParams';
    /** Amplification parameter for Stable Pools */
    amp: Scalars['BigInt'];
    /** Unique identifier for the StablePoolParams */
    id: Scalars['Bytes'];
};

export type StableParams_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    amp?: InputMaybe<Scalars['BigInt']>;
    amp_gt?: InputMaybe<Scalars['BigInt']>;
    amp_gte?: InputMaybe<Scalars['BigInt']>;
    amp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    amp_lt?: InputMaybe<Scalars['BigInt']>;
    amp_lte?: InputMaybe<Scalars['BigInt']>;
    amp_not?: InputMaybe<Scalars['BigInt']>;
    amp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    and?: InputMaybe<Array<InputMaybe<StableParams_Filter>>>;
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
    or?: InputMaybe<Array<InputMaybe<StableParams_Filter>>>;
};

export enum StableParams_OrderBy {
    Amp = 'amp',
    Id = 'id',
}

export type Subscription = {
    __typename?: 'Subscription';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    factories: Array<Factory>;
    factory?: Maybe<Factory>;
    pool?: Maybe<Pool>;
    pools: Array<Pool>;
    stableParams?: Maybe<StableParams>;
    stableParams_collection: Array<StableParams>;
    weightedParams?: Maybe<WeightedParams>;
    weightedParams_collection: Array<WeightedParams>;
};

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>;
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

export type SubscriptionPoolsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Pool_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Pool_Filter>;
};

export type SubscriptionStableParamsArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionStableParams_CollectionArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<StableParams_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<StableParams_Filter>;
};

export type SubscriptionWeightedParamsArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionWeightedParams_CollectionArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<WeightedParams_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<WeightedParams_Filter>;
};

export type WeightedParams = {
    __typename?: 'WeightedParams';
    /** Unique identifier for the WeightedPoolParams */
    id: Scalars['Bytes'];
    /** Token weights for Weighted Pools */
    weights: Array<Scalars['BigDecimal']>;
};

export type WeightedParams_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<WeightedParams_Filter>>>;
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
    or?: InputMaybe<Array<InputMaybe<WeightedParams_Filter>>>;
    weights?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
    weights_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum WeightedParams_OrderBy {
    Id = 'id',
    Weights = 'weights',
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

export type FactoryFragment = {
    __typename?: 'Factory';
    id: string;
    type: PoolType;
    version: number;
    pools?: Array<{ __typename?: 'Pool'; id: string; address: string }> | null | undefined;
};

export type TypePoolFragment = {
    __typename?: 'Pool';
    id: string;
    address: string;
    factory: { __typename?: 'Factory'; id: string; type: PoolType; version: number };
    stableParams?: { __typename?: 'StableParams'; amp: string } | null | undefined;
    weightedParams?: { __typename?: 'WeightedParams'; weights: Array<string> } | null | undefined;
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
        address: string;
        factory: { __typename?: 'Factory'; id: string; type: PoolType; version: number };
        stableParams?: { __typename?: 'StableParams'; amp: string } | null | undefined;
        weightedParams?: { __typename?: 'WeightedParams'; weights: Array<string> } | null | undefined;
    }>;
};

export const FactoryFragmentDoc = gql`
    fragment Factory on Factory {
        id
        type
        version
        pools {
            id
            address
        }
    }
`;
export const TypePoolFragmentDoc = gql`
    fragment TypePool on Pool {
        id
        address
        factory {
            id
            type
            version
        }
        stableParams {
            amp
        }
        weightedParams {
            weights
        }
    }
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
            ...TypePool
        }
    }
    ${TypePoolFragmentDoc}
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
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
    };
}
export type Sdk = ReturnType<typeof getSdk>;
