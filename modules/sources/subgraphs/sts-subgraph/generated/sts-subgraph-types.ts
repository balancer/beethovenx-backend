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

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    asc = 'asc',
    desc = 'desc',
}

export type Query = {
    __typename?: 'Query';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    sonicStaking?: Maybe<SonicStaking>;
    sonicStakingSnapshot?: Maybe<SonicStakingSnapshot>;
    sonicStakingSnapshots: Array<SonicStakingSnapshot>;
    sonicStakings: Array<SonicStaking>;
    validator?: Maybe<Validator>;
    validators: Array<Validator>;
};

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type QuerySonicStakingArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerySonicStakingSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerySonicStakingSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<SonicStakingSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<SonicStakingSnapshot_Filter>;
};

export type QuerySonicStakingsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<SonicStaking_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<SonicStaking_Filter>;
};

export type QueryValidatorArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryValidatorsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Validator_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Validator_Filter>;
};

export type SonicStaking = {
    __typename?: 'SonicStaking';
    exchangeRate: Scalars['BigDecimal'];
    id: Scalars['Bytes'];
    totalAssets: Scalars['BigDecimal'];
    totalDelegated: Scalars['BigDecimal'];
    totalPool: Scalars['BigDecimal'];
    validators?: Maybe<Array<Validator>>;
};

export type SonicStakingValidatorsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Validator_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Validator_Filter>;
};

export type SonicStakingSnapshot = {
    __typename?: 'SonicStakingSnapshot';
    exchangeRate: Scalars['BigDecimal'];
    id: Scalars['Bytes'];
    snapshotTimestamp: Scalars['Int'];
    totalAssets: Scalars['BigDecimal'];
    totalDelegated: Scalars['BigDecimal'];
    totalPool: Scalars['BigDecimal'];
};

export type SonicStakingSnapshot_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<SonicStakingSnapshot_Filter>>>;
    exchangeRate?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_gt?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_gte?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    exchangeRate_lt?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_lte?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_not?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
    or?: InputMaybe<Array<InputMaybe<SonicStakingSnapshot_Filter>>>;
    snapshotTimestamp?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_gt?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_gte?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
    snapshotTimestamp_lt?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_lte?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_not?: InputMaybe<Scalars['Int']>;
    snapshotTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
    totalAssets?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalAssets_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_not?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalDelegated?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalDelegated_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_not?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalPool?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalPool_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_not?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};

export enum SonicStakingSnapshot_OrderBy {
    exchangeRate = 'exchangeRate',
    id = 'id',
    snapshotTimestamp = 'snapshotTimestamp',
    totalAssets = 'totalAssets',
    totalDelegated = 'totalDelegated',
    totalPool = 'totalPool',
}

export type SonicStaking_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<SonicStaking_Filter>>>;
    exchangeRate?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_gt?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_gte?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    exchangeRate_lt?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_lte?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_not?: InputMaybe<Scalars['BigDecimal']>;
    exchangeRate_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
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
    or?: InputMaybe<Array<InputMaybe<SonicStaking_Filter>>>;
    totalAssets?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalAssets_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_not?: InputMaybe<Scalars['BigDecimal']>;
    totalAssets_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalDelegated?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalDelegated_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_not?: InputMaybe<Scalars['BigDecimal']>;
    totalDelegated_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalPool?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_gt?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_gte?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    totalPool_lt?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_lte?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_not?: InputMaybe<Scalars['BigDecimal']>;
    totalPool_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    validators_?: InputMaybe<Validator_Filter>;
};

export enum SonicStaking_OrderBy {
    exchangeRate = 'exchangeRate',
    id = 'id',
    totalAssets = 'totalAssets',
    totalDelegated = 'totalDelegated',
    totalPool = 'totalPool',
    validators = 'validators',
}

export type Subscription = {
    __typename?: 'Subscription';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    sonicStaking?: Maybe<SonicStaking>;
    sonicStakingSnapshot?: Maybe<SonicStakingSnapshot>;
    sonicStakingSnapshots: Array<SonicStakingSnapshot>;
    sonicStakings: Array<SonicStaking>;
    validator?: Maybe<Validator>;
    validators: Array<Validator>;
};

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type SubscriptionSonicStakingArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionSonicStakingSnapshotArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionSonicStakingSnapshotsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<SonicStakingSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<SonicStakingSnapshot_Filter>;
};

export type SubscriptionSonicStakingsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<SonicStaking_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<SonicStaking_Filter>;
};

export type SubscriptionValidatorArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionValidatorsArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Validator_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Validator_Filter>;
};

export type Validator = {
    __typename?: 'Validator';
    amountAssetsDelegated: Scalars['BigDecimal'];
    id: Scalars['String'];
    sonicStaking: SonicStaking;
};

