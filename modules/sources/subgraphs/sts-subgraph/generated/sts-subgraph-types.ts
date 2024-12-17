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
    id: Scalars['Bytes'];
    validators?: Maybe<Array<Validator>>;
};

export type SonicStakingValidatorsArgs = {
    first?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Validator_OrderBy>;
    orderDirection?: InputMaybe<OrderDirection>;
    skip?: InputMaybe<Scalars['Int']>;
    where?: InputMaybe<Validator_Filter>;
};

export type SonicStaking_Filter = {
    /** Filter for the block changed event. */
    _change_block?: InputMaybe<BlockChangedFilter>;
    and?: InputMaybe<Array<InputMaybe<SonicStaking_Filter>>>;
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
    validators_?: InputMaybe<Validator_Filter>;
};

export enum SonicStaking_OrderBy {
    id = 'id',
    validators = 'validators',
}

export type Subscription = {
    __typename?: 'Subscription';
    /** Access to subgraph metadata */
    _meta?: Maybe<_Meta_>;
    sonicStaking?: Maybe<SonicStaking>;
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
    sonicStaking__id = 'sonicStaking__id',
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
    skip?: Maybe<Scalars['Int']>;
    first?: Maybe<Scalars['Int']>;
    orderBy?: Maybe<Validator_OrderBy>;
    orderDirection?: Maybe<OrderDirection>;
    where?: Maybe<Validator_Filter>;
    block?: Maybe<Block_Height>;
}>;

export type ValidatorsQuery = {
    __typename?: 'Query';
    validators: Array<{ __typename?: 'Validator'; id: string; amountAssetsDelegated: string }>;
};

export type ValidatorFragment = { __typename?: 'Validator'; id: string; amountAssetsDelegated: string };

export const ValidatorFragmentDoc = gql`
    fragment Validator on Validator {
        id
        amountAssetsDelegated
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

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

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
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
