import { BalancerPoolFragment } from '../../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';

export const stable = (pool: BalancerPoolFragment) => {
    return {
        amp: pool.amp || '',
        bptPriceRate: '',
    };
};
