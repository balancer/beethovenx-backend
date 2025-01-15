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

export type Block = {
    __typename?: 'Block';
    author?: Maybe<Scalars['String']>;
    difficulty?: Maybe<Scalars['BigInt']>;
    gasLimit?: Maybe<Scalars['BigInt']>;
    gasUsed?: Maybe<Scalars['BigInt']>;
    id: Scalars['ID'];
    number: Scalars['BigInt'];
    parentHash?: Maybe<Scalars['String']>;
    receiptsRoot?: Maybe<Scalars['String']>;
    size?: Maybe<Scalars['BigInt']>;
    stateRoot?: Maybe<Scalars['String']>;
    timestamp: Scalars['BigInt'];
    totalDifficulty?: Maybe<Scalars['BigInt']>;
    transactionsRoot?: Maybe<Scalars['String']>;
    unclesHash?: Maybe<Scalars['String']>;
};

export type BlockChangedFilter = {
    number_gte: Scalars['Int'];
};

export type Block_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<Block_Filter>>>;
    author?: InputMaybe<Scalars['String']>;
    author_contains?: InputMaybe<Scalars['String']>;
    author_contains_nocase?: InputMaybe<Scalars['String']>;
    author_ends_with?: InputMaybe<Scalars['String']>;
    author_ends_with_nocase?: InputMaybe<Scalars['String']>;
    author_gt?: InputMaybe<Scalars['String']>;
    author_gte?: InputMaybe<Scalars['String']>;
    author_in?: InputMaybe<Array<Scalars['String']>>;
    author_lt?: InputMaybe<Scalars['String']>;
    author_lte?: InputMaybe<Scalars['String']>;
    author_not?: InputMaybe<Scalars['String']>;
    author_not_contains?: InputMaybe<Scalars['String']>;
    author_not_contains_nocase?: InputMaybe<Scalars['String']>;
    author_not_ends_with?: InputMaybe<Scalars['String']>;
    author_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    author_not_in?: InputMaybe<Array<Scalars['String']>>;
    author_not_starts_with?: InputMaybe<Scalars['String']>;
    author_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    author_starts_with?: InputMaybe<Scalars['String']>;
    author_starts_with_nocase?: InputMaybe<Scalars['String']>;
    difficulty?: InputMaybe<Scalars['BigInt']>;
    difficulty_gt?: InputMaybe<Scalars['BigInt']>;
    difficulty_gte?: InputMaybe<Scalars['BigInt']>;
    difficulty_in?: InputMaybe<Array<Scalars['BigInt']>>;
    difficulty_lt?: InputMaybe<Scalars['BigInt']>;
    difficulty_lte?: InputMaybe<Scalars['BigInt']>;
    difficulty_not?: InputMaybe<Scalars['BigInt']>;
    difficulty_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    gasLimit?: InputMaybe<Scalars['BigInt']>;
    gasLimit_gt?: InputMaybe<Scalars['BigInt']>;
    gasLimit_gte?: InputMaybe<Scalars['BigInt']>;
    gasLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
    gasLimit_lt?: InputMaybe<Scalars['BigInt']>;
    gasLimit_lte?: InputMaybe<Scalars['BigInt']>;
    gasLimit_not?: InputMaybe<Scalars['BigInt']>;
    gasLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    gasUsed?: InputMaybe<Scalars['BigInt']>;
    gasUsed_gt?: InputMaybe<Scalars['BigInt']>;
    gasUsed_gte?: InputMaybe<Scalars['BigInt']>;
    gasUsed_in?: InputMaybe<Array<Scalars['BigInt']>>;
    gasUsed_lt?: InputMaybe<Scalars['BigInt']>;
    gasUsed_lte?: InputMaybe<Scalars['BigInt']>;
    gasUsed_not?: InputMaybe<Scalars['BigInt']>;
    gasUsed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    id?: InputMaybe<Scalars['ID']>;
    id_gt?: InputMaybe<Scalars['ID']>;
    id_gte?: InputMaybe<Scalars['ID']>;
    id_in?: InputMaybe<Array<Scalars['ID']>>;
    id_lt?: InputMaybe<Scalars['ID']>;
    id_lte?: InputMaybe<Scalars['ID']>;
    id_not?: InputMaybe<Scalars['ID']>;
    id_not_in?: InputMaybe<Array<Scalars['ID']>>;
    number?: InputMaybe<Scalars['BigInt']>;
    number_gt?: InputMaybe<Scalars['BigInt']>;
    number_gte?: InputMaybe<Scalars['BigInt']>;
    number_in?: InputMaybe<Array<Scalars['BigInt']>>;
    number_lt?: InputMaybe<Scalars['BigInt']>;
    number_lte?: InputMaybe<Scalars['BigInt']>;
    number_not?: InputMaybe<Scalars['BigInt']>;
    number_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    or?: InputMaybe<Array<InputMaybe<Block_Filter>>>;
    parentHash?: InputMaybe<Scalars['String']>;
    parentHash_contains?: InputMaybe<Scalars['String']>;
    parentHash_contains_nocase?: InputMaybe<Scalars['String']>;
    parentHash_ends_with?: InputMaybe<Scalars['String']>;
    parentHash_ends_with_nocase?: InputMaybe<Scalars['String']>;
    parentHash_gt?: InputMaybe<Scalars['String']>;
    parentHash_gte?: InputMaybe<Scalars['String']>;
    parentHash_in?: InputMaybe<Array<Scalars['String']>>;
    parentHash_lt?: InputMaybe<Scalars['String']>;
    parentHash_lte?: InputMaybe<Scalars['String']>;
    parentHash_not?: InputMaybe<Scalars['String']>;
    parentHash_not_contains?: InputMaybe<Scalars['String']>;
    parentHash_not_contains_nocase?: InputMaybe<Scalars['String']>;
    parentHash_not_ends_with?: InputMaybe<Scalars['String']>;
    parentHash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    parentHash_not_in?: InputMaybe<Array<Scalars['String']>>;
    parentHash_not_starts_with?: InputMaybe<Scalars['String']>;
    parentHash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    parentHash_starts_with?: InputMaybe<Scalars['String']>;
    parentHash_starts_with_nocase?: InputMaybe<Scalars['String']>;
    receiptsRoot?: InputMaybe<Scalars['String']>;
    receiptsRoot_contains?: InputMaybe<Scalars['String']>;
    receiptsRoot_contains_nocase?: InputMaybe<Scalars['String']>;
    receiptsRoot_ends_with?: InputMaybe<Scalars['String']>;
    receiptsRoot_ends_with_nocase?: InputMaybe<Scalars['String']>;
    receiptsRoot_gt?: InputMaybe<Scalars['String']>;
    receiptsRoot_gte?: InputMaybe<Scalars['String']>;
    receiptsRoot_in?: InputMaybe<Array<Scalars['String']>>;
    receiptsRoot_lt?: InputMaybe<Scalars['String']>;
    receiptsRoot_lte?: InputMaybe<Scalars['String']>;
    receiptsRoot_not?: InputMaybe<Scalars['String']>;
    receiptsRoot_not_contains?: InputMaybe<Scalars['String']>;
    receiptsRoot_not_contains_nocase?: InputMaybe<Scalars['String']>;
    receiptsRoot_not_ends_with?: InputMaybe<Scalars['String']>;
    receiptsRoot_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    receiptsRoot_not_in?: InputMaybe<Array<Scalars['String']>>;
    receiptsRoot_not_starts_with?: InputMaybe<Scalars['String']>;
    receiptsRoot_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    receiptsRoot_starts_with?: InputMaybe<Scalars['String']>;
    receiptsRoot_starts_with_nocase?: InputMaybe<Scalars['String']>;
    size?: InputMaybe<Scalars['BigInt']>;
    size_gt?: InputMaybe<Scalars['BigInt']>;
    size_gte?: InputMaybe<Scalars['BigInt']>;
    size_in?: InputMaybe<Array<Scalars['BigInt']>>;
    size_lt?: InputMaybe<Scalars['BigInt']>;
    size_lte?: InputMaybe<Scalars['BigInt']>;
    size_not?: InputMaybe<Scalars['BigInt']>;
    size_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    stateRoot?: InputMaybe<Scalars['String']>;
    stateRoot_contains?: InputMaybe<Scalars['String']>;
    stateRoot_contains_nocase?: InputMaybe<Scalars['String']>;
    stateRoot_ends_with?: InputMaybe<Scalars['String']>;
    stateRoot_ends_with_nocase?: InputMaybe<Scalars['String']>;
    stateRoot_gt?: InputMaybe<Scalars['String']>;
    stateRoot_gte?: InputMaybe<Scalars['String']>;
    stateRoot_in?: InputMaybe<Array<Scalars['String']>>;
    stateRoot_lt?: InputMaybe<Scalars['String']>;
    stateRoot_lte?: InputMaybe<Scalars['String']>;
    stateRoot_not?: InputMaybe<Scalars['String']>;
    stateRoot_not_contains?: InputMaybe<Scalars['String']>;
    stateRoot_not_contains_nocase?: InputMaybe<Scalars['String']>;
    stateRoot_not_ends_with?: InputMaybe<Scalars['String']>;
    stateRoot_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    stateRoot_not_in?: InputMaybe<Array<Scalars['String']>>;
    stateRoot_not_starts_with?: InputMaybe<Scalars['String']>;
    stateRoot_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    stateRoot_starts_with?: InputMaybe<Scalars['String']>;
    stateRoot_starts_with_nocase?: InputMaybe<Scalars['String']>;
    timestamp?: InputMaybe<Scalars['BigInt']>;
    timestamp_gt?: InputMaybe<Scalars['BigInt']>;
    timestamp_gte?: InputMaybe<Scalars['BigInt']>;
    timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
    timestamp_lt?: InputMaybe<Scalars['BigInt']>;
    timestamp_lte?: InputMaybe<Scalars['BigInt']>;
    timestamp_not?: InputMaybe<Scalars['BigInt']>;
    timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    totalDifficulty?: InputMaybe<Scalars['BigInt']>;
    totalDifficulty_gt?: InputMaybe<Scalars['BigInt']>;
    totalDifficulty_gte?: InputMaybe<Scalars['BigInt']>;
    totalDifficulty_in?: InputMaybe<Array<Scalars['BigInt']>>;
    totalDifficulty_lt?: InputMaybe<Scalars['BigInt']>;
    totalDifficulty_lte?: InputMaybe<Scalars['BigInt']>;
    totalDifficulty_not?: InputMaybe<Scalars['BigInt']>;
    totalDifficulty_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
    transactionsRoot?: InputMaybe<Scalars['String']>;
    transactionsRoot_contains?: InputMaybe<Scalars['String']>;
    transactionsRoot_contains_nocase?: InputMaybe<Scalars['String']>;
    transactionsRoot_ends_with?: InputMaybe<Scalars['String']>;
    transactionsRoot_ends_with_nocase?: InputMaybe<Scalars['String']>;
    transactionsRoot_gt?: InputMaybe<Scalars['String']>;
    transactionsRoot_gte?: InputMaybe<Scalars['String']>;
    transactionsRoot_in?: InputMaybe<Array<Scalars['String']>>;
    transactionsRoot_lt?: InputMaybe<Scalars['String']>;
    transactionsRoot_lte?: InputMaybe<Scalars['String']>;
    transactionsRoot_not?: InputMaybe<Scalars['String']>;
    transactionsRoot_not_contains?: InputMaybe<Scalars['String']>;
    transactionsRoot_not_contains_nocase?: InputMaybe<Scalars['String']>;
    transactionsRoot_not_ends_with?: InputMaybe<Scalars['String']>;
    transactionsRoot_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    transactionsRoot_not_in?: InputMaybe<Array<Scalars['String']>>;
    transactionsRoot_not_starts_with?: InputMaybe<Scalars['String']>;
    transactionsRoot_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    transactionsRoot_starts_with?: InputMaybe<Scalars['String']>;
    transactionsRoot_starts_with_nocase?: InputMaybe<Scalars['String']>;
    unclesHash?: InputMaybe<Scalars['String']>;
    unclesHash_contains?: InputMaybe<Scalars['String']>;
    unclesHash_contains_nocase?: InputMaybe<Scalars['String']>;
    unclesHash_ends_with?: InputMaybe<Scalars['String']>;
    unclesHash_ends_with_nocase?: InputMaybe<Scalars['String']>;
    unclesHash_gt?: InputMaybe<Scalars['String']>;
    unclesHash_gte?: InputMaybe<Scalars['String']>;
    unclesHash_in?: InputMaybe<Array<Scalars['String']>>;
    unclesHash_lt?: InputMaybe<Scalars['String']>;
    unclesHash_lte?: InputMaybe<Scalars['String']>;
    unclesHash_not?: InputMaybe<Scalars['String']>;
    unclesHash_not_contains?: InputMaybe<Scalars['String']>;
    unclesHash_not_contains_nocase?: InputMaybe<Scalars['String']>;
    unclesHash_not_ends_with?: InputMaybe<Scalars['String']>;
    unclesHash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
    unclesHash_not_in?: InputMaybe<Array<Scalars['String']>>;
    unclesHash_not_starts_with?: InputMaybe<Scalars['String']>;
    unclesHash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
    unclesHash_starts_with?: InputMaybe<Scalars['String']>;
    unclesHash_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export type Block_Height = {
    hash?: InputMaybe<Scalars['Bytes']>;
    number?: InputMaybe<Scalars['Int']>;
    number_gte?: InputMaybe<Scalars['Int']>;
};