export type Validator_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    amountAssetsDelegated?: InputMaybe<Scalars['BigDecimal']>;
    amountAssetsDelegated_gt?: InputMaybe<Scalars['BigDecimal']>;
    amountAssetsDelegated_gte?: InputMaybe<Scalars['BigDecimal']>;
    amountAssetsDelegated_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    amountAssetsDelegated_lt?: InputMaybe<Scalars['BigDecimal']>;
    amountAssetsDelegated_lte?: InputMaybe<Scalars['BigDecimal']>;
    amountAssetsDelegated_not?: InputMaybe<Scalars['BigDecimal']>;
    amountAssetsDelegated_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
    and?: InputMaybe<Array<InputMaybe<Validator_Filter>>>;
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
    or?: InputMaybe<Array<InputMaybe<Validator_Filter>>>;
    sonicStaking?: InputMaybe<Scalars['String']>;
    sonicStaking_?: InputMaybe<SonicStaking_Filter>;
    sonicStaking_contains?: InputMaybe<Scalars['String']>;
    sonicStaking_contains_nocase?: InputMaybe<Scalars['String']>;
    sonicStaking_ends_with?: InputMaybe<Scalars['String']>;
    sonicStaking_ends_with_nocase?: InputMaybe<Scalars['String']>;
    sonicStaking_gt?: InputMaybe<Scalars['String']>;
    sonicStaking_gte?: InputMaybe<Scalars['String']>;
    sonicStaking_in?: InputMaybe<Array<Scalars['String']>>;
    sonicStaking_lt?: InputMaybe<Scalars['String']>;
    sonicStaking_lte?: InputMaybe<Scalars['String']>;
    sonicStaking_not?: InputMaybe<Scalars['String']>;
    sonicStaking_not_contains?: InputMaybe<Scalars['String']>;
    sonicStaking_not_contains_nocase?: InputMaybe<Scalars['String']>;
    sonicStaking_not_ends_with?: InputMaybe<Scalars['String']>;
    sonicStaking_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    sonicStaking_not_in?: InputMaybe<Array<Scalars['String']>>;
    sonicStaking_not_starts_with?: InputMaybe<Scalars['String']>;
    sonicStaking_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    sonicStaking_starts_with?: InputMaybe<Scalars['String']>;
    sonicStaking_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Validator_OrderBy {
    amountAssetsDelegated = 'amountAssetsDelegated',
    id = 'id',
    sonicStaking = 'sonicStaking',
    sonicStaking__exchangeRate = 'sonicStaking__exchangeRate',
    sonicStaking__id = 'sonicStaking__id',
    sonicStaking__totalAssets = 'sonicStaking__totalAssets',
    sonicStaking__totalDelegated = 'sonicStaking__totalDelegated',
    sonicStaking__totalPool = 'sonicStaking__totalPool',
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

export type ValidatorsQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Validator_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Validator_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type ValidatorsQuery = {
    __typename?: 'Query';
    validators: Array<{ __typename?: 'Validator'; id: string; amountAssetsDelegated: string }>;
};

export type SonicStakingSnapshotsQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<SonicStakingSnapshot_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<SonicStakingSnapshot_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type SonicStakingSnapshotsQuery = {
    __typename?: 'Query';
    sonicStakingSnapshots: Array<{
        __typename?: 'SonicStakingSnapshot';
        id: string;
        snapshotTimestamp: number;
        totalPool: string;
        totalAssets: string;
        totalDelegated: string;
        exchangeRate: string;
    }>;
};

export type ValidatorFragment = { __typename?: 'Validator'; id: string; amountAssetsDelegated: string };

export type SonicStakingSnapshotFragment = {
    __typename?: 'SonicStakingSnapshot';
    id: string;
    snapshotTimestamp: number;
    totalPool: string;
    totalAssets: string;
    totalDelegated: string;
    exchangeRate: string;
};

export const ValidatorFragmentDoc = gql`
    fragment Validator on Validator {
        id
        amountAssetsDelegated
    }
`;
export const SonicStakingSnapshotFragmentDoc = gql`
    fragment SonicStakingSnapshot on SonicStakingSnapshot {
        id
        snapshotTimestamp
        totalPool
        totalAssets
        totalDelegated
        exchangeRate
    }
`;
export const ValidatorsDocument = gql`
    query Validators(
        $skip: Int
        $first: Int
        $orderBy: Validator_orderBy
        $orderDirection: OrderDirection
        $where: Validator_filter
        $block: Block_height
    ) {
        validators(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...Validator
        }
    }
    ${ValidatorFragmentDoc}
`;
export const SonicStakingSnapshotsDocument = gql`
    query SonicStakingSnapshots(
        $skip: Int
        $first: Int
        $orderBy: SonicStakingSnapshot_orderBy
        $orderDirection: OrderDirection
        $where: SonicStakingSnapshot_filter
        $block: Block_height
    ) {
        sonicStakingSnapshots(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...SonicStakingSnapshot
        }
    }
    ${SonicStakingSnapshotFragmentDoc}
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
    operationType?: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        Validators(
            variables?: ValidatorsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<ValidatorsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<ValidatorsQuery>(ValidatorsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'Validators',
                'query',
            );
        },
        SonicStakingSnapshots(
            variables?: SonicStakingSnapshotsQueryVariables,
            requestHeaders?: Dom.RequestInit['headers'],
        ): Promise<SonicStakingSnapshotsQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<SonicStakingSnapshotsQuery>(SonicStakingSnapshotsDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'SonicStakingSnapshots',
                'query',
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
