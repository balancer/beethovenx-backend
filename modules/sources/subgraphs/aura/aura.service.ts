import { Chain } from '@prisma/client';
import { GraphQLClient } from 'graphql-request';
import { AccountSchemaFragment, PoolSchema, PoolSchemaFragment, getSdk } from './generated/aura-subgraph-types';
import { chainToChainId as chainToIdMap } from '../../../network/chain-id-to-chain';

export class AuraSubgraphService {
    private sdk: ReturnType<typeof getSdk>;

    constructor(subgraphUrl: string) {
        this.sdk = getSdk(new GraphQLClient(subgraphUrl));
    }

    public async getAllPools(chains: Chain[]): Promise<PoolSchemaFragment[]> {
        const chainIds = chains.map((chain) => parseFloat(chainToIdMap[chain]));

        const result = await this.sdk.allPools({
            chainIds: chainIds,
        });

        return result.allPools;
    }

    public async getAllUsers(): Promise<AccountSchemaFragment[]> {
        const result = await this.sdk.accounts();
        return result.accounts;
    }
}