export enum Block_OrderBy {
    Author = 'author',
    Difficulty = 'difficulty',
    GasLimit = 'gasLimit',
    GasUsed = 'gasUsed',
    Id = 'id',
    Number = 'number',
    ParentHash = 'parentHash',
    ReceiptsRoot = 'receiptsRoot',
    Size = 'size',
    StateRoot = 'stateRoot',
    Timestamp = 'timestamp',
    TotalDifficulty = 'totalDifficulty',
    TransactionsRoot = 'transactionsRoot',
    UnclesHash = 'unclesHash',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export type Query = {
    __typename?: 'Query';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    block?: Maybe<Block>;
    blocks: Array<Block>;
};

export type Query_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type QueryBlockArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryBlocksArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Block_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Block_Filter>;
};

export type Subscription = {
    __typename?: 'Subscription';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    block?: Maybe<Block>;
    blocks: Array<Block>;
};

export type Subscription_MetaArgs = {
    block?: InputMaybe<Block_Height>;
};

export type SubscriptionBlockArgs = {
    block?: InputMaybe<Block_Height>;
    id: Scalars['ID'];
    subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionBlocksArgs = {
    block?: InputMaybe<Block_Height>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Block_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    subgraphError?: _SubgraphErrorPolicy_;
    where?: InputMaybe<Block_Filter>;
};

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

export type BlocksQueryVariables = Exact<{
    skip?: InputMaybe<Scalars['Int']>;
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Block_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    where?: InputMaybe<Block_Filter>;
    block?: InputMaybe<Block_Height>;
}>;

export type BlocksQuery = {
    __typename?: 'Query';
    blocks: Array<{ __typename?: 'Block'; id: string; number: string; timestamp: string }>;
};

export type BlockFragment = { __typename?: 'Block'; id: string; number: string; timestamp: string };

export const BlockFragmentDoc = gql`
    fragment Block on Block {
        id
        number
        timestamp
    }
`;
export const BlocksDocument = gql`
    query Blocks(
        $skip: Int
        $first: Int
        $orderBy: Block_orderBy
        $orderDirection: OrderDirection
        $where: Block_filter
        $block: Block_height
    ) {
        blocks(
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
            where: $where
            block: $block
        ) {
            ...Block
        }
    }
    ${BlockFragmentDoc}
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
    operationType?: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        Blocks(variables?: BlocksQueryVariables, requestHeaders?: Dom.RequestInit['headers']): Promise<BlocksQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<BlocksQuery>(BlocksDocument, variables, {
                        ...requestHeaders,
                        ...wrappedRequestHeaders,
                    }),
                'Blocks',
                'query',
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
