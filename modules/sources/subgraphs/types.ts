import { V3VaultSubgraphClient } from './balancer-v3-vault';

export type UserBalancesSubgraphClient = Pick<V3VaultSubgraphClient, 'getMetadata' | 'getAllPoolSharesWithBalance'>;
